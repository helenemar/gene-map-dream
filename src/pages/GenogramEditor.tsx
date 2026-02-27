import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import EditorHeader from '@/components/EditorHeader';
import EditorSidebar from '@/components/EditorSidebar';
import MemberCard from '@/components/MemberCard';
import FamilyLinkLines from '@/components/FamilyLinkLines';
import EmotionalLinkLine from '@/components/EmotionalLinkLine';
import FloatingControls from '@/components/FloatingControls';
import { SAMPLE_MEMBERS, SAMPLE_UNIONS, SAMPLE_EMOTIONAL_LINKS } from '@/data/sampleData';
import { FamilyMember } from '@/types/genogram';
import { computeAutoLayout } from '@/utils/autoLayout';

type EditorMode = 'select' | 'link';

// Card bounding box
const CARD_W = 186;
const CARD_H = 64;
const MARGIN = 5;
const MIN_ZOOM = 0.15;
const MAX_ZOOM = 3;
const ZOOM_SENSITIVITY = 0.002;
const DOT_SPACING = 24;
const SNAP_GRID = 20;
const STORAGE_KEY = 'genogy-member-positions';

type Side = 'top' | 'bottom' | 'left' | 'right';

interface AnchorPoint { x: number; y: number; side: Side; }

/** Corner anchors for emotional links — corners only, never center/sides */
type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
function cardCorners(m: FamilyMember): { corner: Corner; x: number; y: number }[] {
  return [
    { corner: 'top-left',     x: m.x,          y: m.y },
    { corner: 'top-right',    x: m.x + CARD_W, y: m.y },
    { corner: 'bottom-left',  x: m.x,          y: m.y + CARD_H },
    { corner: 'bottom-right', x: m.x + CARD_W, y: m.y + CARD_H },
  ];
}

/** Side anchors (center of edges) — snap exactly to card border, zero gap */
function cardAnchors(m: FamilyMember): AnchorPoint[] {
  return [
    { x: m.x + CARD_W / 2, y: m.y, side: 'top' },
    { x: m.x + CARD_W / 2, y: m.y + CARD_H, side: 'bottom' },
    { x: m.x, y: m.y + CARD_H / 2, side: 'left' },
    { x: m.x + CARD_W, y: m.y + CARD_H / 2, side: 'right' },
  ];
}

/**
 * Side-based anchor selection for emotional links.
 * Picks the pair of side anchors (one per card) that:
 *  1. Minimises the total distance
 *  2. Avoids routing the line through either card's bounding box
 */
function getEmotionalAnchors(from: FamilyMember, to: FamilyMember) {
  const fromSides = cardAnchors(from);
  const toSides = cardAnchors(to);

  let best = { x1: 0, y1: 0, x2: 0, y2: 0, dist: Infinity };

  for (const fs of fromSides) {
    for (const ts of toSides) {
      const dx = ts.x - fs.x;
      const dy = ts.y - fs.y;
      const d = Math.sqrt(dx * dx + dy * dy);

      // Reject if the straight line passes through either card
      const crossesFrom = linePassesThroughCard(fs.x, fs.y, ts.x, ts.y, from);
      const crossesTo   = linePassesThroughCard(fs.x, fs.y, ts.x, ts.y, to);

      const penalty = (crossesFrom ? 10000 : 0) + (crossesTo ? 10000 : 0);
      const score = d + penalty;

      if (score < best.dist) {
        best = { x1: fs.x, y1: fs.y, x2: ts.x, y2: ts.y, dist: score };
      }
    }
  }

  return { x1: best.x1, y1: best.y1, x2: best.x2, y2: best.y2 };
}

/** Check if a segment passes through a card's interior (with small inset) */
function linePassesThroughCard(ax: number, ay: number, bx: number, by: number, m: FamilyMember): boolean {
  const inset = 4; // shrink rect slightly so corner-touching doesn't count
  const rx = m.x + inset;
  const ry = m.y + inset;
  const rw = CARD_W - inset * 2;
  const rh = CARD_H - inset * 2;
  if (rw <= 0 || rh <= 0) return false;
  // Liang–Barsky
  const dx = bx - ax;
  const dy = by - ay;
  const p = [-dx, dx, -dy, dy];
  const q = [ax - rx, rx + rw - ax, ay - ry, ry + rh - ay];
  let u0 = 0, u1 = 1;
  for (let i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-9) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > u0) u0 = t; }
      else { if (t < u1) u1 = t; }
    }
  }
  return u0 < u1; // strict: the line actually enters the rect interior
}

/** Legacy side-based anchors for any non-emotional usage */
function getDirectionalAnchors(from: FamilyMember, to: FamilyMember) {
  const fromCx = from.x + CARD_W / 2;
  const fromCy = from.y + CARD_H / 2;
  const toCx = to.x + CARD_W / 2;
  const toCy = to.y + CARD_H / 2;
  const dx = toCx - fromCx;
  const dy = toCy - fromCy;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const fromA = cardAnchors(from);
  const toA = cardAnchors(to);

  let fromSide: Side, toSide: Side;
  const overlapX = from.x < to.x + CARD_W && to.x < from.x + CARD_W;
  const overlapY = from.y < to.y + CARD_H && to.y < from.y + CARD_H;

  if (overlapY && !overlapX) {
    fromSide = dx > 0 ? 'right' : 'left';
    toSide = dx > 0 ? 'left' : 'right';
  } else if (overlapX && !overlapY) {
    fromSide = dy > 0 ? 'bottom' : 'top';
    toSide = dy > 0 ? 'top' : 'bottom';
  } else if (absDx > absDy) {
    fromSide = dx > 0 ? 'right' : 'left';
    toSide = dx > 0 ? 'left' : 'right';
  } else {
    fromSide = dy > 0 ? 'bottom' : 'top';
    toSide = dy > 0 ? 'top' : 'bottom';
  }

  const fa = fromA.find(a => a.side === fromSide)!;
  const ta = toA.find(a => a.side === toSide)!;
  return { x1: fa.x, y1: fa.y, x2: ta.x, y2: ta.y, fromSide, toSide };
}

const GenogramEditor: React.FC = () => {
  // Load saved positions from localStorage
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const positions: Record<string, { x: number; y: number }> = JSON.parse(saved);
        return SAMPLE_MEMBERS.map(m => positions[m.id] ? { ...m, ...positions[m.id] } : m);
      }
    } catch { /* ignore */ }
    return SAMPLE_MEMBERS;
  });
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [mode, setMode] = useState<EditorMode>('select');
  const [isAnimating, setIsAnimating] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [dragInfo, setDragInfo] = useState<{
    id: string; startX: number; startY: number; memberX: number; memberY: number;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // ─── Persist positions to localStorage ───
  useEffect(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    members.forEach(m => { positions[m.id] = { x: m.x, y: m.y }; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  }, [members]);

  // ─── Collision detection ───
  const collisions = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const a = members[i], b = members[j];
        const overlapX = a.x < b.x + CARD_W && b.x < a.x + CARD_W;
        const overlapY = a.y < b.y + CARD_H && b.y < a.y + CARD_H;
        if (overlapX && overlapY) {
          set.add(a.id);
          set.add(b.id);
        }
      }
    }
    return set;
  }, [members]);

  // ─── Space key tracking for Figma-like space+drag panning ───
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpaceDown(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpaceDown(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // ─── Cursor-centered wheel zoom (Cmd/Ctrl + Scroll) ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Pinch-zoom or Cmd/Ctrl+Scroll → zoom centered on cursor
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Point in world-space before zoom
      const worldX = (mouseX - pan.x) / zoom;
      const worldY = (mouseY - pan.y) / zoom;

      const delta = -e.deltaY * ZOOM_SENSITIVITY;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * (1 + delta)));

      // Adjust pan so the world point under cursor stays fixed
      const newPanX = mouseX - worldX * newZoom;
      const newPanY = mouseY - worldY * newZoom;

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [zoom, pan]);

  // ─── Drag member ───
  const handleDragStart = useCallback((id: string, e: React.MouseEvent) => {
    if (isSpaceDown) return; // space+drag = pan, not member drag
    const member = members.find(m => m.id === id);
    if (!member) return;
    setDragInfo({ id, startX: e.clientX, startY: e.clientY, memberX: member.x, memberY: member.y });
  }, [members, isSpaceDown]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragInfo) {
      const dx = (e.clientX - dragInfo.startX) / zoom;
      const dy = (e.clientY - dragInfo.startY) / zoom;
      let newX = dragInfo.memberX + dx;
      let newY = dragInfo.memberY + dy;
      // Live snap while dragging
      if (snapToGrid) {
        newX = Math.round(newX / SNAP_GRID) * SNAP_GRID;
        newY = Math.round(newY / SNAP_GRID) * SNAP_GRID;
      }
      setMembers(prev => prev.map(m =>
        m.id === dragInfo.id ? { ...m, x: newX, y: newY } : m
      ));
    } else if (isPanning) {
      setPan(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
    }
  }, [dragInfo, isPanning, zoom, snapToGrid]);

  const handleMouseUp = useCallback(() => {
    // Snap on release if enabled
    if (dragInfo && snapToGrid) {
      setMembers(prev => prev.map(m =>
        m.id === dragInfo.id
          ? { ...m, x: Math.round(m.x / SNAP_GRID) * SNAP_GRID, y: Math.round(m.y / SNAP_GRID) * SNAP_GRID }
          : m
      ));
    }
    setDragInfo(null);
    setIsPanning(false);
  }, [dragInfo, snapToGrid]);

  // ─── Canvas mouse down: space+click or middle-click = pan, else deselect ───
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle-click pan
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      return;
    }
    // Space+left-click pan
    if (isSpaceDown && e.button === 0) {
      setIsPanning(true);
      return;
    }
    // Left-click on empty canvas → pan
    if (e.button === 0 && (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-bg'))) {
      setIsPanning(true);
      setSelectedMember(null);
      return;
    }
  }, [isSpaceDown]);

  const handleSelect = useCallback((id: string) => {
    setSelectedMember(prev => prev === id ? null : id);
  }, []);

  const getMemberState = useCallback((memberId: string) => {
    if (mode === 'link') return 'linkable';
    if (selectedMember === memberId) return 'edition';
    if (hoveredMember === memberId) return 'hover';
    return 'default';
  }, [mode, selectedMember, hoveredMember]);

  const handleToggleMode = useCallback(() => {
    setMode(prev => prev === 'select' ? 'link' : 'select');
    setSelectedMember(null);
  }, []);

  const handleCreateRelated = useCallback((id: string) => {
    console.log('Create related member for', id);
  }, []);

  const handleEdit = useCallback((id: string) => {
    console.log('Edit member', id);
  }, []);


  // ─── Fit to screen: compute bounding box of all members and center ───
  const handleFitToScreen = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || members.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const padding = 80;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const m of members) {
      minX = Math.min(minX, m.x);
      minY = Math.min(minY, m.y);
      maxX = Math.max(maxX, m.x + CARD_W);
      maxY = Math.max(maxY, m.y + CARD_H);
    }

    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const scaleX = (rect.width - padding * 2) / contentW;
    const scaleY = (rect.height - padding * 2) / contentH;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), MIN_ZOOM), MAX_ZOOM);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const newPanX = rect.width / 2 - centerX * newZoom;
    const newPanY = rect.height / 2 - centerY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [members]);

  // ─── Auto-layout: reorganize tree ───
  const handleAutoLayout = useCallback(() => {
    const result = computeAutoLayout(members, SAMPLE_UNIONS, SAMPLE_EMOTIONAL_LINKS);
    setIsAnimating(true);
    setMembers(prev => prev.map(m => {
      const pos = result.positions.get(m.id);
      return pos ? { ...m, x: pos.x, y: pos.y } : m;
    }));
    setTimeout(() => {
      setIsAnimating(false);
      handleFitToScreen();
    }, 900); // Match spring animation duration
  }, [members, handleFitToScreen]);

  // ─── Button zoom (centered on viewport center) ───
  const handleZoomIn = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const worldX = (cx - pan.x) / zoom;
    const worldY = (cy - pan.y) / zoom;
    const newZoom = Math.min(MAX_ZOOM, zoom * 1.2);
    setPan({ x: cx - worldX * newZoom, y: cy - worldY * newZoom });
    setZoom(newZoom);
  }, [zoom, pan]);

  const handleZoomOut = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const worldX = (cx - pan.x) / zoom;
    const worldY = (cy - pan.y) / zoom;
    const newZoom = Math.max(MIN_ZOOM, zoom / 1.2);
    setPan({ x: cx - worldX * newZoom, y: cy - worldY * newZoom });
    setZoom(newZoom);
  }, [zoom, pan]);

  // ─── Dynamic cursor ───
  const cursorClass = isSpaceDown || isPanning
    ? (isPanning ? 'cursor-grabbing' : 'cursor-grab')
    : 'cursor-default';

  // ─── Dynamic dot grid background style ───
  const dotSize = DOT_SPACING * zoom;
  const dotGridStyle: React.CSSProperties = {
    backgroundImage: `radial-gradient(circle, hsl(var(--canvas-dot)) ${Math.max(0.5, zoom * 1)}px, transparent ${Math.max(0.5, zoom * 1)}px)`,
    backgroundSize: `${dotSize}px ${dotSize}px`,
    backgroundPosition: `${pan.x % dotSize}px ${pan.y % dotSize}px`,
    backgroundColor: 'hsl(var(--canvas-bg))',
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <EditorHeader />
      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar members={members} fileName="Nouveau fichier" />

        {/* Canvas */}
        <div
          ref={canvasRef}
          className={`flex-1 relative overflow-hidden canvas-bg ${cursorClass}`}
          style={dotGridStyle}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={e => e.preventDefault()}
        >
          <div
            className="absolute"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
              transformOrigin: '0 0',
              willChange: 'transform',
            }}
          >
            <FamilyLinkLines members={members} unions={SAMPLE_UNIONS} />
            {/* Emotional links SVG overlay — z-index 1 so cards render above */}
            <svg className="absolute pointer-events-none" style={{ zIndex: 1, overflow: 'visible', top: 0, left: 0, width: 1, height: 1 }}>
              <g style={{ pointerEvents: 'auto' }}>
                {(() => {
                  // Build card rects for collision avoidance
                  const cardRects = members.map(m => ({ id: m.id, x: m.x, y: m.y, w: CARD_W, h: CARD_H }));
                  // Group links by pair for "onion" offset
                  const pairMap = new Map<string, number[]>();
                  SAMPLE_EMOTIONAL_LINKS.forEach((link, i) => {
                    const key = [link.from, link.to].sort().join('|');
                    if (!pairMap.has(key)) pairMap.set(key, []);
                    pairMap.get(key)!.push(i);
                  });
                  return SAMPLE_EMOTIONAL_LINKS.map((link, globalIdx) => {
                    const from = members.find(m => m.id === link.from);
                    const to = members.find(m => m.id === link.to);
                    if (!from || !to) return null;
                    const anchors = getEmotionalAnchors(from, to);
                    const key = [link.from, link.to].sort().join('|');
                    const group = pairMap.get(key)!;
                    const linkIndex = group.indexOf(globalIdx);
                    return (
                      <EmotionalLinkLine
                        key={link.id}
                        x1={anchors.x1} y1={anchors.y1}
                        x2={anchors.x2} y2={anchors.y2}
                        type={link.type}
                        linkIndex={linkIndex}
                        linkCount={group.length}
                        cardRects={cardRects}
                        excludeIds={[link.from, link.to]}
                        onClick={() => console.log('Edit emotional link', link.id)}
                      />
                    );
                  });
                })()}
              </g>
            </svg>
            {members.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                isSelected={selectedMember === member.id}
                isAnimating={isAnimating}
                isColliding={collisions.has(member.id)}
                state={getMemberState(member.id)}
                onSelect={handleSelect}
                onDragStart={handleDragStart}
                onCreateRelated={handleCreateRelated}
                onEdit={handleEdit}
                onHover={setHoveredMember}
              />
            ))}
          </div>

          <FloatingControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitToScreen={handleFitToScreen}
            onAutoLayout={handleAutoLayout}
            zoom={zoom}
            mode={mode}
            onToggleMode={handleToggleMode}
            snapToGrid={snapToGrid}
            onToggleSnap={() => setSnapToGrid(prev => !prev)}
          />
        </div>
      </div>
    </div>
  );
};

export default GenogramEditor;
