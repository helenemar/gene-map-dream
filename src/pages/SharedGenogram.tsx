import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';
import MemberCard from '@/components/MemberCard';
import FamilyLinkLines from '@/components/FamilyLinkLines';
import EmotionalLinkLine from '@/components/EmotionalLinkLine';
import FloatingControls from '@/components/FloatingControls';
import { Eye, Pencil, AlertCircle } from 'lucide-react';
import gogyIcon from '@/assets/genogy-icon.svg';

const CARD_W = 220;
const CARD_H = 64;
const DOT_SPACING = 22;

type AccessLevel = 'reader' | 'editor';

interface SharedData {
  genogram_id: string;
  genogram_name: string;
  genogram_data: any;
  access_level: AccessLevel;
}

const SharedGenogram: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SharedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Canvas state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data: result, error: err } = await supabase.rpc('get_shared_genogram', { p_token: token });
      if (err || !result || (Array.isArray(result) && result.length === 0)) {
        setError('Ce lien de partage est invalide ou a expiré.');
        setLoading(false);
        return;
      }
      const row = Array.isArray(result) ? result[0] : result;
      setData(row as SharedData);
      setLoading(false);
    })();
  }, [token]);

  // Redirect editors to the full shared editor
  useEffect(() => {
    if (data?.access_level === 'editor' && token) {
      navigate(`/shared-edit/${token}`, { replace: true });
    }
  }, [data, token, navigate]);

  // Parse genogram data
  const members: FamilyMember[] = data?.genogram_data?.members || [];
  const unions: Union[] = data?.genogram_data?.unions || [];
  const emotionalLinks: EmotionalLink[] = data?.genogram_data?.emotionalLinks || [];

  // Fit to screen on load
  useEffect(() => {
    if (members.length === 0 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    members.forEach(m => {
      minX = Math.min(minX, m.x);
      minY = Math.min(minY, m.y);
      maxX = Math.max(maxX, m.x + CARD_W);
      maxY = Math.max(maxY, m.y + CARD_H);
    });
    const contentW = maxX - minX + 200;
    const contentH = maxY - minY + 200;
    const z = Math.min(rect.width / contentW, rect.height / contentH, 1.5) * 0.9;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    setZoom(z);
    setPan({ x: rect.width / 2 - cx * z, y: rect.height / 2 - cy * z });
  }, [members]);

  // Panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  // Wheel zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      const newZoom = Math.min(Math.max(zoom * factor, 0.15), 3);
      setPan({
        x: mx - (mx - pan.x) * (newZoom / zoom),
        y: my - (my - pan.y) * (newZoom / zoom),
      });
      setZoom(newZoom);
    };
    canvas.addEventListener('wheel', handler, { passive: false });
    return () => canvas.removeEventListener('wheel', handler);
  }, [zoom, pan]);

  const dotSize = DOT_SPACING * zoom;
  const dotGridStyle: React.CSSProperties = {
    backgroundImage: `radial-gradient(circle, hsl(var(--canvas-dot)) ${Math.max(0.5, zoom)}px, transparent ${Math.max(0.5, zoom)}px)`,
    backgroundSize: `${dotSize}px ${dotSize}px`,
    backgroundPosition: `${pan.x % dotSize}px ${pan.y % dotSize}px`,
    backgroundColor: 'hsl(var(--canvas-bg))',
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-lg font-medium text-foreground">{error || 'Génogramme introuvable'}</p>
        <button onClick={() => navigate('/')} className="text-sm text-primary hover:underline">
          Retour à l'accueil
        </button>
      </div>
    );
  }

  // Emotional link anchor helper
  const getEmotionalAnchors = (from: FamilyMember, to: FamilyMember) => {
    const cx1 = from.x + CARD_W / 2, cy1 = from.y + CARD_H / 2;
    const cx2 = to.x + CARD_W / 2, cy2 = to.y + CARD_H / 2;
    return { x1: cx1, y1: cy1, x2: cx2, y2: cy2 };
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <img src={gogyIcon} alt="Genogy" className="w-8 h-8" />
          <span className="text-sm font-medium text-foreground">{data.genogram_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
            data.access_level === 'editor'
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          }`}>
            {data.access_level === 'editor' ? <Pencil className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {data.access_level === 'editor' ? 'Accès éditeur' : 'Accès lecture seule'}
          </span>
        </div>
      </header>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        style={dotGridStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        >
          <FamilyLinkLines members={members} unions={unions} variant="shared" />

          {/* Emotional links — below cards (z-index 5) */}
          <svg className="absolute pointer-events-none" style={{ zIndex: 5, overflow: 'visible', top: 0, left: 0, width: 1, height: 1 }}>
            {emotionalLinks.map((link) => {
              const from = members.find(m => m.id === link.from);
              const to = members.find(m => m.id === link.to);
              if (!from || !to) return null;
              const anchors = getEmotionalAnchors(from, to);
              const cardRects = members.map(m => ({ id: m.id, x: m.x, y: m.y, w: CARD_W, h: CARD_H }));
              return (
                <EmotionalLinkLine
                  key={link.id}
                  x1={anchors.x1} y1={anchors.y1}
                  x2={anchors.x2} y2={anchors.y2}
                  type={link.type}
                  linkIndex={0}
                  linkCount={1}
                  cardRects={cardRects}
                  excludeIds={[link.from, link.to]}
                />
              );
            })}
          </svg>

          {/* Member cards */}
          {members.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              presentationMode={true}
              dynamicPathologies={[]}
            />
          ))}
        </div>

        <FloatingControls
          zoom={zoom}
          onZoomIn={() => {
            const newZ = Math.min(zoom * 1.2, 3);
            setZoom(newZ);
          }}
          onZoomOut={() => {
            const newZ = Math.max(zoom / 1.2, 0.15);
            setZoom(newZ);
          }}
          onFitToScreen={() => {
            if (!canvasRef.current || members.length === 0) return;
            const rect = canvasRef.current.getBoundingClientRect();
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            members.forEach(m => {
              minX = Math.min(minX, m.x);
              minY = Math.min(minY, m.y);
              maxX = Math.max(maxX, m.x + CARD_W);
              maxY = Math.max(maxY, m.y + CARD_H);
            });
            const contentW = maxX - minX + 200;
            const contentH = maxY - minY + 200;
            const z = Math.min(rect.width / contentW, rect.height / contentH, 1.5) * 0.9;
            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;
            setZoom(z);
            setPan({ x: rect.width / 2 - cx * z, y: rect.height / 2 - cy * z });
          }}
          presentationMode={true}
        />
      </div>
    </div>
  );
};

export default SharedGenogram;
