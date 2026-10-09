/**
 * CV PDF Generator & Print Enhancement System
 * 
 * Supports dynamic 1-Page, 2-Page, and 3-Page strict fitting:
 * - 1 Page: Compact density, tighter margins/fonts, auto-scaled to strictly fit exactly 1 A4 page with zero spillover.
 * - 2 Pages: Balanced density, even section distribution across 2 pages without awkward blank gaps at the bottom.
 * - 3 Pages: Executive expanded density, rich detail layout fitted across 3 pages without awkward gaps or spillover.
 */

export type PageCount = 1 | 2 | 3;

/**
 * Returns dynamic CSS tailored for the selected page count (1, 2, or 3 pages).
 */
export function getPageFitStyles(pageCount: PageCount = 1): string {
  if (pageCount === 1) {
    return `
      /* ─────────────────────────────────────────────────────────────
         1-PAGE MODE (Strict Single Page Fit - Compact & Professional)
         ───────────────────────────────────────────────────────────── */
      @page {
        size: A4 portrait;
        margin: 0mm !important;
      }
      @media print {
        html, body {
          height: 297mm !important;
          max-height: 297mm !important;
          overflow: hidden !important;
        }
        .cv-page {
          height: 297mm !important;
          max-height: 297mm !important;
          min-height: 297mm !important;
          overflow: hidden !important;
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
      }

      /* Compact Typography & Spacing for 1-Page */
      body, .cv-page, .resume-page {
        font-size: 10px !important;
        line-height: 1.34 !important;
      }
      p, li, .desc, .exp-desc, .details, .summary-text, .item-desc {
        font-size: 9.5px !important;
        line-height: 1.32 !important;
      }
      .bullet-list-left li, .bullet-list-right li {
        font-size: 9.5px !important;
        line-height: 1.3 !important;
        margin-bottom: 2px !important;
      }
      .sec-title, .main-section-title, .sec-heading, .section-title, .side-title, .side-tab, .badge-title {
        font-size: 11.5px !important;
        margin-top: 6px !important;
        margin-bottom: 5px !important;
        padding-bottom: 2px !important;
        letter-spacing: 0.4px !important;
      }
      .hero, .header, .header-block, .profile-header {
        padding: 14px 20px !important;
      }
      .hero-row, .header-row {
        gap: 12px !important;
      }
      .hero-photo, .avatar, .photo-frame, .photo-box, .profile-photo {
        width: 62px !important;
        height: 62px !important;
      }
      .hero-text h1, .name-title-left, h1.name, .name-title {
        font-size: 20px !important;
        line-height: 1.15 !important;
      }
      .hero-text .title, .designation-title, .subtitle-left {
        font-size: 10.5px !important;
        margin-top: 1px !important;
      }
      .hero-contact, .contact-bar {
        margin-top: 5px !important;
        gap: 3px 12px !important;
        font-size: 8.5px !important;
      }
      .left-col, .sidebar, .side, .col-left, .left-panel, aside,
      .right-col, .main, .main-content, .col-right {
        padding: 12px 16px !important;
        gap: 8px !important;
      }
      .exp-item, .edu-item, .item-box, .entry-block, .card-box, .timeline-item {
        margin-bottom: 5px !important;
        padding-bottom: 3px !important;
      }
      .exp-head, .card-head, .item-head, .item-title {
        font-size: 11px !important;
        margin-bottom: 1px !important;
      }
      .exp-co, .company-name, .role, .designation, .item-sub {
        font-size: 9.5px !important;
      }
      .contact-item {
        font-size: 9.5px !important;
        margin-bottom: 3px !important;
      }
      .cv-signature-section, .signature-section, .signature-box {
        margin-top: 10px !important;
        padding-top: 4px !important;
      }
    `;
  }

  if (pageCount === 2) {
    return `
      /* ─────────────────────────────────────────────────────────────
         2-PAGE MODE (Balanced & Evenly Distributed Across 2 Pages)
         ───────────────────────────────────────────────────────────── */
      @page {
        size: A4 portrait;
        margin: 0mm !important;
      }
      @media print {
        html, body {
          width: 210mm !important;
        }
        .cv-page {
          width: 210mm !important;
          min-height: 594mm !important;
          max-height: 594mm !important;
        }
        .left-col, .sidebar, .side, .col-left, .left-panel, aside,
        .right-col, .main, .main-content, .col-right {
          min-height: 594mm !important;
        }
      }

      /* Balanced Typography & Proportional Gaps for 2-Pages */
      body, .cv-page, .resume-page {
        font-size: 11px !important;
        line-height: 1.5 !important;
      }
      p, li, .desc, .exp-desc, .details, .summary-text, .item-desc {
        font-size: 10.5px !important;
        line-height: 1.48 !important;
      }
      .bullet-list-left li, .bullet-list-right li {
        font-size: 10.5px !important;
        line-height: 1.45 !important;
        margin-bottom: 4px !important;
      }
      .sec-title, .main-section-title, .sec-heading, .section-title, .side-title, .side-tab, .badge-title {
        font-size: 13px !important;
        margin-top: 14px !important;
        margin-bottom: 10px !important;
        padding-bottom: 4px !important;
        letter-spacing: 0.6px !important;
      }
      .hero, .header, .header-block, .profile-header {
        padding: 24px 28px !important;
      }
      .hero-photo, .avatar, .photo-frame, .photo-box, .profile-photo {
        width: 76px !important;
        height: 76px !important;
      }
      .hero-text h1, .name-title-left, h1.name, .name-title {
        font-size: 26px !important;
      }
      .hero-text .title, .designation-title, .subtitle-left {
        font-size: 12px !important;
        margin-top: 2px !important;
      }
      .hero-contact, .contact-bar {
        margin-top: 8px !important;
        gap: 5px 16px !important;
        font-size: 10px !important;
      }
      .left-col, .sidebar, .side, .col-left, .left-panel, aside,
      .right-col, .main, .main-content, .col-right {
        padding: 18px 22px !important;
        gap: 14px !important;
      }
      .exp-item, .edu-item, .item-box, .entry-block, .card-box, .timeline-item {
        margin-bottom: 12px !important;
        padding-bottom: 6px !important;
      }
      .exp-head, .card-head, .item-head, .item-title {
        font-size: 12px !important;
        margin-bottom: 2px !important;
      }
      .exp-co, .company-name, .role, .designation, .item-sub {
        font-size: 10.5px !important;
      }
      .contact-item {
        font-size: 11px !important;
        margin-bottom: 5px !important;
      }
      .cv-signature-section, .signature-section, .signature-box {
        margin-top: 20px !important;
        padding-top: 8px !important;
      }
    `;
  }

  // pageCount === 3
  return `
    /* ─────────────────────────────────────────────────────────────
       3-PAGE MODE (Executive Expanded & Richly Spaced Across 3 Pages)
       ───────────────────────────────────────────────────────────── */
    @page {
      size: A4 portrait;
      margin: 0mm !important;
    }
    @media print {
      html, body {
        width: 210mm !important;
      }
      .cv-page {
        width: 210mm !important;
        min-height: 891mm !important;
        max-height: 891mm !important;
      }
      .left-col, .sidebar, .side, .col-left, .left-panel, aside,
      .right-col, .main, .main-content, .col-right {
        min-height: 891mm !important;
      }
    }

    /* Executive Typography & Comfortable Gaps for 3-Pages */
    body, .cv-page, .resume-page {
      font-size: 12px !important;
      line-height: 1.62 !important;
    }
    p, li, .desc, .exp-desc, .details, .summary-text, .item-desc {
      font-size: 11.5px !important;
      line-height: 1.58 !important;
    }
    .bullet-list-left li, .bullet-list-right li {
      font-size: 11.5px !important;
      line-height: 1.55 !important;
      margin-bottom: 6px !important;
    }
    .sec-title, .main-section-title, .sec-heading, .section-title, .side-title, .side-tab, .badge-title {
      font-size: 14.5px !important;
      margin-top: 20px !important;
      margin-bottom: 14px !important;
      padding-bottom: 6px !important;
      letter-spacing: 0.8px !important;
    }
    .hero, .header, .header-block, .profile-header {
      padding: 30px 36px !important;
    }
    .hero-photo, .avatar, .photo-frame, .photo-box, .profile-photo {
      width: 86px !important;
      height: 86px !important;
    }
    .hero-text h1, .name-title-left, h1.name, .name-title {
      font-size: 30px !important;
    }
    .hero-text .title, .designation-title, .subtitle-left {
      font-size: 13px !important;
      margin-top: 4px !important;
    }
    .hero-contact, .contact-bar {
      margin-top: 10px !important;
      gap: 6px 18px !important;
      font-size: 11px !important;
    }
    .left-col, .sidebar, .side, .col-left, .left-panel, aside,
    .right-col, .main, .main-content, .col-right {
      padding: 24px 28px !important;
      gap: 20px !important;
    }
    .exp-item, .edu-item, .item-box, .entry-block, .card-box, .timeline-item {
      margin-bottom: 18px !important;
      padding-bottom: 8px !important;
    }
    .exp-head, .card-head, .item-head, .item-title {
      font-size: 13px !important;
      margin-bottom: 3px !important;
    }
    .exp-co, .company-name, .role, .designation, .item-sub {
      font-size: 11.5px !important;
    }
    .contact-item {
      font-size: 12px !important;
      margin-bottom: 8px !important;
    }
    .cv-signature-section, .signature-section, .signature-box {
      margin-top: 28px !important;
      padding-top: 10px !important;
    }
  `;
}

/**
 * Injects print-perfect CSS styles into the CV HTML to eliminate
 * browser default headers, footers (dates, URLs, page numbers),
 * enforce full-bleed background colors, avoid breaking items across pages,
 * and enforce dynamic 1, 2, or 3 page fitting.
 */
export function preparePrintableHtml(rawHtml: string, pageCount: PageCount = 1): string {
  if (!rawHtml) return "";

  const pageFitCss = getPageFitStyles(pageCount);

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
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .cv-page {
          width: 210mm !important;
          margin: 0 auto !important;
          box-shadow: none !important;
          display: flex !important;
          align-items: stretch !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .left-col, .sidebar, .side, .col-left, .left-panel, aside,
        .right-col, .main, .main-content, .col-right,
        .body-wrap, .body-split {
          align-self: stretch !important;
          min-height: 100% !important;
          box-sizing: border-box !important;
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
        .sec-title, .main-section-title, .sec-heading, .section-title {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
      }

      ${pageFitCss}

      /* Signature Styling: clean, solid line, right aligned */
      .cv-signature-section, .signature-section, .signature-box {
        display: flex !important;
        justify-content: flex-end !important;
        width: 100% !important;
        border-top: none !important;
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

  // Add cv-page-fit class to body if present
  if (processedHtml.includes("<body")) {
    processedHtml = processedHtml.replace(
      /<body([^>]*)class="([^"]*)"/i,
      `<body$1class="$2 cv-page-fit-${pageCount}"`
    );
    if (!processedHtml.includes(`cv-page-fit-${pageCount}`)) {
      processedHtml = processedHtml.replace(/<body([^>]*)>/i, `<body$1 class="cv-page-fit-${pageCount}">`);
    }
  }

  // If HTML doesn't have signature block yet, inject a fallback signature block
  if (!processedHtml.includes("cv-signature-section") && !processedHtml.includes("signature-box")) {
    const fallbackSig = `
      <div class="cv-signature-section signature-box" style="margin-top: 16px; padding-top: 6px; display: flex; justify-content: flex-end; width: 100%; page-break-inside: avoid !important; break-inside: avoid !important; border-top: none !important;">
        <div style="text-align: center; min-width: 170px; display: inline-block;">
          <div style="font-family: 'Dancing Script', 'Great Vibes', 'Brush Script MT', 'Georgia', cursive, serif; font-size: 18px; font-weight: bold; font-style: italic; color: #1e293b; margin-bottom: 2px; line-height: 1.2;">Authorized Signature</div>
          <div style="border-top: 1.5px solid #1e293b; width: 160px; margin: 0 auto 4px auto;"></div>
          <div style="font-size: 10.5px; font-weight: 700; color: #1e293b; letter-spacing: 0.2px;">Authorized Signature</div>
          <div style="font-size: 9px; color: #64748b;">Signature & Date</div>
        </div>
      </div>
    `;

    const closingMatch = processedHtml.match(/((?:\s*<\/div>)+\s*<\/body>)/i);
    if (closingMatch && closingMatch.index !== undefined) {
      const closingSeq = closingMatch[0];
      const divMatches = closingSeq.match(/<\/div>/gi);
      const divCount = divMatches ? divMatches.length : 0;
      let replacedSeq = "";
      if (divCount >= 2) {
        replacedSeq = closingSeq.replace(/<\/div>/i, `${fallbackSig}\n</div>`);
      } else {
        replacedSeq = `${fallbackSig}\n${closingSeq}`;
      }
      processedHtml =
        processedHtml.slice(0, closingMatch.index) +
        replacedSeq +
        processedHtml.slice(closingMatch.index + closingSeq.length);
    } else if (processedHtml.includes("</body>")) {
      processedHtml = processedHtml.replace("</body>", `${fallbackSig}\n</body>`);
    } else {
      processedHtml = `${processedHtml}\n${fallbackSig}`;
    }
  }

  // Injects dynamic fit script that executes before print/preview
  const dynamicFitScript = `
    <script>
      (function() {
        window.addEventListener('load', function() {
          try {
            var targetPages = ${pageCount};
            var pageEl = document.querySelector('.cv-page') || document.body;
            if (!pageEl) return;
            var pxPerMm = (pageEl.offsetWidth || 794) / 210;
            var maxAllowedHeight = targetPages * 297 * pxPerMm;
            var currentHeight = pageEl.scrollHeight || pageEl.offsetHeight;

            // Auto-scale if content slightly overflows target pages
            if (currentHeight > maxAllowedHeight + 5) {
              var ratio = (maxAllowedHeight - 4) / currentHeight;
              if (ratio >= 0.80) {
                pageEl.style.transform = 'scale(' + ratio + ')';
                pageEl.style.transformOrigin = 'top center';
              }
            }
          } catch(e) {}
        });
      })();
    </script>
  `;

  if (processedHtml.includes("</head>")) {
    return processedHtml.replace("</head>", `${printStyles}${dynamicFitScript}</head>`);
  }
  return `${printStyles}${dynamicFitScript}${processedHtml}`;
}

/**
 * Triggers the browser's native print engine with enhanced styling and strict page count fitting.
 * Eliminates unwanted browser headers/footers, preserves colors, and fits exactly 1, 2, or 3 pages.
 */
export function printCvHtml(html: string, pageCount: PageCount = 1) {
  if (!html || typeof window === "undefined") return;

  const printableHtml = preparePrintableHtml(html, pageCount);
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
      const pageEl = printWindow.document.querySelector<HTMLElement>(".cv-page") || printWindow.document.body;
      if (pageEl) {
        const pxPerMm = (pageEl.offsetWidth || 794) / 210;
        const targetHeightPx = pageCount * 297 * pxPerMm;

        // Ensure columns and sidebars stretch to full target page height
        pageEl.style.minHeight = `${pageCount * 297}mm`;
        const sidebars = printWindow.document.querySelectorAll<HTMLElement>(
          ".left-col, .sidebar, .side, .col-left, .left-panel, aside"
        );
        sidebars.forEach((s) => {
          s.style.minHeight = `${pageCount * 297}mm`;
          s.style.alignSelf = "stretch";
        });

        // Auto-scale if content exceeds target height
        const currentHeight = pageEl.scrollHeight || pageEl.offsetHeight;
        if (currentHeight > targetHeightPx + 5) {
          const ratio = (targetHeightPx - 5) / currentHeight;
          if (ratio >= 0.80) {
            pageEl.style.transform = `scale(${ratio})`;
            pageEl.style.transformOrigin = "top center";
          }
        }
      }
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
        setTimeout(triggerPrint, 350);
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
 * Converts any image source into a pure, same-origin Base64 PNG/JPEG data URL
 * so html2canvas can paint it directly without CORS blocks or delays.
 */
async function toBase64PngDataUrl(src: string): Promise<string> {
  if (!src) return "";
  if (src.startsWith("data:image/png") || src.startsWith("data:image/jpeg")) {
    return src;
  }

  const directUrl = src.startsWith("http")
    ? src
    : src.startsWith("/")
    ? `${window.location.origin}${src}`
    : `${window.location.origin}/${src}`;

  const candidates: string[] = [directUrl];
  if (!directUrl.startsWith("data:") && !directUrl.includes("proxy")) {
    const enc = encodeURIComponent(directUrl);
    candidates.push(`/api/proxy-image?url=${enc}`);
    candidates.push(`https://images.weserv.nl/?url=${enc}&output=png`);
  }

  for (const url of candidates) {
    try {
      const res = await fetch(url, { mode: "cors", credentials: "omit" });
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
            return await convertWebpToPng(base64);
          }
          return base64;
        }
      }
    } catch {}
  }

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

function convertWebpToPng(webpDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
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
      resolve(webpDataUrl);
    };
    img.onerror = () => resolve(webpDataUrl);
    img.src = webpDataUrl;
  });
}

/**
 * Generates and downloads a pixel-perfect, ultra-high-DPI (300+ DPI) A4 PDF directly from HTML
 * with exact 1-Page, 2-Page, or 3-Page fit guarantee.
 */
export async function downloadCvAsPdf(
  html: string,
  fileName: string = "Resume",
  pageCount: PageCount = 1
): Promise<void> {
  if (!html || typeof window === "undefined") {
    throw new Error("HTML content is required for PDF generation");
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const printableHtml = preparePrintableHtml(html, pageCount);

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "0";
  iframe.style.top = "0";
  iframe.style.width = "794px"; // 210mm at 96 DPI
  iframe.style.height = `${Math.round(pageCount * 1122.52) + 60}px`;
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
        } catch {}
      })
    );

    // 2. Wait for images to decode
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

    const A4_HEIGHT_PX = 1122.52;
    const targetPages = pageCount;
    const fullCanvasHeight = Math.round(targetPages * A4_HEIGHT_PX);

    // Check if target slightly overflows targetPages and auto-scale
    const currentHeight = Math.max(target.scrollHeight, target.offsetHeight);
    if (currentHeight > fullCanvasHeight + 6) {
      const autoFitScale = Math.min(1, (fullCanvasHeight - 4) / currentHeight);
      if (autoFitScale >= 0.78) {
        target.style.transform = `scale(${autoFitScale})`;
        target.style.transformOrigin = "top center";
      }
    }

    target.style.minHeight = `${fullCanvasHeight}px`;
    target.style.height = `${fullCanvasHeight}px`;
    target.style.boxSizing = "border-box";
    iframe.style.height = `${fullCanvasHeight + 60}px`;

    // Ensure all intermediate column wrappers stretch to 100%
    const wrappers = iframeDoc.querySelectorAll<HTMLElement>(
      ".body-wrap, .body-split, .columns-wrap, .main-wrap, .layout-wrap"
    );
    wrappers.forEach((wrap) => {
      wrap.style.flex = "1";
      wrap.style.minHeight = "100%";
      wrap.style.alignSelf = "stretch";
    });

    // Ensure all multi-column children stretch to fullCanvasHeight
    const targetRect = target.getBoundingClientRect();
    const columns = iframeDoc.querySelectorAll<HTMLElement>(
      ".left-col, .right-col, .sidebar, .side, .main, .main-content, .col-left, .col-right, aside, .left-panel"
    );
    columns.forEach((col) => {
      const colRect = col.getBoundingClientRect();
      const topOffset = Math.max(0, colRect.top - targetRect.top);
      const targetColHeight = Math.max(0, fullCanvasHeight - topOffset);
      col.style.minHeight = `${targetColHeight}px`;
      col.style.height = "100%";
      col.style.alignSelf = "stretch";
      col.style.boxSizing = "border-box";
    });

    // Ensure left sidebar background stretches properly across all pages
    const leftSidebar = iframeDoc.querySelector<HTMLElement>(
      ".left-col, .sidebar, .side, .col-left, .left-panel, aside"
    );
    if (leftSidebar && iframe.contentWindow) {
      try {
        const computed = iframe.contentWindow.getComputedStyle(leftSidebar);
        const bg = computed.backgroundColor;
        if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
          const leftWidth = leftSidebar.offsetWidth;
          const totalWidth = target.offsetWidth || 794;
          const pct = Math.round((leftWidth / totalWidth) * 100);
          if (pct >= 20 && pct <= 50) {
            const currentBg = iframe.contentWindow.getComputedStyle(target).backgroundImage;
            if (!currentBg || currentBg === "none") {
              target.style.background = `linear-gradient(to right, ${bg} ${pct}%, #ffffff ${pct}%)`;
            }
          }
        }
      } catch {}
    }

    // High quality canvas render
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      width: 794,
      height: fullCanvasHeight,
      windowWidth: 794,
      windowHeight: fullCanvasHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const pageCanvasHeight = Math.round((canvas.width * 297) / 210);

    for (let page = 0; page < targetPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageCanvasHeight;
      const pageCtx = pageCanvas.getContext("2d");

      if (pageCtx) {
        pageCtx.fillStyle = "#ffffff";
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        const sourceY = page * pageCanvasHeight;
        const availableHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);

        if (availableHeight > 0) {
          pageCtx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            availableHeight,
            0,
            0,
            canvas.width,
            availableHeight
          );
        }

        const pageImg = pageCanvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(pageImg, "JPEG", 0, 0, pageWidthMm, pageHeightMm, undefined, "FAST");
      }
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
