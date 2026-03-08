import { jsPDF } from 'jspdf';
import { FamilyMember } from '@/types/genogram';

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

// Cache resolved colors to avoid repeated DOM operations
const colorCache = new Map<string, string>();
function resolveColorCached(raw: string): string {
  if (!raw || (!raw.includes('var(') && !raw.includes('hsl('))) return raw;
  const cached = colorCache.get(raw);
  if (cached) return cached;
  const resolved = resolveColor(raw);
  colorCache.set(raw, resolved);
  return resolved;
}

/**
 * Deep-resolve all CSS variable colors in a cloned SVG element tree.
 */
function resolveAllSvgColors(svgClone: SVGElement, svgOriginal: SVGElement) {
  const colorAttrs = ['stroke', 'fill', 'stop-color', 'flood-color', 'lighting-color', 'color'];

  const allCloned = [svgClone, ...Array.from(svgClone.querySelectorAll('*'))];
  const allOriginal = [svgOriginal, ...Array.from(svgOriginal.querySelectorAll('*'))];

  allCloned.forEach((clonedEl, i) => {
    const origEl = allOriginal[i];

    // Resolve attribute-level colors
    colorAttrs.forEach(attr => {
      const val = clonedEl.getAttribute(attr);
      if (val && (val.includes('var(') || val.includes('hsl('))) {
        clonedEl.setAttribute(attr, resolveColorCached(val));
      }
    });

    // Resolve computed styles from CSS classes
    if (origEl && origEl instanceof Element) {
      const computed = getComputedStyle(origEl);

      // Copy computed stroke/fill if not already set
      if (!clonedEl.getAttribute('stroke') || clonedEl.getAttribute('stroke') === '') {
        const s = computed.stroke;
        if (s && s !== 'none' && s !== '') clonedEl.setAttribute('stroke', s);
      }
      if (!clonedEl.getAttribute('fill') || clonedEl.getAttribute('fill') === '') {
        const f = computed.fill;
        if (f && f !== '') clonedEl.setAttribute('fill', f);
      }

      // Copy opacity
      const so = (origEl as Element).getAttribute('stroke-opacity');
      if (so) clonedEl.setAttribute('stroke-opacity', so);
      const fo = (origEl as Element).getAttribute('fill-opacity');
      if (fo) clonedEl.setAttribute('fill-opacity', fo);

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

  const extra = 150;
  return {
    x: minX - padding - extra,
    y: minY - padding - extra,
    w: maxX - minX + (padding + extra) * 2,
    h: maxY - minY + (padding + extra) * 2,
  };
}

// ─── Pure SVG Card Renderer ─────────────────────────────────────────

const CARD_W = 220;
const CARD_H_BASE = 64;
const CARD_PAD_X = 16;
const CARD_PAD_Y = 12;
const ICON_SIZE = 48;
const ICON_GAP = 12;

/**
 * Read card info from the DOM and render as pure SVG elements.
 * This avoids foreignObject which doesn't work in SVG→Image→Canvas pipeline.
 */
function renderCardAsSvg(cardEl: HTMLElement, contentRect: DOMRect): string {
  const rect = cardEl.getBoundingClientRect();
  const x = rect.left - contentRect.left;
  const y = rect.top - contentRect.top;
  const w = rect.width;
  const h = rect.height;

  // Read colors from computed styles
  const bgColor = resolveColorCached('hsl(var(--card))');
  const borderColor = resolveColorCached('hsl(var(--border))');
  const fgColor = resolveColorCached('hsl(var(--foreground))');
  const mutedFg = resolveColorCached('hsl(var(--muted-foreground))');
  const mutedBg = resolveColorCached('hsl(var(--muted))');

  // Check if card has purple border (selected/highlighted)
  const computed = getComputedStyle(cardEl.querySelector('.relative') || cardEl);
  const actualBorder = computed.borderColor || borderColor;

  let svg = '';

  // Card background with rounded corners
  svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" ry="12" 
    fill="${bgColor}" stroke="${actualBorder}" stroke-width="1" />`;

  // Extract SVG icon from the card and clone it
  const iconSvg = cardEl.querySelector(':scope svg, :scope div svg') as SVGElement;
  if (iconSvg) {
    const iconRect = iconSvg.getBoundingClientRect();
    const iconX = iconRect.left - contentRect.left;
    const iconY = iconRect.top - contentRect.top;
    const iconW = iconRect.width;
    const iconH = iconRect.height;

    const clone = iconSvg.cloneNode(true) as SVGElement;
    resolveAllSvgColors(clone, iconSvg);

    // Resolve `currentColor` to the actual foreground color
    const resolvedCurrentColor = fgColor;
    let serialized = new XMLSerializer().serializeToString(clone);
    serialized = serialized.replace(/currentColor/gi, resolvedCurrentColor);

    // Fix React useId() clip-path IDs containing colons (e.g. ":r1:") 
    // which break url() references in serialized SVG
    const clipIdRegex = /id="clip-(:[^"]+:)"/g;
    const usedIds = new Set<string>();
    let match;
    while ((match = clipIdRegex.exec(serialized)) !== null) {
      usedIds.add(match[1]);
    }
    let counter = 0;
    usedIds.forEach(reactId => {
      const safeId = `export-clip-${counter++}`;
      // Replace both the definition and all references
      serialized = serialized.split(`clip-${reactId}`).join(safeId);
    });

    // Remove the outer <svg> wrapper from serialized string and wrap with positioning
    const vb = clone.getAttribute('viewBox') || `0 0 ${iconW} ${iconH}`;
    // Extract inner content from serialized SVG
    const innerMatch = serialized.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
    const innerContent = innerMatch ? innerMatch[1] : '';

    svg += `<svg x="${iconX}" y="${iconY}" width="${iconW}" height="${iconH}" viewBox="${vb}" fill="none">
      ${innerContent}
    </svg>`;
  }

  // Extract text content from the card
  const textContainer = cardEl.querySelector('.min-w-0');
  if (textContainer) {
    const textX = x + CARD_PAD_X + ICON_SIZE + ICON_GAP;
    const textBaseY = y + CARD_PAD_Y;

    // Name (first line - semibold)
    const nameEl = textContainer.querySelector('.font-semibold, .font-medium');
    const name = nameEl?.textContent?.trim() || '';
    if (name) {
      svg += `<text x="${textX}" y="${textBaseY + 13}" 
        font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="600" 
        fill="${fgColor}">${escapeXml(name)}</text>`;
    }

    // Age badge
    const badgeEl = textContainer.querySelector('.rounded-full');
    if (badgeEl) {
      const badgeText = badgeEl.textContent?.trim() || '';
      if (badgeText) {
        const badgeW = badgeText.length * 7 + 12;
        const badgeX = x + w - CARD_PAD_X - badgeW;
        const badgeY = textBaseY + 2;
        svg += `<rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="20" rx="10" fill="${mutedBg}" />`;
        svg += `<text x="${badgeX + badgeW / 2}" y="${badgeY + 14}" 
          text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="500" 
          fill="${mutedFg}">${escapeXml(badgeText)}</text>`;
      }
    }

    // Year line (second line)
    const yearSpans = textContainer.querySelectorAll('.text-xs .whitespace-nowrap, .text-\\[11px\\]');
    let yearText = '';
    yearSpans.forEach(span => {
      const t = span.textContent?.trim();
      if (t && /\d{3,4}/.test(t)) yearText = t;
    });
    if (!yearText) {
      // Fallback: look for any span with year-like content
      const allSpans = textContainer.querySelectorAll('span');
      allSpans.forEach(span => {
        const t = span.textContent?.trim();
        if (t && /^\~?\d{3,4}\s*-/.test(t)) yearText = t;
      });
    }
    if (yearText) {
      svg += `<text x="${textX}" y="${textBaseY + 28}" 
        font-family="Inter, system-ui, sans-serif" font-size="11" 
        fill="${mutedFg}">${escapeXml(yearText)}</text>`;
    }

    // Profession line (third line)
    const profLines = textContainer.querySelectorAll('.text-xs');
    let profText = '';
    profLines.forEach(el => {
      const spans = el.querySelectorAll('span.whitespace-nowrap');
      spans.forEach(span => {
        const t = span.textContent?.trim();
        if (t && !/\d{3,4}/.test(t) && t !== name) profText = t;
      });
    });
    if (profText) {
      svg += `<text x="${textX}" y="${textBaseY + 42}" 
        font-family="Inter, system-ui, sans-serif" font-size="12" 
        fill="${mutedFg}">${escapeXml(profText)}</text>`;
    }
  }

  return svg;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// ─── Build Export SVG ───────────────────────────────────────────────

function buildExportSvg(canvasRef: HTMLDivElement): { svgString: string; width: number; height: number } | null {
  const contentDiv = canvasRef.querySelector('.absolute') as HTMLElement;
  if (!contentDiv) return null;

  // Clear color cache
  colorCache.clear();

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

    // 1. Clone all SVG elements (link lines — family, emotional, elastic)
    const allSvgs = contentDiv.querySelectorAll('svg');
    const processedSvgs = new Set<SVGElement>();

    allSvgs.forEach(svg => {
      if (processedSvgs.has(svg)) return;
      // Skip SVGs inside member cards — we render those separately
      if (svg.closest('[data-member-card]')) return;
      processedSvgs.add(svg);

      const clone = svg.cloneNode(true) as SVGElement;
      resolveAllSvgColors(clone, svg);

      // Remove any buttons or interactive elements from cloned SVGs
      clone.querySelectorAll('foreignObject').forEach(fo => fo.remove());

      const style = svg.style;
      const isOverflowSvg = style.overflow === 'visible' &&
        (style.width === '1px' || svg.getAttribute('width') === '1');

      if (isOverflowSvg) {
        // Content is already in absolute coords
        svgInner += clone.innerHTML;
      } else {
        const svgRect = svg.getBoundingClientRect();
        const svgX = svgRect.left - contentRect.left;
        const svgY = svgRect.top - contentRect.top;
        svgInner += `<g transform="translate(${svgX}, ${svgY})">${clone.innerHTML}</g>`;
      }
    });

    // 2. Render member cards as pure SVG
    const cards = contentDiv.querySelectorAll('[data-member-card]');
    cards.forEach(card => {
      svgInner += renderCardAsSvg(card as HTMLElement, contentRect);
    });

    const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}"
  width="${bounds.w}" height="${bounds.h}">
  <rect x="${bounds.x}" y="${bounds.y}" width="${bounds.w}" height="${bounds.h}" fill="white"/>
  ${svgInner}
</svg>`;

    return { svgString, width: bounds.w, height: bounds.h };
  } finally {
    contentDiv.style.transform = origTransform;
    contentDiv.style.transformOrigin = origTransformOrigin;
    colorCache.clear();
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
