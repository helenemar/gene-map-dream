import React, { useState, useCallback, useRef } from 'react';
import EditorHeader from '@/components/EditorHeader';
import EditorSidebar from '@/components/EditorSidebar';
import MemberCard from '@/components/MemberCard';
import RelationshipLines from '@/components/RelationshipLines';
import EmotionalLinkLine from '@/components/EmotionalLinkLine';
import FloatingControls from '@/components/FloatingControls';
import { SAMPLE_MEMBERS, SAMPLE_RELATIONSHIPS, SAMPLE_EMOTIONAL_LINKS } from '@/data/sampleData';
import { FamilyMember } from '@/types/genogram';

type EditorMode = 'select' | 'link';

// Card bounding box — measured from MemberCard layout
// p-2(8) + icon w-12(48) + gap-3(12) + text(~110) + p-2(8) ≈ 186px
// p-2(8) + icon h-12(48) + p-2(8) ≈ 64px
const CARD_W = 186;
const CARD_H = 64;
const MARGIN = 5; // safety margin from card edge

type Side = 'top' | 'bottom' | 'left' | 'right';

interface AnchorPoint {
  x: number;
  y: number;
  side: Side;
}

/**
 * Compute the 4 anchor points on a card's bounding box, already inset by MARGIN.
 */
function cardAnchors(m: FamilyMember): AnchorPoint[] {
  return [
    { x: m.x + CARD_W / 2, y: m.y - MARGIN,            side: 'top' },
    { x: m.x + CARD_W / 2, y: m.y + CARD_H + MARGIN,   side: 'bottom' },
    { x: m.x - MARGIN,              y: m.y + CARD_H / 2, side: 'left' },
    { x: m.x + CARD_W + MARGIN,     y: m.y + CARD_H / 2, side: 'right' },
  ];
}

/**
 * Directional anchor selection:
 * - Determine the dominant axis between two card centers
 * - Select the appropriate anchor pair (top/bottom or left/right)
 * - Returns anchor points with side info for path routing
 */
function getDirectionalAnchors(
  from: FamilyMember,
  to: FamilyMember
): { x1: number; y1: number; x2: number; y2: number; fromSide: Side; toSide: Side } {
  const fromCx = from.x + CARD_W / 2;
  const fromCy = from.y + CARD_H / 2;
  const toCx = to.x + CARD_W / 2;
  const toCy = to.y + CARD_H / 2;

  const dx = toCx - fromCx;
  const dy = toCy - fromCy;

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  const fromAnchors = cardAnchors(from);
  const toAnchors = cardAnchors(to);

  let fromSide: Side;
  let toSide: Side;

  // Check if cards overlap on one axis — if so, use the other axis
  const overlapX = from.x < to.x + CARD_W && to.x < from.x + CARD_W;
  const overlapY = from.y < to.y + CARD_H && to.y < from.y + CARD_H;

  if (overlapY && !overlapX) {
    // Side by side — use left/right
    fromSide = dx > 0 ? 'right' : 'left';
    toSide = dx > 0 ? 'left' : 'right';
  } else if (overlapX && !overlapY) {
    // Stacked vertically — use top/bottom
    fromSide = dy > 0 ? 'bottom' : 'top';
    toSide = dy > 0 ? 'top' : 'bottom';
  } else if (absDx > absDy) {
    // Dominant horizontal
    fromSide = dx > 0 ? 'right' : 'left';
    toSide = dx > 0 ? 'left' : 'right';
  } else {
    // Dominant vertical
    fromSide = dy > 0 ? 'bottom' : 'top';
    toSide = dy > 0 ? 'top' : 'bottom';
  }

  const fa = fromAnchors.find(a => a.side === fromSide)!;
  const ta = toAnchors.find(a => a.side === toSide)!;

  return { x1: fa.x, y1: fa.y, x2: ta.x, y2: ta.y, fromSide, toSide };
}

const GenogramEditor: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>(SAMPLE_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [mode, setMode] = useState<EditorMode>('select');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragInfo, setDragInfo] = useState<{ id: string; startX: number; startY: number; memberX: number; memberY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((id: string, e: React.MouseEvent) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    setDragInfo({ id, startX: e.clientX, startY: e.clientY, memberX: member.x, memberY: member.y });
  }, [members]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragInfo) {
      const dx = (e.clientX - dragInfo.startX) / zoom;
      const dy = (e.clientY - dragInfo.startY) / zoom;
      setMembers(prev => prev.map(m =>
        m.id === dragInfo.id ? { ...m, x: dragInfo.memberX + dx, y: dragInfo.memberY + dy } : m
      ));
    } else if (isPanning) {
      setPan(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    }
  }, [dragInfo, isPanning, zoom]);

  const handleMouseUp = useCallback(() => {
    setDragInfo(null);
    setIsPanning(false);
  }, []);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('dot-grid')) {
      setIsPanning(true);
      setSelectedMember(null);
    }
  }, []);

  const handleSelect = useCallback((id: string) => {
    if (mode === 'link') {
      // In link mode, clicking a member would create a link (future feature)
      // For now just select
      setSelectedMember(prev => prev === id ? null : id);
    } else {
      setSelectedMember(prev => prev === id ? null : id);
    }
  }, [mode]);

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
    // Future: open creation modal
    console.log('Create related member for', id);
  }, []);

  const handleEdit = useCallback((id: string) => {
    // Future: open edit panel
    console.log('Edit member', id);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      <EditorHeader />
      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar members={members} fileName="Nouveau fichier" />
        
        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden dot-grid cursor-grab active:cursor-grabbing"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            <RelationshipLines members={members} relationships={SAMPLE_RELATIONSHIPS} />
            {/* Emotional links SVG overlay — z-index 0 so cards render above */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0, pointerEvents: 'none' }}>
              <g style={{ pointerEvents: 'auto' }}>
                {SAMPLE_EMOTIONAL_LINKS.map(link => {
                  const from = members.find(m => m.id === link.from);
                  const to = members.find(m => m.id === link.to);
                  if (!from || !to) return null;
                  const anchors = getDirectionalAnchors(from, to);
                  return (
                    <EmotionalLinkLine
                      key={link.id}
                      x1={anchors.x1} y1={anchors.y1}
                      x2={anchors.x2} y2={anchors.y2}
                      type={link.type}
                      onClick={() => console.log('Edit emotional link', link.id)}
                    />
                  );
                })}
              </g>
            </svg>
            {members.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                isSelected={selectedMember === member.id}
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
            onZoomIn={() => setZoom(z => Math.min(z + 0.1, 2))}
            onZoomOut={() => setZoom(z => Math.max(z - 0.1, 0.3))}
            mode={mode}
            onToggleMode={handleToggleMode}
          />
        </div>
      </div>
    </div>
  );
};

export default GenogramEditor;
