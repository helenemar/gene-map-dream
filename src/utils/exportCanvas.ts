import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Resolve a CSS color that may contain var() references to a concrete rgb/hex value.
 */
function resolveColor(raw: string, el: Element): string {
  if (!raw || !raw.includes('var(')) return raw;
  // Create a temp element, apply the color, read back the computed value
  const temp = document.createElement('div');
  temp.style.color = raw;
  document.body.appendChild(temp);
  const resolved = getComputedStyle(temp).color;
  document.body.removeChild(temp);
  return resolved || raw;
}

/**
 * Inline all CSS-variable-based colors in SVG elements so html2canvas can render them.
 * Returns a restore function.
 */
function inlineSvgColors(container: HTMLElement): () => void {
  const restores: (() => void)[] = [];
  const svgEls = container.querySelectorAll('svg *');

  const colorAttrs = ['stroke', 'fill', 'stop-color', 'flood-color', 'lighting-color'];

  svgEls.forEach(el => {
    colorAttrs.forEach(attr => {
      const val = el.getAttribute(attr);
      if (val && val.includes('var(')) {
        const resolved = resolveColor(val, el);
        el.setAttribute(attr, resolved);
        restores.push(() => el.setAttribute(attr, val));
      }
    });
    // Also check inline style
    const htmlEl = el as HTMLElement;
    if (htmlEl.style) {
      const styleColor = htmlEl.style.color;
      if (styleColor && styleColor.includes('var(')) {
        const resolved = resolveColor(styleColor, el);
        htmlEl.style.color = resolved;
        restores.push(() => { htmlEl.style.color = styleColor; });
      }
    }
  });

  // Also handle SVG root elements' stroke/fill on <svg> itself
  const svgRoots = container.querySelectorAll('svg');
  svgRoots.forEach(svg => {
    colorAttrs.forEach(attr => {
      const val = svg.getAttribute(attr);
      if (val && val.includes('var(')) {
        const resolved = resolveColor(val, svg);
        svg.setAttribute(attr, resolved);
        restores.push(() => svg.setAttribute(attr, val));
      }
    });
  });

  return () => restores.forEach(fn => fn());
}

/**
 * Expand all SVGs that have width:1/height:1 + overflow:visible to cover actual content.
 * html2canvas clips to the SVG element dimensions, so we need them to be large enough.
 */
function expandSvgDimensions(container: HTMLElement): () => void {
  const restores: (() => void)[] = [];
  const svgs = container.querySelectorAll('svg');

  svgs.forEach(svg => {
    const style = svg.style;
    // Detect the pattern: width=1, height=1, overflow=visible
    if (
      (style.width === '1px' || svg.getAttribute('width') === '1') &&
      (style.height === '1px' || svg.getAttribute('height') === '1') &&
      style.overflow === 'visible'
    ) {
      const origW = style.width;
      const origH = style.height;
      const origOverflow = style.overflow;

      // Set to a huge size to capture all overflow content
      style.width = '20000px';
      style.height = '20000px';
      style.overflow = 'visible';

      restores.push(() => {
        style.width = origW;
        style.height = origH;
        style.overflow = origOverflow;
      });
    }
  });

  return () => restores.forEach(fn => fn());
}

/**
 * Remove SVG masks temporarily so content renders fully opaque.
 */
function removeSvgMasks(container: HTMLElement): () => void {
  const restores: (() => void)[] = [];
  const masked = container.querySelectorAll('[mask]');

  masked.forEach(el => {
    const maskVal = el.getAttribute('mask');
    if (maskVal) {
      el.removeAttribute('mask');
      restores.push(() => el.setAttribute('mask', maskVal));
    }
  });

  return () => restores.forEach(fn => fn());
}

/**
 * Hide transient UI elements that shouldn't appear in exports (buttons, tooltips, guides).
 */
function hideTransientUI(container: HTMLElement): () => void {
  const restores: (() => void)[] = [];

  // Hide action buttons on cards (the + buttons, edit buttons, etc.)
  const buttons = container.querySelectorAll('button, [data-radix-popper-content-wrapper]');
  buttons.forEach(btn => {
    const el = btn as HTMLElement;
    const orig = el.style.display;
    el.style.display = 'none';
    restores.push(() => { el.style.display = orig; });
  });

  return () => restores.forEach(fn => fn());
}

/**
 * Prepare the content div for html2canvas capture. Returns a single restore function.
 */
function prepareForCapture(contentDiv: HTMLElement, canvasRef: HTMLDivElement) {
  const restoreColors = inlineSvgColors(contentDiv);
  const restoreSvgDims = expandSvgDimensions(contentDiv);
  const restoreMasks = removeSvgMasks(contentDiv);
  const restoreUI = hideTransientUI(contentDiv);

  // Reset transform
  const origTransform = contentDiv.style.transform;
  const origTransformOrigin = contentDiv.style.transformOrigin;
  contentDiv.style.transform = 'none';
  contentDiv.style.transformOrigin = '0 0';

  // Hide dot grid
  const origBg = canvasRef.style.backgroundImage;
  canvasRef.style.backgroundImage = 'none';

  return () => {
    contentDiv.style.transform = origTransform;
    contentDiv.style.transformOrigin = origTransformOrigin;
    canvasRef.style.backgroundImage = origBg;
    restoreUI();
    restoreMasks();
    restoreSvgDims();
    restoreColors();
  };
}

/**
 * Compute bounding box from member positions (more reliable than DOM measurement).
 */
function getMemberBounds(contentDiv: HTMLElement, padding = 60) {
  const cards = contentDiv.querySelectorAll('[data-member-card]');
  if (cards.length === 0) {
    // Fallback: try to measure from DOM
    return getDomBounds(contentDiv, padding);
  }

  const contentRect = contentDiv.getBoundingClientRect();
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  cards.forEach(card => {
    const rect = (card as HTMLElement).getBoundingClientRect();
    const x = rect.left - contentRect.left;
    const y = rect.top - contentRect.top;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + rect.width);
    maxY = Math.max(maxY, y + rect.height);
  });

  if (!isFinite(minX)) return { x: 0, y: 0, w: 800, h: 600 };

  // Add extra space for emotional links that arc outside card bounds
  const extraSpace = 120;
  return {
    x: minX - padding - extraSpace,
    y: minY - padding - extraSpace,
    w: maxX - minX + (padding + extraSpace) * 2,
    h: maxY - minY + (padding + extraSpace) * 2,
  };
}

function getDomBounds(contentDiv: HTMLElement, padding = 60) {
  const children = contentDiv.children;
  const contentRect = contentDiv.getBoundingClientRect();
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (let i = 0; i < children.length; i++) {
    const rect = (children[i] as HTMLElement).getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const x = rect.left - contentRect.left;
    const y = rect.top - contentRect.top;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + rect.width);
    maxY = Math.max(maxY, y + rect.height);
  }

  if (!isFinite(minX)) return { x: 0, y: 0, w: 800, h: 600 };
  return { x: minX - padding, y: minY - padding, w: maxX - minX + padding * 2, h: maxY - minY + padding * 2 };
}

/**
 * Core capture function used by both PNG and PDF exports.
 */
async function captureCanvas(canvasRef: HTMLDivElement): Promise<HTMLCanvasElement | null> {
  const contentDiv = canvasRef.querySelector('.absolute') as HTMLElement;
  if (!contentDiv) return null;

  const restore = prepareForCapture(contentDiv, canvasRef);

  try {
    // Small delay to let DOM settle after modifications
    await new Promise(r => setTimeout(r, 50));

    const bounds = getMemberBounds(contentDiv);

    const canvas = await html2canvas(contentDiv, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      x: bounds.x,
      y: bounds.y,
      width: bounds.w,
      height: bounds.h,
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: true,
    });

    return canvas;
  } finally {
    restore();
  }
}

// ─── Public API ─────────────────────────────────────────────────────

export async function exportAsPng(canvasRef: HTMLDivElement, fileName: string) {
  const canvas = await captureCanvas(canvasRef);
  if (!canvas) return;

  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, `${fileName}.png`);
  }, 'image/png');
}

export async function exportAsPdf(canvasRef: HTMLDivElement, fileName: string) {
  const canvas = await captureCanvas(canvasRef);
  if (!canvas) return;

  // A4 landscape dimensions in mm
  const pageW = 297;
  const pageH = 210;
  const margin = 10;
  const headerH = 14;

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header
  pdf.setFillColor(245, 245, 245);
  pdf.rect(0, 0, pageW, headerH + 4, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(30, 30, 30);
  pdf.text(fileName, margin, headerH - 2);

  // Date on the right
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(120, 120, 120);
  pdf.text(dateStr, pageW - margin, headerH - 2, { align: 'right' });

  // Thin separator line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(margin, headerH + 2, pageW - margin, headerH + 2);

  // Image area
  const imgAreaW = pageW - margin * 2;
  const imgAreaH = pageH - headerH - 4 - margin;
  const imgAreaY = headerH + 4;

  const imgData = canvas.toDataURL('image/png');
  const imgRatio = canvas.width / canvas.height;
  const areaRatio = imgAreaW / imgAreaH;

  let drawW: number, drawH: number, drawX: number, drawY: number;
  if (imgRatio > areaRatio) {
    drawW = imgAreaW;
    drawH = imgAreaW / imgRatio;
    drawX = margin;
    drawY = imgAreaY + (imgAreaH - drawH) / 2;
  } else {
    drawH = imgAreaH;
    drawW = imgAreaH * imgRatio;
    drawX = margin + (imgAreaW - drawW) / 2;
    drawY = imgAreaY;
  }

  pdf.addImage(imgData, 'PNG', drawX, drawY, drawW, drawH);
  pdf.save(`${fileName}.pdf`);
}

/**
 * Export SVG by serializing all SVG elements inside the canvas content div.
 */
export function exportAsSvg(
  canvasRef: HTMLDivElement,
  members: { x: number; y: number }[],
  cardW: number,
  cardH: number,
  fileName: string,
) {
  const contentDiv = canvasRef.querySelector('.absolute') as HTMLElement;
  if (!contentDiv) return;

  // Compute bounds from members
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  if (members.length === 0) {
    minX = 0; minY = 0; maxX = 800; maxY = 600;
  } else {
    for (const m of members) {
      minX = Math.min(minX, m.x);
      minY = Math.min(minY, m.y);
      maxX = Math.max(maxX, m.x + cardW);
      maxY = Math.max(maxY, m.y + cardH);
    }
  }
  const padding = 120;
  const bounds = {
    x: minX - padding,
    y: minY - padding,
    w: maxX - minX + padding * 2,
    h: maxY - minY + padding * 2,
  };

  // Collect all inner SVGs
  const innerSvgs = contentDiv.querySelectorAll('svg');
  let svgContent = '';

  innerSvgs.forEach(svg => {
    const clone = svg.cloneNode(true) as SVGElement;
    // Resolve CSS variables in the clone
    const elements = clone.querySelectorAll('*');
    elements.forEach(el => {
      ['stroke', 'fill', 'stop-color'].forEach(attr => {
        const val = el.getAttribute(attr);
        if (val && val.includes('var(')) {
          el.setAttribute(attr, resolveColor(val, el));
        }
      });
    });
    svgContent += clone.innerHTML;
  });

  // Capture HTML card elements as foreignObject
  const cards = contentDiv.querySelectorAll('[data-member-card]');
  cards.forEach(card => {
    const el = card as HTMLElement;
    const rect = el.getBoundingClientRect();
    const contentRect = contentDiv.getBoundingClientRect();
    const x = rect.left - contentRect.left;
    const y = rect.top - contentRect.top;

    svgContent += `<foreignObject x="${x}" y="${y}" width="${rect.width}" height="${rect.height}">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: system-ui, sans-serif; font-size: 12px;">
        ${el.innerHTML}
      </div>
    </foreignObject>`;
  });

  const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}"
  width="${bounds.w}" height="${bounds.h}">
  <style>
    text { font-family: system-ui, -apple-system, sans-serif; }
  </style>
  ${svgContent}
</svg>`;

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, `${fileName}.svg`);
}
