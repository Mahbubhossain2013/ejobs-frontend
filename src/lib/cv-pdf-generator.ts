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
        .interest-card,
        .cv-signature-section,
        .signature-section,
        .signature-box {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      }

      /* Readability booster: Increase font sizes by 2px across templates */
      .left-desc { font-size: 12px !important; line-height: 1.6 !important; }
      .bullet-list-left li { font-size: 12.5px !important; }
      .contact-item { font-size: 12.5px !important; }
      .contact-icon { font-size: 12px !important; }
      .sec-orange { font-size: 15px !important; }
      .sec-black { font-size: 16px !important; }
      .item-title { font-size: 14px !important; }
      .item-sub { font-size: 13px !important; }
      .item-desc { font-size: 12px !important; line-height: 1.5 !important; }
      .bullet-list-right li { font-size: 13px !important; }
      .interest-name { font-size: 10.5px !important; }
      .subtitle-left { font-size: 15px !important; }
      .name-title-left { font-size: 32px !important; }

      /* Signature Styling */
      .cv-signature-section, .signature-section {
        display: flex !important;
        justify-content: flex-end !important;
        width: 100% !important;
        margin-top: 24px !important;
        padding-top: 8px !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      /* Photo & Image print/canvas integrity */
      img {
        max-width: 100% !important;
        image-rendering: -webkit-optimize-contrast !important;
      }
      .avatar img, .photo-frame img, .photo-box img, .profile-photo img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        display: block !important;
      }
    </style>
  `;

  let processedHtml = rawHtml;

  // If HTML doesn't have signature block yet, inject a fallback signature block
  if (!processedHtml.includes("cv-signature-section") && !processedHtml.includes("signature-box")) {
    const fallbackSig = `
      <div class="cv-signature-section" style="margin-top: 24px; padding-top: 8px; display: flex; justify-content: flex-end; page-break-inside: avoid !important; break-inside: avoid !important; width: 100%;">
        <div style="text-align: center; min-width: 190px; display: inline-block;">
          <div style="height: 35px;"></div>
          <div style="border-top: 1.5px solid #334155; width: 180px; margin: 0 auto 5px auto;"></div>
          <div style="font-size: 13px; font-weight: 700; color: #1e293b; letter-spacing: 0.3px;">Authorized Signature</div>
          <div style="font-size: 10.5px; color: #64748b; margin-top: 2px;">স্বাক্ষর ও তারিখ / Signature & Date</div>
        </div>
      </div>
    `;

    if (/(<div[^>]*class=['"][^'"]*(?:main-content|content-right|right-column|col-right|main_column|content-main|right-panel|main-panel|right-col|main)[^'"]*['"][^>]*>[\s\S]*?)(<\/div>\s*<\/div>)/i.test(processedHtml)) {
      processedHtml = processedHtml.replace(/(<div[^>]*class=['"][^'"]*(?:main-content|content-right|right-column|col-right|main_column|content-main|right-panel|main-panel|right-col|main)[^'"]*['"][^>]*>[\s\S]*?)(<\/div>\s*<\/div>)/i, `$1\n${fallbackSig}\n$2`);
    } else if (/(<\/div>\s*<\/body>)/i.test(processedHtml)) {
      processedHtml = processedHtml.replace(/(<\/div>\s*<\/body>)/i, `${fallbackSig}\n$1`);
    } else if (processedHtml.includes("</body>")) {
      processedHtml = processedHtml.replace("</body>", `${fallbackSig}\n</body>`);
    }
  }

  if (processedHtml.includes("</head>")) {
    return processedHtml.replace("</head>", `${printStyles}</head>`);
  }
  return `${printStyles}${processedHtml}`;
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
 * Converts any image source (remote URL, relative URL, blob URL, or WebP data URL)
 * into a pure, same-origin Base64 PNG/JPEG data URL so html2canvas can paint it
 * directly without CORS blocks, network delays, or WebP compatibility issues.
 */
async function toBase64PngDataUrl(src: string): Promise<string> {
  if (!src) return src;

  // 1. Standard PNG / JPEG data URLs are already safe and canvas-compatible
  if (src.startsWith("data:image/png") || src.startsWith("data:image/jpeg")) {
    return src;
  }

  // 2. If it's a data URL of other types (e.g. data:image/webp)
  if (src.startsWith("data:")) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width || 300;
          canvas.height = img.naturalHeight || img.height || 300;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const png = canvas.toDataURL("image/png");
            if (png && png.length > 50) {
              resolve(png);
              return;
            }
          }
        } catch {}
        resolve(src);
      };
      img.onerror = () => resolve(src);
      img.src = src;
    });
  }

  // 3. Remote or relative URLs: try direct fetch, then proxy route
  const candidateUrls: string[] = [src];
  if (src.startsWith("http://") || src.startsWith("https://")) {
    candidateUrls.push(`/cv/image-proxy?url=${encodeURIComponent(src)}`);
  } else if (src.startsWith("/storage/")) {
    candidateUrls.push(src);
    if (typeof window !== "undefined") {
      candidateUrls.push(`/cv/image-proxy?url=${encodeURIComponent(window.location.origin + src)}`);
    }
  }

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, { mode: "cors", cache: "force-cache" });
      if (res.ok) {
        const blob = await res.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || "");
          reader.onerror = () => resolve("");
          reader.readAsDataURL(blob);
        });

        if (base64) {
          if (base64.startsWith("data:image/webp")) {
            return await toBase64PngDataUrl(base64);
          }
          return base64;
        }
      }
    } catch {
      // try next candidate
    }
  }

  // 4. Fallback: try loading into Image element directly and drawing to canvas
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 300;
        canvas.height = img.naturalHeight || 300;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
          return;
        }
      } catch {}
      resolve(src);
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

/**
 * Generates and downloads a pixel-perfect, high-DPI A4 PDF directly from HTML.
 * Converts all images to inline Base64 data URLs before rendering to guarantee
 * photos, signatures, and logos are never omitted by CORS or browser sandbox rules.
 */
export async function downloadCvAsPdf(
  html: string,
  fileName: string = "Resume"
): Promise<void> {
  if (!html || typeof window === "undefined") {
    throw new Error("HTML content is required for PDF generation");
  }

  // Dynamic import on demand
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const printableHtml = preparePrintableHtml(html);

  // Create an iframe to render the HTML with exact A4 dimensions
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "0";
  iframe.style.top = "0";
  iframe.style.width = "794px"; // 210mm at 96 DPI
  iframe.style.height = "1123px"; // 297mm at 96 DPI
  iframe.style.border = "none";
  iframe.style.opacity = "0.01";
  iframe.style.zIndex = "-99999";
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

    // 1. Process all <img> elements inside iframeDoc to inline base64 PNGs
    const imgElements = Array.from(iframeDoc.querySelectorAll("img"));
    await Promise.all(
      imgElements.map(async (img) => {
        const src = img.getAttribute("src") || img.src;
        if (!src) return;

        try {
          const base64 = await toBase64PngDataUrl(src);
          if (base64 && base64.startsWith("data:image/")) {
            img.src = base64;
            img.removeAttribute("crossorigin");
          }
        } catch {
          // keep original
        }
      })
    );

    // 2. Wait for all images in the iframe to fully decode & report naturalWidth > 0
    await Promise.all(
      Array.from(iframeDoc.images).map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise<void>((resolve) => {
          if (typeof img.decode === "function") {
            img.decode().then(resolve).catch(() => resolve());
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
          setTimeout(() => resolve(), 3000);
        });
      })
    );

    // 3. Wait for custom fonts to load
    if (iframeDoc.fonts && iframeDoc.fonts.ready) {
      try {
        await iframeDoc.fonts.ready;
      } catch {}
    }

    await new Promise((resolve) => setTimeout(resolve, 350));

    const target =
      (iframeDoc.querySelector(".cv-page") as HTMLElement) ||
      (iframeDoc.body as HTMLElement);

    const naturalHeight = Math.max(
      target.scrollHeight,
      target.offsetHeight,
      iframeDoc.body.scrollHeight,
      1123
    );
    iframe.style.height = `${naturalHeight + 60}px`;

    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      logging: false,
      windowWidth: 794,
      windowHeight: naturalHeight,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight, undefined, "FAST");
    heightLeft -= pageHeight;

    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;
    }

    const safeName = fileName
      .replace(/[^a-zA-Z0-9_\-\u0980-\u09FF\s]/g, "")
      .trim()
      .replace(/\s+/g, "_") || "My_CV";

    pdf.save(`${safeName}.pdf`);
  } finally {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  }
}
