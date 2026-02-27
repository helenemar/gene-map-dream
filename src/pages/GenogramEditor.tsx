import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import EditorHeader from '@/components/EditorHeader';
import EditorSidebar from '@/components/EditorSidebar';
import MemberCard from '@/components/MemberCard';
import { MEMBER_CARD_W } from '@/components/MemberCard';
import FamilyLinkLines from '@/components/FamilyLinkLines';
import EmotionalLinkLine from '@/components/EmotionalLinkLine';
import ElasticLinkLine from '@/components/ElasticLinkLine';
import LinkTypeModal from '@/components/LinkTypeModal';
import FloatingControls from '@/components/FloatingControls';
import UnionEditDrawer from '@/components/UnionEditDrawer';
import { SAMPLE_MEMBERS, SAMPLE_UNIONS, SAMPLE_EMOTIONAL_LINKS } from '@/data/sampleData';
import { FamilyMember, EmotionalLink, EmotionalLinkType, Union } from '@/types/genogram';
import { computeAutoLayout } from '@/utils/autoLayout';

// Card bounding box
const CARD_W = MEMBER_CARD_W;
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

/** Corner positions for a card */
function cardCorners(m: FamilyMember) {
  return [
    { x: m.x, y: m.y },                     // top-left
    { x: m.x + CARD_W, y: m.y },            // top-right
    { x: m.x, y: m.y + CARD_H },            // bottom-left
    { x: m.x + CARD_W, y: m.y + CARD_H },   // bottom-right
  ];
}

/** Side anchors (center of edges) — for family links */
function cardAnchors(m: FamilyMember): AnchorPoint[] {
  return [
    { x: m.x + CARD_W / 2, y: m.y, side: 'top' },
    { x: m.x + CARD_W / 2, y: m.y + CARD_H, side: 'bottom' },
    { x: m.x, y: m.y + CARD_H / 2, side: 'left' },
    { x: m.x + CARD_W, y: m.y + CARD_H / 2, side: 'right' },
  ];
}

/**
 * Corner-based anchor selection for emotional links.
 * Picks the pair of corners (one per card) that minimises distance.
 */
function getEmotionalAnchors(from: FamilyMember, to: FamilyMember) {
  const fc = cardCorners(from);
  const tc = cardCorners(to);
  let best = { x1: fc[0].x, y1: fc[0].y, x2: tc[0].x, y2: tc[0].y };
  let bestDist = Infinity;
  for (const f of fc) {
    for (const t of tc) {
      const d = Math.hypot(f.x - t.x, f.y - t.y);
      if (d < bestDist) {
        bestDist = d;
        best = { x1: f.x, y1: f.y, x2: t.x, y2: t.y };
      }
    }
  }
  return best;
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
  const [anchorActiveMember, setAnchorActiveMember] = useState<string | null>(null);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [emotionalLinks, setEmotionalLinks] = useState<EmotionalLink[]>(SAMPLE_EMOTIONAL_LINKS);
  const [unions, setUnions] = useState<Union[]>(SAMPLE_UNIONS);
  const [editingUnionId, setEditingUnionId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [dragInfo, setDragInfo] = useState<{
    id: string; startX: number; startY: number; memberX: number; memberY: number;
  } | null>(null);

  // Link drag state
  const [linkDrag, setLinkDrag] = useState<{
    fromId: string;
    startX: number; startY: number;
    cursorX: number; cursorY: number;
    snapX?: number; snapY?: number; // snapped target point
    snapTargetId?: string;
  } | null>(null);
  const [linkModalTarget, setLinkModalTarget] = useState<{ fromId: string; toId: string } | null>(null);
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
    // Link drag in progress — update cursor position in world space + snap detection
    if (linkDrag) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cursorX = (e.clientX - rect.left - pan.x) / zoom;
      const cursorY = (e.clientY - rect.top - pan.y) / zoom;

      // Snap magnetism: find nearest corner of any target card within SNAP_RADIUS
      const SNAP_RADIUS = 30; // world-space pixels
      let snapX: number | undefined;
      let snapY: number | undefined;
      let snapTargetId: string | undefined;
      let bestDist = SNAP_RADIUS;

      for (const m of members) {
        if (m.id === linkDrag.fromId) continue;
        const corners = cardCorners(m);
        for (const c of corners) {
          const d = Math.hypot(cursorX - c.x, cursorY - c.y);
          if (d < bestDist) {
            bestDist = d;
            snapX = c.x;
            snapY = c.y;
            snapTargetId = m.id;
          }
        }
      }

      setLinkDrag(prev => prev ? { ...prev, cursorX, cursorY, snapX, snapY, snapTargetId } : null);
      return;
    }
    if (dragInfo) {
      const dx = (e.clientX - dragInfo.startX) / zoom;
      const dy = (e.clientY - dragInfo.startY) / zoom;
      let newX = dragInfo.memberX + dx;
      let newY = dragInfo.memberY + dy;
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
  }, [dragInfo, linkDrag, isPanning, zoom, pan, snapToGrid]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Link drag release — use snapped target or find card under cursor
    if (linkDrag) {
      let targetId: string | undefined;

      // Prefer snap target
      if (linkDrag.snapTargetId) {
        targetId = linkDrag.snapTargetId;
      } else {
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const worldX = (e.clientX - rect.left - pan.x) / zoom;
          const worldY = (e.clientY - rect.top - pan.y) / zoom;
          const target = members.find(m =>
            m.id !== linkDrag.fromId &&
            worldX >= m.x && worldX <= m.x + CARD_W &&
            worldY >= m.y && worldY <= m.y + CARD_H
          );
          targetId = target?.id;
        }
      }

      if (targetId) {
        setLinkModalTarget({ fromId: linkDrag.fromId, toId: targetId });
      }
      setLinkDrag(null);
      return;
    }
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
  }, [dragInfo, linkDrag, snapToGrid, members, pan, zoom]);

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
      setAnchorActiveMember(null);
      return;
    }
  }, [isSpaceDown]);

  const handleSelect = useCallback((id: string) => {
    setSelectedMember(prev => prev === id ? null : id);
    setAnchorActiveMember(null);
  }, []);

  const getMemberState = useCallback((memberId: string) => {
    if (anchorActiveMember === memberId) return 'anchor-active' as const;
    if (selectedMember === memberId) return 'selected' as const;
    if (hoveredMember === memberId) return 'hover' as const;
    return 'default' as const;
  }, [selectedMember, hoveredMember, anchorActiveMember]);

  const handleCreateRelated = useCallback((id: string) => {
    console.log('Create related member for', id);
  }, []);

  const handleEdit = useCallback((id: string) => {
    console.log('Edit member', id);
  }, []);

  const handleCancelAnchor = useCallback((id: string) => {
    setAnchorActiveMember(null);
  }, []);

  // ─── Link drag handlers ───
  const handleLinkDragStart = useCallback((fromId: string, e: React.MouseEvent) => {
    setAnchorActiveMember(fromId);
    const member = members.find(m => m.id === fromId);
    if (!member) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    // Source anchor = center of card in world space
    const cx = member.x + CARD_W / 2;
    const cy = member.y + CARD_H / 2;
    // Cursor in world space
    const cursorWorldX = (e.clientX - rect.left - pan.x) / zoom;
    const cursorWorldY = (e.clientY - rect.top - pan.y) / zoom;
    setLinkDrag({ fromId, startX: cx, startY: cy, cursorX: cursorWorldX, cursorY: cursorWorldY });
  }, [members, pan, zoom]);


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
    const result = computeAutoLayout(members, unions, emotionalLinks);
    setIsAnimating(true);
    setMembers(prev => prev.map(m => {
      const pos = result.positions.get(m.id);
      return pos ? { ...m, x: pos.x, y: pos.y } : m;
    }));
    setTimeout(() => {
      setIsAnimating(false);
      handleFitToScreen();
    }, 900); // Match spring animation duration
  }, [members, emotionalLinks, handleFitToScreen]);

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
  const cursorClass = linkDrag
    ? 'cursor-crosshair'
    : isSpaceDown || isPanning
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
            <FamilyLinkLines members={members} unions={unions} onEditUnion={(id) => setEditingUnionId(id)} />
            {/* Emotional links SVG overlay — z-index 50, ABOVE cards (z-10) */}
            <svg className="absolute pointer-events-none" style={{ zIndex: 50, overflow: 'visible', top: 0, left: 0, width: 1, height: 1 }}>
              {/* Over-card transparency mask: full opacity in void, 0.25 over card surfaces */}
              <defs>
                <mask id="card-depth-mask">
                  {/* White = full visibility everywhere */}
                  <rect x="-99999" y="-99999" width="199998" height="199998" fill="white" />
                  {/* Dark rects over cards = heavily reduced visibility (~0.2 opacity) */}
                  {members.map(m => (
                    <rect
                      key={`mask-${m.id}`}
                      x={m.x - 2} y={m.y - 2}
                      width={CARD_W + 4} height={CARD_H + 4}
                      rx={12}
                      fill="rgba(255,255,255,0.2)"
                    />
                  ))}
                </mask>
              </defs>
              <g style={{ pointerEvents: 'auto' }} mask="url(#card-depth-mask)">
                {(() => {
                   // Build card rects for collision avoidance
                    const cardRects = members.map(m => ({ id: m.id, x: m.x, y: m.y, w: CARD_W, h: CARD_H }));
                  const pairMap = new Map<string, number[]>();
                  emotionalLinks.forEach((link, i) => {
                    const key = [link.from, link.to].sort().join('|');
                    if (!pairMap.has(key)) pairMap.set(key, []);
                    pairMap.get(key)!.push(i);
                  });
                  return emotionalLinks.map((link, globalIdx) => {
                    const from = members.find(m => m.id === link.from);
                    const to = members.find(m => m.id === link.to);
                    if (!from || !to) return null;
                    const anchors = getEmotionalAnchors(from, to);
                    const key = [link.from, link.to].sort().join('|');
                    const group = pairMap.get(key)!;
                    const linkIndex = group.indexOf(globalIdx);
                    const isDimmed = !!hoveredMember && link.from !== hoveredMember && link.to !== hoveredMember;
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
                        dimmed={isDimmed}
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
                isLinkTarget={!!linkDrag && linkDrag.fromId !== member.id}
                onSelect={handleSelect}
                onDragStart={handleDragStart}
                onCreateRelated={handleCreateRelated}
                onEdit={handleEdit}
                onHover={setHoveredMember}
                onLinkDragStart={handleLinkDragStart}
                onCancelAnchor={handleCancelAnchor}
              />
            ))}
            {/* Elastic link line while dragging */}
            {linkDrag && (
              <ElasticLinkLine
                x1={linkDrag.startX} y1={linkDrag.startY}
                x2={linkDrag.cursorX} y2={linkDrag.cursorY}
                snapX={linkDrag.snapX} snapY={linkDrag.snapY}
                isSnapped={!!linkDrag.snapTargetId}
              />
            )}
          </div>

          {/* Link type selection modal */}
          <LinkTypeModal
            open={!!linkModalTarget}
            onSelect={(type: EmotionalLinkType) => {
              if (linkModalTarget) {
                const newLink: EmotionalLink = {
                  id: `el-${Date.now()}`,
                  from: linkModalTarget.fromId,
                  to: linkModalTarget.toId,
                  type,
                };
                setEmotionalLinks(prev => [...prev, newLink]);
              }
              setLinkModalTarget(null);
            }}
            onClose={() => setLinkModalTarget(null)}
          />

          <UnionEditDrawer
            union={unions.find(u => u.id === editingUnionId) ?? null}
            open={!!editingUnionId}
            onClose={() => setEditingUnionId(null)}
            onUpdate={(updated) => setUnions(prev => prev.map(u => u.id === updated.id ? updated : u))}
            getMemberName={(id) => {
              const m = members.find(m => m.id === id);
              return m ? `${m.firstName} ${m.lastName}` : id;
            }}
          />

          <FloatingControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitToScreen={handleFitToScreen}
            onAutoLayout={handleAutoLayout}
            zoom={zoom}
            snapToGrid={snapToGrid}
            onToggleSnap={() => setSnapToGrid(prev => !prev)}
          />
        </div>
      </div>
    </div>
  );
};

export default GenogramEditor;
