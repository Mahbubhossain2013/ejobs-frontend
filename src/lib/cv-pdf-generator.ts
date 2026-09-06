import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Injects print-perfect CSS styles into the CV HTML to eliminate
 * browser default headers, footers (dates, URLs, page numbers),
 * enforce full-bleed background colors, and avoid breaking items across pages.
 */
export function preparePrintableHtml(rawHtml: string): string {
  if (!rawHtml) return "";

  const printStyles = `
    <style id="cv-print-enhancement">
      @page {
        size: A4 portrait;
        margin: 0mm !important;
      }
      @media print {
        *, *:before, *:after {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 210mm !important;
          background: transparent !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .cv-page {
          width: 210mm !important;
          min-height: 297mm !important;
          margin: 0 auto !important;
          box-shadow: none !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .item-box, 
        .contact-item, 
        .entry-block, 
        .content-card, 
        .timeline-item, 
        .card-box, 
        .exp-item, 
        .edu-item, 
        .interest-card {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      }
    </style>
  `;

  if (rawHtml.includes("</head>")) {
    return rawHtml.replace("</head>", `${printStyles}</head>`);
  }
  return `${printStyles}${rawHtml}`;
}

/**
 * Triggers the browser's native print engine with enhanced styling.
 * Eliminates unwanted browser headers/footers and preserves colors.
 */
export function printCvHtml(html: string) {
  if (!html || typeof window === "undefined") return;

  const printableHtml = preparePrintableHtml(html);
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    // Fallback if popup is blocked
    window.print();
    return;
  }

  printWindow.document.open();
  printWindow.document.write(printableHtml);
  printWindow.document.close();

  const triggerPrint = () => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch {
      printWindow.print();
    }
  };

  // Wait for all images in the new window to be completely loaded
  const checkLoaded = () => {
    try {
      const images = printWindow.document.images;
      let allLoaded = true;
      for (let i = 0; i < images.length; i++) {
        if (!images[i].complete) {
          allLoaded = false;
          break;
        }
      }
      if (allLoaded) {
        setTimeout(triggerPrint, 300);
      } else {
        setTimeout(checkLoaded, 100);
      }
    } catch {
      setTimeout(triggerPrint, 500);
    }
  };

  setTimeout(checkLoaded, 200);
}

/**
 * Generates and downloads a pixel-perfect, high-DPI A4 PDF directly from HTML.
 * Produces identical visual output to the browser screen (Same-to-same).
 */
export async function downloadCvAsPdf(
  html: string,
  fileName: string = "Resume"
): Promise<void> {
  if (!html || typeof window === "undefined") {
    throw new Error("HTML content is required for PDF generation");
  }

  const printableHtml = preparePrintableHtml(html);

  // Create an off-screen iframe to render the HTML with exact A4 dimensions
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.top = "0";
  iframe.style.width = "794px"; // 210mm at 96 DPI
  iframe.style.height = "1123px"; // 297mm at 96 DPI
  iframe.style.border = "none";
  iframe.style.opacity = "0";
  iframe.style.zIndex = "-1000";
  iframe.style.pointerEvents = "none";

  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error("Unable to access iframe document");
    }

    iframeDoc.open();
    iframeDoc.write(printableHtml);
    iframeDoc.close();

    // Wait for all images in the iframe to fully load
    const images = Array.from(iframeDoc.images);
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          // Timeout fallback in case image fails to trigger events
          setTimeout(() => resolve(), 3000);
        });
      })
    );

    // Wait for custom fonts to load
    if (iframeDoc.fonts && iframeDoc.fonts.ready) {
      try {
        await iframeDoc.fonts.ready;
      } catch {}
    }

    // Give browser time to complete layout & paints
    await new Promise((resolve) => setTimeout(resolve, 350));

    const target =
      (iframeDoc.querySelector(".cv-page") as HTMLElement) ||
      (iframeDoc.body as HTMLElement);

    // Render using html2canvas at scale: 2 (crisp, retina 300 DPI equivalent)
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight, undefined, "FAST");
    heightLeft -= pageHeight;

    // Subsequent pages if CV exceeds single page
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;
    }

    // Sanitize filename
    const safeName = fileName
      .replace(/[^a-zA-Z0-9_\-\u0980-\u09FF\s]/g, "")
      .trim()
      .replace(/\s+/g, "_") || "My_CV";

    pdf.save(`${safeName}.pdf`);
  } finally {
    // Clean up temporary iframe
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  }
}
