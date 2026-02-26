import React, { useState, useCallback, useRef } from 'react';
import EditorHeader from '@/components/EditorHeader';
import EditorSidebar from '@/components/EditorSidebar';
import MemberCard from '@/components/MemberCard';
import RelationshipLines from '@/components/RelationshipLines';
import FloatingControls from '@/components/FloatingControls';
import { SAMPLE_MEMBERS, SAMPLE_RELATIONSHIPS } from '@/data/sampleData';
import { FamilyMember } from '@/types/genogram';

const GenogramEditor: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>(SAMPLE_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
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
            {members.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                isSelected={selectedMember === member.id}
                onSelect={setSelectedMember}
                onDragStart={handleDragStart}
              />
            ))}
          </div>

          <FloatingControls
            onZoomIn={() => setZoom(z => Math.min(z + 0.1, 2))}
            onZoomOut={() => setZoom(z => Math.max(z - 0.1, 0.3))}
          />
        </div>
      </div>
    </div>
  );
};

export default GenogramEditor;
