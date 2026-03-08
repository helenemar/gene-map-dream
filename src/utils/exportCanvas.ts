import { jsPDF } from 'jspdf';

// ─── Helpers ────────────────────────────────────────────────────────

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
 * Resolve a CSS color that may contain var() or hsl(var(...)) to a concrete rgb value.
 */
function resolveColor(raw: string): string {
  if (!raw || (!raw.includes('var(') && !raw.includes('hsl('))) return raw;
  const temp = document.createElement('div');
  temp.style.color = raw;
  document.body.appendChild(temp);
  const resolved = getComputedStyle(temp).color;
  document.body.removeChild(temp);
  return resolved || raw;
}

/**
 * Deep-resolve all CSS variable colors in a cloned SVG element tree.
 */
function resolveAllColors(svgClone: SVGElement, svgOriginal: SVGElement) {
  const colorAttrs = ['stroke', 'fill', 'stop-color', 'flood-color', 'lighting-color', 'color'];

  const allCloned = [svgClone, ...Array.from(svgClone.querySelectorAll('*'))];
  const allOriginal = [svgOriginal, ...Array.from(svgOriginal.querySelectorAll('*'))];

  allCloned.forEach((clonedEl, i) => {
    const origEl = allOriginal[i];

    // Resolve attribute-level colors
    colorAttrs.forEach(attr => {
      const val = clonedEl.getAttribute(attr);
      if (val && (val.includes('var(') || val.includes('hsl('))) {
        clonedEl.setAttribute(attr, resolveColor(val));
      }
    });

    // Resolve stroke-opacity, fill-opacity from computed styles
    if (origEl && origEl instanceof Element) {
      const computed = getComputedStyle(origEl);

      // If stroke/fill not set as attribute but comes from CSS class
      colorAttrs.forEach(attr => {
        const currentVal = clonedEl.getAttribute(attr);
        if (!currentVal || currentVal === 'none') {
          const cssProp = attr === 'stop-color' ? 'stopColor' : attr;
          const computedVal = (computed as any)[cssProp];
          if (computedVal && computedVal !== 'none' && computedVal !== '') {
            clonedEl.setAttribute(attr, computedVal);
          }
        }
      });

      // Copy computed stroke/fill for elements using CSS classes
      const computedStroke = computed.stroke;
      const computedFill = computed.fill;
      if (computedStroke && computedStroke !== 'none' && !clonedEl.getAttribute('stroke')) {
        clonedEl.setAttribute('stroke', computedStroke);
      }
      if (computedFill && !clonedEl.getAttribute('fill')) {
        clonedEl.setAttribute('fill', computedFill);
      }

      // Copy opacity attributes
      const strokeOpacity = clonedEl.getAttribute('stroke-opacity') || (origEl as Element).getAttribute('stroke-opacity');
      if (strokeOpacity) clonedEl.setAttribute('stroke-opacity', strokeOpacity);
      const fillOpacity = clonedEl.getAttribute('fill-opacity') || (origEl as Element).getAttribute('fill-opacity');
      if (fillOpacity) clonedEl.setAttribute('fill-opacity', fillOpacity);

      // Copy stroke-width, stroke-dasharray
      if (!clonedEl.getAttribute('stroke-width')) {
        const sw = computed.strokeWidth;
        if (sw && sw !== '0' && sw !== '0px') clonedEl.setAttribute('stroke-width', sw);
      }
      if (!clonedEl.getAttribute('stroke-dasharray')) {
        const sd = computed.strokeDasharray;
        if (sd && sd !== 'none') clonedEl.setAttribute('stroke-dasharray', sd);
      }
    }
  });

  // Remove masks that hide content
  svgClone.querySelectorAll('[mask]').forEach(el => el.removeAttribute('mask'));
}

/**
 * Inline all computed styles on an HTML element tree for foreignObject export.
 */
function inlineComputedStyles(el: HTMLElement, orig: HTMLElement) {
  const computed = getComputedStyle(orig);
  const important = [
    'color', 'background-color', 'background', 'font-family', 'font-size', 'font-weight',
    'line-height', 'letter-spacing', 'text-align', 'padding', 'margin', 'border',
    'border-radius', 'display', 'flex-direction', 'align-items', 'justify-content',
    'gap', 'width', 'height', 'min-width', 'min-height', 'max-width', 'overflow',
    'box-sizing', 'position', 'opacity', 'text-decoration', 'white-space',
    'border-color', 'border-width', 'border-style', 'box-shadow',
  ];
  important.forEach(prop => {
    const val = computed.getPropertyValue(prop);
    if (val) el.style.setProperty(prop, val);
  });

  // Recurse into children
  const clonedChildren = el.children;
  const origChildren = orig.children;
  for (let i = 0; i < clonedChildren.length && i < origChildren.length; i++) {
    if (clonedChildren[i] instanceof HTMLElement && origChildren[i] instanceof HTMLElement) {
      inlineComputedStyles(clonedChildren[i] as HTMLElement, origChildren[i] as HTMLElement);
    }
  }
}

// ─── Bounds ─────────────────────────────────────────────────────────

function getMemberBounds(contentDiv: HTMLElement, padding = 80) {
  const cards = contentDiv.querySelectorAll('[data-member-card]');
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

  // Extra space for emotional link arcs
  const extra = 150;
  return {
    x: minX - padding - extra,
    y: minY - padding - extra,
    w: maxX - minX + (padding + extra) * 2,
    h: maxY - minY + (padding + extra) * 2,
  };
}

// ─── Build Export SVG ───────────────────────────────────────────────

function buildExportSvg(canvasRef: HTMLDivElement): { svgString: string; width: number; height: number } | null {
  const contentDiv = canvasRef.querySelector('.absolute') as HTMLElement;
  if (!contentDiv) return null;

  // Reset transform temporarily to get real positions
  const origTransform = contentDiv.style.transform;
  const origTransformOrigin = contentDiv.style.transformOrigin;
  contentDiv.style.transform = 'none';
  contentDiv.style.transformOrigin = '0 0';

  // Force layout recalc
  contentDiv.getBoundingClientRect();

  try {
    const bounds = getMemberBounds(contentDiv);
    const contentRect = contentDiv.getBoundingClientRect();

    let svgInner = '';

    // 1. Clone all SVG elements (link lines, etc.)
    const svgElements = contentDiv.querySelectorAll(':scope > svg, :scope > div > svg');
    // Also get SVGs that are direct children or in wrapper divs
    const allSvgs = contentDiv.querySelectorAll('svg');

    const processedSvgs = new Set<SVGElement>();
    allSvgs.forEach(svg => {
      if (processedSvgs.has(svg)) return;
      // Skip SVGs inside member cards (icons etc) — we handle those via foreignObject
      if (svg.closest('[data-member-card]')) return;
      processedSvgs.add(svg);

      const clone = svg.cloneNode(true) as SVGElement;
      resolveAllColors(clone, svg);

      // Get SVG position relative to content div
      const svgRect = svg.getBoundingClientRect();
      const svgX = svgRect.left - contentRect.left;
      const svgY = svgRect.top - contentRect.top;

      // For SVGs with width:1, height:1, overflow:visible — they use absolute positioning
      // and their content coordinates are already in the content div's coordinate space
      const style = svg.style;
      const isOverflowSvg = style.overflow === 'visible' &&
        (style.width === '1px' || svg.getAttribute('width') === '1');

      if (isOverflowSvg) {
        // Content is already in absolute coords, just wrap inner content
        svgInner += clone.innerHTML;
      } else {
        // Position the SVG content with a transform
        svgInner += `<g transform="translate(${svgX}, ${svgY})">${clone.innerHTML}</g>`;
      }
    });

    // 2. Capture member cards as foreignObject
    const cards = contentDiv.querySelectorAll('[data-member-card]');
    cards.forEach(card => {
      const el = card as HTMLElement;
      const rect = el.getBoundingClientRect();
      const x = rect.left - contentRect.left;
      const y = rect.top - contentRect.top;

      // Clone and inline all styles
      const clone = el.cloneNode(true) as HTMLElement;

      // Remove buttons and interactive elements
      clone.querySelectorAll('button, [data-radix-popper-content-wrapper]').forEach(btn => btn.remove());

      // Inline all computed styles
      inlineComputedStyles(clone, el);

      // Handle SVG icons inside cards — resolve their colors too
      const cardSvgs = clone.querySelectorAll('svg');
      const origCardSvgs = el.querySelectorAll('svg');
      cardSvgs.forEach((svg, idx) => {
        if (origCardSvgs[idx]) {
          resolveAllColors(svg, origCardSvgs[idx]);
        }
      });

      svgInner += `<foreignObject x="${x}" y="${y}" width="${rect.width + 2}" height="${rect.height + 2}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, system-ui, -apple-system, sans-serif; font-size: 12px;">
          ${clone.outerHTML}
        </div>
      </foreignObject>`;
    });

    // 3. Also capture UnionBadge and RelationshipBadge elements
    const badges = contentDiv.querySelectorAll('[data-union-badge], [data-relationship-badge]');
    badges.forEach(badge => {
      const el = badge as HTMLElement;
      if (el.closest('[data-member-card]')) return; // Skip if inside a card
      const rect = el.getBoundingClientRect();
      const x = rect.left - contentRect.left;
      const y = rect.top - contentRect.top;

      const clone = el.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('button').forEach(btn => btn.remove());
      inlineComputedStyles(clone, el);

      svgInner += `<foreignObject x="${x}" y="${y}" width="${rect.width + 2}" height="${rect.height + 2}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, system-ui, -apple-system, sans-serif; font-size: 11px;">
          ${clone.outerHTML}
        </div>
      </foreignObject>`;
    });

    const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml"
  viewBox="${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}"
  width="${bounds.w}" height="${bounds.h}">
  <rect x="${bounds.x}" y="${bounds.y}" width="${bounds.w}" height="${bounds.h}" fill="white"/>
  ${svgInner}
</svg>`;

    return { svgString, width: bounds.w, height: bounds.h };
  } finally {
    contentDiv.style.transform = origTransform;
    contentDiv.style.transformOrigin = origTransformOrigin;
  }
}

// ─── SVG → Canvas ──────────────────────────────────────────────────

function svgToCanvas(svgString: string, width: number, height: number, scale = 2): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      console.error('SVG to image conversion failed:', e);
      reject(new Error('SVG to image conversion failed'));
    };

    img.src = url;
  });
}

// ─── Public API ─────────────────────────────────────────────────────

export async function exportAsPng(canvasRef: HTMLDivElement, fileName: string) {
  const result = buildExportSvg(canvasRef);
  if (!result) return;

  try {
    const canvas = await svgToCanvas(result.svgString, result.width, result.height);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${fileName}.png`);
    }, 'image/png');
  } catch {
    // Fallback: download as SVG if canvas conversion fails
    console.warn('PNG export failed, falling back to SVG');
    const blob = new Blob([result.svgString], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, `${fileName}.svg`);
  }
}

export async function exportAsPdf(canvasRef: HTMLDivElement, fileName: string) {
  const result = buildExportSvg(canvasRef);
  if (!result) return;

  try {
    const canvas = await svgToCanvas(result.svgString, result.width, result.height);

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

    const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(120, 120, 120);
    pdf.text(dateStr, pageW - margin, headerH - 2, { align: 'right' });

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.line(margin, headerH + 2, pageW - margin, headerH + 2);

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
  } catch {
    console.warn('PDF export failed');
  }
}

export function exportAsSvg(
  canvasRef: HTMLDivElement,
  _members: { x: number; y: number }[],
  _cardW: number,
  _cardH: number,
  fileName: string,
) {
  const result = buildExportSvg(canvasRef);
  if (!result) return;

  const blob = new Blob([result.svgString], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, `${fileName}.svg`);
}
