import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Compute the bounding box of all members on the canvas.
 */
function getContentBounds(members: { x: number; y: number }[], cardW: number, cardH: number, padding = 60) {
  if (members.length === 0) return { x: 0, y: 0, w: 800, h: 600 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const m of members) {
    minX = Math.min(minX, m.x);
    minY = Math.min(minY, m.y);
    maxX = Math.max(maxX, m.x + cardW);
    maxY = Math.max(maxY, m.y + cardH);
  }
  return {
    x: minX - padding,
    y: minY - padding,
    w: maxX - minX + cardW + padding * 2 - cardW,
    h: maxY - minY + cardH + padding * 2 - cardH,
  };
}

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
 * Export the canvas content div as PNG using html2canvas.
 * @param canvasRef - ref to the outer canvas container
 * @param contentDiv - the inner transformed div (first child of canvasRef)
 * @param fileName - base file name (without extension)
 */
/**
 * Compute the actual rendered bounding box of all child elements inside a container.
 */
function getRenderedBounds(contentDiv: HTMLElement, padding = 40) {
  const children = contentDiv.querySelectorAll('[data-member-card], svg, [class*="absolute"]');
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  children.forEach(child => {
    const el = child as HTMLElement;
    // Skip the container itself
    if (el === contentDiv) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const contentRect = contentDiv.getBoundingClientRect();
    const x = rect.left - contentRect.left;
    const y = rect.top - contentRect.top;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + rect.width);
    maxY = Math.max(maxY, y + rect.height);
  });

  if (!isFinite(minX)) return { x: 0, y: 0, w: 800, h: 600 };
  return {
    x: minX - padding,
    y: minY - padding,
    w: maxX - minX + padding * 2,
    h: maxY - minY + padding * 2,
  };
}

export async function exportAsPng(
  canvasRef: HTMLDivElement,
  fileName: string,
) {
  const contentDiv = canvasRef.querySelector('.absolute') as HTMLElement;
  if (!contentDiv) return;

  // Temporarily reset transform for clean capture
  const originalTransform = contentDiv.style.transform;
  const originalTransformOrigin = contentDiv.style.transformOrigin;
  contentDiv.style.transform = 'none';
  contentDiv.style.transformOrigin = '0 0';

  const originalBg = canvasRef.style.backgroundImage;
  canvasRef.style.backgroundImage = 'none';

  try {
    // Compute actual content bounds after resetting transform
    const bounds = getRenderedBounds(contentDiv);

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
    });

    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${fileName}.png`);
    }, 'image/png');
  } finally {
    contentDiv.style.transform = originalTransform;
    contentDiv.style.transformOrigin = originalTransformOrigin;
    canvasRef.style.backgroundImage = originalBg;
  }
}

/**
 * Export the canvas content as a PDF in A4 landscape with a header showing the file name.
 */
export async function exportAsPdf(
  canvasRef: HTMLDivElement,
  fileName: string,
) {
  const contentDiv = canvasRef.querySelector('.absolute') as HTMLElement;
  if (!contentDiv) return;

  // Temporarily reset transform for clean capture
  const originalTransform = contentDiv.style.transform;
  const originalTransformOrigin = contentDiv.style.transformOrigin;
  contentDiv.style.transform = 'none';
  contentDiv.style.transformOrigin = '0 0';

  const originalBg = canvasRef.style.backgroundImage;
  canvasRef.style.backgroundImage = 'none';

  try {
    const canvas = await html2canvas(contentDiv, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      width: contentDiv.scrollWidth,
      height: contentDiv.scrollHeight,
    });

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
      // Fit by width
      drawW = imgAreaW;
      drawH = imgAreaW / imgRatio;
      drawX = margin;
      drawY = imgAreaY + (imgAreaH - drawH) / 2;
    } else {
      // Fit by height
      drawH = imgAreaH;
      drawW = imgAreaH * imgRatio;
      drawX = margin + (imgAreaW - drawW) / 2;
      drawY = imgAreaY;
    }

    pdf.addImage(imgData, 'PNG', drawX, drawY, drawW, drawH);
    pdf.save(`${fileName}.pdf`);
  } finally {
    contentDiv.style.transform = originalTransform;
    contentDiv.style.transformOrigin = originalTransformOrigin;
    canvasRef.style.backgroundImage = originalBg;
  }
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

  const bounds = getContentBounds(members, cardW, cardH, 80);

  // Collect all inner SVGs
  const innerSvgs = contentDiv.querySelectorAll('svg');
  let svgContent = '';

  innerSvgs.forEach(svg => {
    // Clone and extract inner content
    const clone = svg.cloneNode(true) as SVGElement;
    svgContent += clone.innerHTML;
  });

  // Also capture HTML card elements by rendering them as foreignObject
  const cards = contentDiv.querySelectorAll('[data-member-card]');
  cards.forEach(card => {
    const el = card as HTMLElement;
    const rect = el.getBoundingClientRect();
    const contentRect = contentDiv.getBoundingClientRect();
    const x = (rect.left - contentRect.left);
    const y = (rect.top - contentRect.top);
    
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
