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
            {/* Emotional links SVG overlay */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1, pointerEvents: 'none' }}>
              <g style={{ pointerEvents: 'auto' }}>
                {SAMPLE_EMOTIONAL_LINKS.map(link => {
                  const from = members.find(m => m.id === link.from);
                  const to = members.find(m => m.id === link.to);
                  if (!from || !to) return null;
                  return (
                    <EmotionalLinkLine
                      key={link.id}
                      x1={from.x + 80} y1={from.y + 25}
                      x2={to.x + 80} y2={to.y + 25}
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
