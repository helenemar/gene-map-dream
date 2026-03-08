import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DossierNotesModal, { useGenogramNoteCount } from '@/components/DossierNotesModal';
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
import MemberEditDrawer from '@/components/MemberEditDrawer';
import { RelationshipChoice } from '@/components/CreateMemberDropdown';
import type { DisabledOptions } from '@/components/CreateMemberDropdown';
import ParentPicker from '@/components/ParentPicker';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SAMPLE_MEMBERS, SAMPLE_UNIONS, SAMPLE_EMOTIONAL_LINKS } from '@/data/sampleData';
import { FamilyMember, EmotionalLink, EmotionalLinkType, Union, UnionStatus } from '@/types/genogram';
import { computeAutoLayout } from '@/utils/autoLayout';
import { exportAsPng, exportAsSvg, exportAsPdf } from '@/utils/exportCanvas';
import { useFamilySearch } from '@/hooks/useFamilySearch';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePathologies } from '@/hooks/usePathologies';
import { toast } from 'sonner';
import { Undo2, Redo2 } from 'lucide-react';

// Card bounding box
const CARD_W = MEMBER_CARD_W;
const CARD_H = 64;
const MARGIN = 5;
const MIN_ZOOM = 0.15;
const MAX_ZOOM = 3;
const ZOOM_SENSITIVITY = 0.002;
const DOT_SPACING = 20;
const SNAP_GRID_X = 20;
const SNAP_GRID_Y = 20;  // Fine grid for smooth dragging
const LEVEL_SPACING_SNAP = 250; // Must match autoLayout LEVEL_SPACING
const SNAP_LEVEL_THRESHOLD = 40; // Snap to generation Y row when within this distance
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
  const { id: genogramId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [dbLoaded, setDbLoaded] = useState(false);

  // Initialize with empty state — will be populated from DB or sample data
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    if (genogramId) return []; // Will load from DB
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
  const [emotionalLinks, setEmotionalLinks] = useState<EmotionalLink[]>(() => genogramId ? [] : SAMPLE_EMOTIONAL_LINKS);
  const [unions, setUnions] = useState<Union[]>(() => genogramId ? [] : SAMPLE_UNIONS);
  const search = useFamilySearch(members, unions, emotionalLinks);
  const { pathologies: dynamicPathologies, addPathology, deletePathology } = usePathologies(genogramId);
  const [editingUnionId, setEditingUnionId] = useState<string | null>(null);
  const [fileName, setFileName] = useState('Sans titre');
  const [isAnimating, setIsAnimating] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [smartGuides, setSmartGuides] = useState<{ type: 'horizontal' | 'vertical'; pos: number; from: number; to: number }[]>([]);
  const [highlightedUnionStatus, setHighlightedUnionStatus] = useState<UnionStatus | null>(null);
  const [soloEmotionalType, setSoloEmotionalType] = useState<EmotionalLinkType | null>(null);
  const [emotionalLinksVisible, setEmotionalLinksVisible] = useState(true);
  const [pathologiesVisible, setPathologiesVisible] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [presentationMode, setPresentationMode] = useState(false);
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
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);

  // ─── Notes du dossier ───
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const noteCount = useGenogramNoteCount(genogramId);

  // ─── Auto-save ───
  const { saveStatus, debouncedSave } = useAutoSave(genogramId ?? null);

  // ─── Load genogram from DB ───
  useEffect(() => {
    if (!genogramId || !user) return;
    const load = async () => {
      const { data, error } = await supabase
        .from('genograms')
        .select('*')
        .eq('id', genogramId)
        .eq('user_id', user.id)
        .single();
      if (error || !data) {
        toast.error('Génogramme introuvable');
        navigate('/dashboard');
        return;
      }
      setFileName(data.name);
      const gData = data.data as any;
      // Deduplicate members by ID (guard against data corruption)
      const rawMembers: FamilyMember[] = gData?.members || [];
      const seen = new Set<string>();
      const loadedMembers = rawMembers.filter(m => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });
      if (loadedMembers.length > 0) setMembers(loadedMembers);
      if (gData?.unions) setUnions(gData.unions);
      if (gData?.emotionalLinks) setEmotionalLinks(gData.emotionalLinks);
      setDbLoaded(true);

      // Center canvas on first member (patient index) after load
      if (loadedMembers.length > 0) {
        requestAnimationFrame(() => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          const m = loadedMembers[0];
          setPan({
            x: rect.width / 2 - (m.x + CARD_W / 2),
            y: rect.height / 2 - (m.y + CARD_H / 2),
          });
        });
      }
    };
    load();
  }, [genogramId, user]);

  // ─── Trigger auto-save on data changes ───
  useEffect(() => {
    if (!genogramId || !dbLoaded) return;
    debouncedSave({ members, unions, emotionalLinks }, fileName);
  }, [members, unions, emotionalLinks, fileName, genogramId, dbLoaded]);

  // ─── Undo/Redo system ───
  type CanvasSnapshot = { members: FamilyMember[]; unions: Union[]; emotionalLinks: EmotionalLink[] };
  const history = useUndoRedo<CanvasSnapshot>();

  const recordSnapshot = useCallback(() => {
    history.record({
      members: members.map(m => ({ ...m })),
      unions: unions.map(u => ({ ...u, children: [...u.children] })),
      emotionalLinks: emotionalLinks.map(l => ({ ...l })),
    });
  }, [members, unions, emotionalLinks, history]);

  const handleUndo = useCallback(() => {
    const snapshot = history.undo({ members, unions, emotionalLinks });
    if (snapshot) {
      setMembers(snapshot.members);
      setUnions(snapshot.unions);
      setEmotionalLinks(snapshot.emotionalLinks);
      toast('Action annulée', { icon: <Undo2 className="w-4 h-4" />, duration: 2000 });
    }
  }, [members, unions, emotionalLinks, history]);

  const handleRedo = useCallback(() => {
    const snapshot = history.redo({ members, unions, emotionalLinks });
    if (snapshot) {
      setMembers(snapshot.members);
      setUnions(snapshot.unions);
      setEmotionalLinks(snapshot.emotionalLinks);
      toast('Action rétablie', { icon: <Redo2 className="w-4 h-4" />, duration: 2000 });
    }
  }, [members, unions, emotionalLinks, history]);

  // Keyboard shortcuts: Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z / Ctrl+Y
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((mod && e.key === 'z' && e.shiftKey) || (e.ctrlKey && e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo, handleRedo]);

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
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
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
    recordSnapshot(); // Record before position change
    setDragInfo({ id, startX: e.clientX, startY: e.clientY, memberX: member.x, memberY: member.y });
  }, [members, isSpaceDown, recordSnapshot]);

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
        newX = Math.round(newX / SNAP_GRID_X) * SNAP_GRID_X;
        // Snap Y to nearest occupied generation row (other members' Y positions)
        // This keeps manually-dragged cards aligned with auto-layout rows
        const occupiedYs = new Set<number>();
        for (const other of members) {
          if (other.id !== dragInfo.id) occupiedYs.add(other.y);
        }
        let bestSnapY = Math.round(newY / SNAP_GRID_Y) * SNAP_GRID_Y;
        let bestDist = SNAP_LEVEL_THRESHOLD + 1;
        for (const oy of occupiedYs) {
          const dist = Math.abs(newY - oy);
          if (dist < bestDist) {
            bestDist = dist;
            bestSnapY = oy;
          }
        }
        if (bestDist > SNAP_LEVEL_THRESHOLD) {
          bestSnapY = Math.round(newY / SNAP_GRID_Y) * SNAP_GRID_Y;
        }
        newY = bestSnapY;
      }
      // Smart guides: detect alignment with other members on same generation
      const GUIDE_THRESHOLD = 8;
      const guides: typeof smartGuides = [];
      for (const other of members) {
        if (other.id === dragInfo.id) continue;
        // Horizontal alignment (same Y → same generation row)
        if (Math.abs(other.y - newY) < GUIDE_THRESHOLD) {
          newY = other.y;
          const minX = Math.min(newX + CARD_W / 2, other.x + CARD_W / 2);
          const maxX = Math.max(newX + CARD_W / 2, other.x + CARD_W / 2);
          guides.push({ type: 'horizontal', pos: other.y + CARD_H / 2, from: minX, to: maxX });
        }
        // Vertical alignment (same X center)
        const otherCx = other.x + CARD_W / 2;
        const newCx = newX + CARD_W / 2;
        if (Math.abs(otherCx - newCx) < GUIDE_THRESHOLD) {
          newX = other.x;
          const minY = Math.min(newY + CARD_H / 2, other.y + CARD_H / 2);
          const maxY = Math.max(newY + CARD_H / 2, other.y + CARD_H / 2);
          guides.push({ type: 'vertical', pos: otherCx, from: minY, to: maxY });
        }
      }
      setSmartGuides(guides);
      setMembers(prev => prev.map(m =>
        m.id === dragInfo.id ? { ...m, x: newX, y: newY } : m
      ));
    } else if (isPanning) {
      setPan(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
    }
  }, [dragInfo, linkDrag, isPanning, zoom, pan, snapToGrid, members]);

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
          ? { ...m, x: Math.round(m.x / SNAP_GRID_X) * SNAP_GRID_X, y: Math.round(m.y / SNAP_GRID_Y) * SNAP_GRID_Y }
          : m
      ));
    }
    setSmartGuides([]);
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

  // ─── New member state ───
  const [editingNewMember, setEditingNewMember] = useState<FamilyMember | null>(null);
  const [newMemberDrawerOpen, setNewMemberDrawerOpen] = useState(false);

  // ─── Parent picker state (for child creation with multiple unions) ───
  const [parentPickerState, setParentPickerState] = useState<{
    sourceId: string;
    open: boolean;
  } | null>(null);
  const [pendingPerinatalType, setPendingPerinatalType] = useState<import('@/types/genogram').PerinatalType | null>(null);
  const [pendingStillbornGender, setPendingStillbornGender] = useState<'male' | 'female' | null>(null);

  // (standalone links removed — all children go through unions now)

  /** Center canvas on a specific member with smooth animation */
  const centerOnMember = useCallback((member: FamilyMember) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const targetX = rect.width / 2 - (member.x + CARD_W / 2) * zoom;
    const targetY = rect.height / 2 - (member.y + CARD_H / 2) * zoom;
    setPan({ x: targetX, y: targetY });
  }, [zoom]);

  /** Focus on member: center + select + briefly highlight */
  const handleFocusMember = useCallback((member: FamilyMember) => {
    centerOnMember(member);
    setSelectedMember(member.id);
  }, [centerOnMember]);

  /** Toggle solo emotional type: same type = off, different type = switch */
  const handleToggleSoloEmotional = useCallback((type: EmotionalLinkType) => {
    setSoloEmotionalType(prev => prev === type ? null : type);
  }, []);

  /** Compute disabled dropdown options for a member (guard clauses) */
  const getDisabledOptions = useCallback((memberId: string): DisabledOptions => {
    const disabled: DisabledOptions = {};
    // Find all unions where this member is a child
    const parentUnions = unions.filter(u => u.children.includes(memberId));
    const bioUnion = parentUnions.find(u => !u.isAdoption);
    const adoptiveUnion = parentUnions.find(u => u.isAdoption);

    if (parentUnions.length === 0) {
      // No parents at all — single 'parent' option is fine
    } else if (bioUnion && adoptiveUnion) {
      // Has both bio + adoptive parents — disable all parent options
      disabled.parent = 'Ce membre a déjà ses parents biologiques et adoptifs';
      disabled.parent_bio = 'Ce membre a déjà ses parents biologiques';
      disabled.parent_adoptive = 'Ce membre a déjà ses parents adoptifs';
    } else {
      // Has one pair — disable the existing one, keep the other
      disabled.parent = 'Ce membre a déjà une paire de parents';
      if (bioUnion) {
        disabled.parent_bio = 'Ce membre a déjà ses parents biologiques';
      }
      if (adoptiveUnion) {
        disabled.parent_adoptive = 'Ce membre a déjà ses parents adoptifs';
      }
    }
    return disabled;
  }, [members, unions]);

  /** Should show split parent options (bio/adoptive) in dropdown */
  const shouldShowParentSplit = useCallback((memberId: string): boolean => {
    const parentUnions = unions.filter(u => u.children.includes(memberId));
    // Show split when member already has one pair of parents (to add the other type)
    return parentUnions.length > 0;
  }, [unions]);

  /** Check if a member is adopted (child in an adoption union) */
  const isMemberAdopted = useCallback((memberId: string): boolean => {
    return unions.some(u => u.isAdoption && u.children.includes(memberId));
  }, [unions]);

  /** Smart placement: compute position for new member based on relationship */
  const computeNewPosition = useCallback((
    sourceId: string,
    relationship: RelationshipChoice
  ): { x: number; y: number } => {
    const source = members.find(m => m.id === sourceId);
    if (!source) return { x: 200, y: 200 };

    const LEVEL_Y = 250;
    const SPOUSE_GAP = CARD_W + 120; // card width + badge space

    switch (relationship) {
      case 'parent':
        return { x: source.x, y: source.y - LEVEL_Y };
      case 'child':
        return { x: source.x, y: source.y + LEVEL_Y };
      case 'sibling': {
        // Place to the right of rightmost sibling at same level
        const sameLevelMembers = members.filter(m => Math.abs(m.y - source.y) < 50);
        const maxX = Math.max(...sameLevelMembers.map(m => m.x + CARD_W));
        return { x: maxX + 80, y: source.y };
      }
      case 'spouse_married':
      case 'spouse_divorced':
      case 'spouse_separated':
      case 'spouse_widowed': {
        // Place to the right, leaving space for badge
        const rightSpace = members.filter(m =>
          Math.abs(m.y - source.y) < 50 && m.x > source.x
        );
        const placeRight = rightSpace.length === 0;
        return {
          x: placeRight ? source.x + SPOUSE_GAP : source.x - SPOUSE_GAP,
          y: source.y,
        };
      }
      default:
        return { x: source.x + 300, y: source.y };
    }
  }, [members]);

  /** Create a child and attach it to a specific union, create a new placeholder union, or create standalone */
  const executeChildCreation = useCallback((sourceId: string, targetUnionId?: string) => {
    const source = members.find(m => m.id === sourceId);
    const currentYear = new Date().getFullYear();
    const LEVEL_Y = 250;

    const perinatal = pendingPerinatalType;
    const perinatalLabels: Record<string, string> = {
      pregnancy: 'Grossesse',
      miscarriage: 'Interruption spontanée de grossesse',
      abortion: 'IVG',
      stillborn: 'Mortinaissance',
    };

    const newChild: FamilyMember = {
      id: `m-${Date.now()}`,
      firstName: perinatal ? (perinatalLabels[perinatal] || '') : '',
      lastName: perinatal ? '' : (source?.lastName || ''),
      birthYear: perinatal ? currentYear : 0,
      age: 0,
      profession: '',
      gender: pendingStillbornGender || 'female',
      x: source?.x ?? 200,
      y: (source?.y ?? 200) + LEVEL_Y,
      pathologies: [],
      ...(perinatal ? { perinatalType: perinatal } : {}),
    };

    // Clear pending perinatal type
    setPendingPerinatalType(null);
    setPendingStillbornGender(null);

    if (targetUnionId) {
      // Add child to an existing union
      const union = unions.find(u => u.id === targetUnionId);
      if (union) {
        // Position child centered under the couple
        const p1 = members.find(m => m.id === union.partner1);
        const p2 = members.find(m => m.id === union.partner2);
        if (p1 && p2) {
          const coupleLeft = Math.min(p1.x, p2.x);
          const coupleRight = Math.max(p1.x, p2.x) + CARD_W;
          newChild.x = (coupleLeft + coupleRight) / 2 - CARD_W / 2;
          newChild.y = Math.max(p1.y, p2.y) + LEVEL_Y;
        }
      }
      recordSnapshot();
      setMembers(prev => [...prev, newChild]);
      setUnions(prev => prev.map(u =>
        u.id === targetUnionId ? { ...u, children: [...u.children, newChild.id] } : u
      ));
    } else {
      // No union → create placeholder partner + union + push colliders
      const SPOUSE_GAP = CARD_W + 120;
      const placeholderId = `m-ph-${Date.now()}`;
      const sourceX = source?.x ?? 200;
      const sourceY = source?.y ?? 200;
      const placeholderX = sourceX + SPOUSE_GAP;

      const placeholder: FamilyMember = {
        id: placeholderId,
        firstName: '',
        lastName: '',
        birthYear: 0,
        age: 0,
        profession: '',
        gender: source?.gender === 'male' ? 'female' : 'male',
        x: placeholderX,
        y: sourceY,
        pathologies: [],
        isPlaceholder: true,
      };

      // Center child under the couple
      const coupleCenterX = (sourceX + placeholderX + CARD_W) / 2 - CARD_W / 2;
      newChild.x = coupleCenterX;
      newChild.y = sourceY + LEVEL_Y;

      // ── Dynamic Gap: push members that collide with new block ──
      const PUSH_MARGIN = 40;
      const blockRects = [
        { x: sourceX, y: sourceY, w: CARD_W, h: CARD_H },
        { x: placeholderX, y: sourceY, w: CARD_W, h: CARD_H },
        { x: coupleCenterX, y: sourceY + LEVEL_Y, w: CARD_W, h: CARD_H },
      ];
      const blockLeft = Math.min(...blockRects.map(r => r.x));
      const blockRight = Math.max(...blockRects.map(r => r.x + r.w));
      const blockTop = Math.min(...blockRects.map(r => r.y));
      const blockBottom = Math.max(...blockRects.map(r => r.y + r.h));

      const newIds = new Set([sourceId, placeholderId, newChild.id]);

      setMembers(prev => {
        const pushed = prev.map(m => {
          if (newIds.has(m.id)) return m;
          const mRight = m.x + CARD_W;
          const mBottom = m.y + CARD_H;
          const overlapX = m.x < blockRight + PUSH_MARGIN && mRight > blockLeft - PUSH_MARGIN;
          const overlapY = m.y < blockBottom + PUSH_MARGIN && mBottom > blockTop - PUSH_MARGIN;
          if (!overlapX || !overlapY) return m;
          const memberCenterX = m.x + CARD_W / 2;
          const blockCenterX = (blockLeft + blockRight) / 2;
          if (memberCenterX < blockCenterX) {
            return { ...m, x: Math.min(m.x, blockLeft - PUSH_MARGIN - CARD_W) };
          } else {
            return { ...m, x: Math.max(m.x, blockRight + PUSH_MARGIN) };
          }
        });
        return [...pushed, placeholder, newChild];
      });

      const newUnion: Union = {
        id: `u-${Date.now()}`,
        partner1: sourceId,
        partner2: placeholderId,
        status: 'married',
        children: [newChild.id],
      };
      setUnions(prev => [...prev, newUnion]);

      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);

      // Select and open drawer for new child (skip for perinatal)
      setSelectedMember(newChild.id);
      if (!perinatal) {
        setEditingNewMember(newChild);
        setDrawerEditing(true);
        setNewMemberDrawerOpen(true);
      }
      setTimeout(() => centerOnMember(newChild), 100);
      return;
    }

    // Select and open drawer for new child (existing union path, skip for perinatal)
    setSelectedMember(newChild.id);
    if (!perinatal) {
      setEditingNewMember(newChild);
      setDrawerEditing(true);
      setNewMemberDrawerOpen(true);
    }
    setTimeout(() => centerOnMember(newChild), 100);
  }, [members, unions, centerOnMember, pendingPerinatalType, pendingStillbornGender]);

  /** Create a child with an existing member as co-parent (creates a new union between them) */
  const executeChildCreationWithExisting = useCallback((sourceId: string, partnerId: string) => {
    const source = members.find(m => m.id === sourceId);
    const partner = members.find(m => m.id === partnerId);
    if (!source || !partner) return;

    const currentYear = new Date().getFullYear();
    const LEVEL_Y = 250;

    const coupleLeft = Math.min(source.x, partner.x);
    const coupleRight = Math.max(source.x, partner.x) + CARD_W;
    const coupleCenterX = (coupleLeft + coupleRight) / 2 - CARD_W / 2;
    const coupleBottomY = Math.max(source.y, partner.y);

    const newChild: FamilyMember = {
      id: `m-${Date.now()}`,
      firstName: '',
      lastName: source.lastName || '',
      birthYear: 0,
      age: 0,
      profession: '',
      gender: 'female',
      x: coupleCenterX,
      y: coupleBottomY + LEVEL_Y,
      pathologies: [],
    };

    const newUnion: Union = {
      id: `u-${Date.now()}`,
      partner1: sourceId,
      partner2: partnerId,
      status: 'love_affair',
      children: [newChild.id],
    };

    recordSnapshot();
    setMembers(prev => [...prev, newChild]);
    setUnions(prev => [...prev, newUnion]);
    setSelectedMember(newChild.id);
    setEditingNewMember(newChild);
    setDrawerEditing(true);
    setNewMemberDrawerOpen(true);
    setTimeout(() => centerOnMember(newChild), 100);
  }, [members, centerOnMember]);

  const handleCreateRelated = useCallback((sourceId: string, relationship: RelationshipChoice) => {
    // ── Perinatal events → same flow as child, but with perinatalType ──
    if (relationship.startsWith('perinatal_')) {
      const perinatalMap: Record<string, import('@/types/genogram').PerinatalType> = {
        perinatal_pregnancy: 'pregnancy',
        perinatal_miscarriage: 'miscarriage',
        perinatal_abortion: 'abortion',
        perinatal_stillborn: 'stillborn',
        perinatal_stillborn_male: 'stillborn',
        perinatal_stillborn_female: 'stillborn',
      };
      setPendingPerinatalType(perinatalMap[relationship] || null);
      if (relationship === 'perinatal_stillborn_male') setPendingStillbornGender('male');
      else if (relationship === 'perinatal_stillborn_female') setPendingStillbornGender('female');
      else setPendingStillbornGender(null);
      setParentPickerState({ sourceId, open: true });
      return;
    }

    // ── Always show parent picker for child creation ──
    if (relationship === 'child') {
      setPendingPerinatalType(null);
      setParentPickerState({ sourceId, open: true });
      return;
    }

    // ── Non-child relationships (spouse, parent, sibling) ──
    const pos = computeNewPosition(sourceId, relationship);
    const source = members.find(m => m.id === sourceId);
    const currentYear = new Date().getFullYear();

    const newMember: FamilyMember = {
      id: `m-${Date.now()}`,
      firstName: '',
      lastName: source?.lastName || '',
      birthYear: 0,
      age: 0,
      profession: '',
      gender: relationship.startsWith('spouse_') ? (source?.gender === 'male' ? 'female' : 'male') : 'female',
      x: pos.x,
      y: pos.y,
      pathologies: [],
    };

    // Determine union status for spouse types
    const statusMap: Record<string, UnionStatus> = {
      spouse_married: 'married',
      spouse_divorced: 'divorced',
      spouse_separated: 'separated',
      spouse_widowed: 'widowed',
    };

    recordSnapshot();
    setMembers(prev => [...prev, newMember]);

    // Create union for spouse relationships
    if (relationship.startsWith('spouse_')) {
      const status = statusMap[relationship] || 'married';
      const newUnion: Union = {
        id: `u-${Date.now()}`,
        partner1: sourceId,
        partner2: newMember.id,
        status,
        eventYear: currentYear,
        marriageYear: currentYear,
        children: [],
      };
      setUnions(prev => [...prev, newUnion]);
    }

    // For sibling: find union where source is a child, add new member as sibling
    if (relationship === 'sibling') {
      setUnions(prev => {
        const siblingUnion = prev.find(u => u.children.includes(sourceId));
        if (siblingUnion) {
          return prev.map(u =>
            u.id === siblingUnion.id ? { ...u, children: [...u.children, newMember.id] } : u
          );
        }
        return prev;
      });
    }

    // For parent / parent_bio / parent_adoptive: duo-parenting with guard clauses
    if (relationship === 'parent' || relationship === 'parent_bio' || relationship === 'parent_adoptive') {
      const isAdoption = relationship === 'parent_adoptive';
      const existingParentUnion = unions.find(u =>
        u.children.includes(sourceId) && (relationship === 'parent' || u.isAdoption === isAdoption)
      );
      const SPOUSE_GAP = 200;
      const LEVEL_Y = 250;

      if (existingParentUnion) {
        // Already has a parent union of this type — check if one parent is placeholder/draft
        const p1 = members.find(m => m.id === existingParentUnion.partner1);
        const p2 = members.find(m => m.id === existingParentUnion.partner2);
        const placeholderParent = [p1, p2].find(p => p && (p.isPlaceholder || p.isDraft));
        const realParent = [p1, p2].find(p => p && !p.isPlaceholder && !p.isDraft);

        if (!placeholderParent) {
          toast.error('Ce membre a déjà ses deux parents configurés');
          return;
        }

        // Replace placeholder with a new editable member of opposite gender
        const oppositeGender = realParent?.gender === 'male' ? 'female' : 'male';
        newMember.gender = oppositeGender;
        newMember.x = placeholderParent.x;
        newMember.y = placeholderParent.y;
        newMember.isDraft = true;
        if (isAdoption) newMember.isAdoptiveParent = true;

        recordSnapshot();
        setMembers(prev => prev.map(m => m.id === placeholderParent.id ? newMember : m));
        setUnions(prev => prev.map(u => {
          if (u.id !== existingParentUnion.id) return u;
          return {
            ...u,
            partner1: u.partner1 === placeholderParent.id ? newMember.id : u.partner1,
            partner2: u.partner2 === placeholderParent.id ? newMember.id : u.partner2,
          };
        }));
        setEmotionalLinks(prev => prev.map(l => ({
          ...l,
          from: l.from === placeholderParent.id ? newMember.id : l.from,
          to: l.to === placeholderParent.id ? newMember.id : l.to,
        })));
      } else {
        // No parent union of this type — create both parents (duo-parenting)
        const sourceM = members.find(m => m.id === sourceId);
        const sourceX = sourceM?.x ?? 200;
        const sourceY = sourceM?.y ?? 200;

        // If member already has a pair, position based on type:
        // - Adoptive parents go HIGHER (further from child)
        // - Bio parents go CLOSER to child (just above)
        const existingOtherPairUnion = unions.find(u => u.children.includes(sourceId));
        let yOffset = LEVEL_Y;
        if (existingOtherPairUnion) {
          // Adoptive pair goes higher up; bio pair stays closer to child
          yOffset = isAdoption ? LEVEL_Y + 120 : LEVEL_Y - 40;
        }
        // Moderate horizontal offset — keep both pairs centered on the child
        const xShift = existingOtherPairUnion ? (isAdoption ? SPOUSE_GAP + 40 : -(SPOUSE_GAP + 40)) : 0;

        newMember.x = sourceX - SPOUSE_GAP / 2 + xShift;
        newMember.y = sourceY - yOffset;
        newMember.gender = 'male';
        if (isAdoption) newMember.isAdoptiveParent = true;

        const draftParent: FamilyMember = {
          id: `m-draft-${Date.now() + 1}`,
          firstName: '',
          lastName: '',
          birthYear: 0,
          age: 0,
          profession: '',
          gender: 'female',
          x: sourceX + SPOUSE_GAP / 2 + xShift,
          y: sourceY - yOffset,
          pathologies: [],
          isDraft: true,
          ...(isAdoption ? { isAdoptiveParent: true } : {}),
        };

        const newUnion: Union = {
          id: `u-${Date.now()}`,
          partner1: newMember.id,
          partner2: draftParent.id,
          status: 'married',
          children: [sourceId],
          ...(isAdoption ? { isAdoption: true } : {}),
        };

        recordSnapshot();
        setMembers(prev => [...prev, newMember, draftParent]);
        setUnions(prev => [...prev, newUnion]);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);
      }

      // Select and open edit drawer
      setSelectedMember(newMember.id);
      setEditingNewMember(newMember);
      setDrawerEditing(true);
      setNewMemberDrawerOpen(true);
      setTimeout(() => centerOnMember(newMember), 100);
      return;
    }

    // Select and open edit drawer (non-parent relationships)
    setSelectedMember(newMember.id);
    setEditingNewMember(newMember);
    setDrawerEditing(true);
    setNewMemberDrawerOpen(true);
    setTimeout(() => centerOnMember(newMember), 100);
  }, [members, unions, computeNewPosition, centerOnMember, recordSnapshot]);

  const handleToggleLock = useCallback((id: string) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, locked: !m.locked } : m));
  }, []);

  const [drawerEditing, setDrawerEditing] = useState(true);

  const handleEdit = useCallback((id: string) => {
    const member = members.find(m => m.id === id);
    if (member) {
      setEditingNewMember(member);
      setDrawerEditing(true);
      setNewMemberDrawerOpen(true);
    }
  }, [members]);

  const handleView = useCallback((id: string) => {
    const member = members.find(m => m.id === id);
    if (member) {
      setEditingNewMember(member);
      setDrawerEditing(false);
      setNewMemberDrawerOpen(true);
    }
  }, [members]);

  const handleSaveMember = useCallback((updated: FamilyMember) => {
    const currentYear = new Date().getFullYear();
    const age = updated.birthYear ? currentYear - updated.birthYear : updated.age;
    // Clear placeholder flag when user fills in data
    recordSnapshot();
    setMembers(prev => prev.map(m => m.id === updated.id ? { ...updated, age, isPlaceholder: false } : m));
    setEditingNewMember(null);
  }, [recordSnapshot]);

  const [fadingOutIds, setFadingOutIds] = useState<Set<string>>(new Set());

  const handleDeleteMember = useCallback((id: string) => {
    recordSnapshot();

    // ── Collect all descendants recursively ──
    const collectDescendants = (memberId: string, visited: Set<string>): void => {
      if (visited.has(memberId)) return;
      visited.add(memberId);
      // Find unions where this member is a partner
      const parentUnions = unions.filter(u => u.partner1 === memberId || u.partner2 === memberId);
      for (const union of parentUnions) {
        for (const childId of union.children) {
          collectDescendants(childId, visited);
        }
        // Also cascade the other partner if it's a placeholder
        const otherPartnerId = union.partner1 === memberId ? union.partner2 : union.partner1;
        const otherPartner = members.find(m => m.id === otherPartnerId);
        if (otherPartner?.isPlaceholder && !visited.has(otherPartnerId)) {
          visited.add(otherPartnerId);
        }
      }
    };

    const toRemoveSet = new Set<string>();
    collectDescendants(id, toRemoveSet);

    // Also clean up placeholder parents from unions where deleted member was a child
    const childUnions = unions.filter(u => u.children.includes(id));
    for (const union of childUnions) {
      const remainingChildren = union.children.filter(c => !toRemoveSet.has(c));
      if (remainingChildren.length === 0) {
        const p1 = members.find(m => m.id === union.partner1);
        const p2 = members.find(m => m.id === union.partner2);
        if (p1?.isPlaceholder) toRemoveSet.add(p1.id);
        if (p2?.isPlaceholder) toRemoveSet.add(p2.id);
      }
    }

    if (toRemoveSet.size > 1) {
      // Animate fade-out for cascading deletion
      setFadingOutIds(toRemoveSet);
      setTimeout(() => {
        setFadingOutIds(new Set());
        setMembers(prev => prev.filter(m => !toRemoveSet.has(m.id)));
        setUnions(prev => prev
          .map(u => ({ ...u, children: u.children.filter(c => !toRemoveSet.has(c)) }))
          .filter(u => !toRemoveSet.has(u.partner1) && !toRemoveSet.has(u.partner2))
        );
        setEmotionalLinks(prev => prev.filter(l => !toRemoveSet.has(l.from) && !toRemoveSet.has(l.to)));
        setSelectedMember(null);
        setEditingNewMember(null);
      }, 350);
    } else {
      // Single member delete
      setMembers(prev => prev.filter(m => !toRemoveSet.has(m.id)));
      setUnions(prev => prev
        .map(u => ({ ...u, children: u.children.filter(c => !toRemoveSet.has(c)) }))
        .filter(u => u.partner1 !== id && u.partner2 !== id)
      );
      setEmotionalLinks(prev => prev.filter(l => !toRemoveSet.has(l.from) && !toRemoveSet.has(l.to)));
      setSelectedMember(null);
      setEditingNewMember(null);
    }
  }, [members, unions]);

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
    // Collect locked members' current positions
    const lockedPositions = new Map<string, { x: number; y: number }>();
    for (const m of members) {
      if (m.locked) lockedPositions.set(m.id, { x: m.x, y: m.y });
    }
    const result = computeAutoLayout(members, unions, emotionalLinks, lockedPositions.size > 0 ? lockedPositions : undefined);
    recordSnapshot();
    setIsAnimating(true);
    setMembers(prev => prev.map(m => {
      const pos = result.positions.get(m.id);
      return pos ? { ...m, x: pos.x, y: pos.y } : m;
    }));
    setTimeout(() => {
      setIsAnimating(false);
      handleFitToScreen();
    }, 900); // Match spring animation duration
  }, [members, unions, emotionalLinks, handleFitToScreen]);

  // ─── Auto-layout on member/union count change (including initial load) ───
  const prevMemberCountRef = React.useRef<number | null>(null);
  const prevUnionCountRef = React.useRef<number | null>(null);
  const initialLayoutDoneRef = React.useRef(false);
  useEffect(() => {
    const membersChanged = prevMemberCountRef.current !== null && members.length > prevMemberCountRef.current;
    const unionsChanged = prevUnionCountRef.current !== null && unions.length > prevUnionCountRef.current;
    const isInitialLoad = !initialLayoutDoneRef.current && members.length > 0;

    if (membersChanged || unionsChanged || isInitialLoad) {
      handleAutoLayout();
      initialLayoutDoneRef.current = true;
    }
    prevMemberCountRef.current = members.length;
    prevUnionCountRef.current = unions.length;
  }, [members.length, unions.length, handleAutoLayout]);

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
  const cursorClass = presentationMode
    ? 'cursor-default'
    : linkDrag
      ? 'cursor-crosshair'
      : isSpaceDown || isPanning
        ? (isPanning ? 'cursor-grabbing' : 'cursor-grab')
        : 'cursor-default';

  // ─── Dynamic dot grid background style ───
  const dotSize = DOT_SPACING * zoom;
  const dotGridStyle: React.CSSProperties = presentationMode
    ? { backgroundColor: 'hsl(var(--canvas-bg))' }
    : {
        backgroundImage: `radial-gradient(circle, hsl(var(--canvas-dot)) ${Math.max(0.5, zoom * 1)}px, transparent ${Math.max(0.5, zoom * 1)}px)`,
        backgroundSize: `${dotSize}px ${dotSize}px`,
        backgroundPosition: `${pan.x % dotSize}px ${pan.y % dotSize}px`,
        backgroundColor: 'hsl(var(--canvas-bg))',
      };

  return (
    <div className="flex flex-col h-screen bg-background">
      <EditorHeader
        searchQuery={search.query}
        onSearchChange={search.setQuery}
        onSearchClear={search.clear}
        suggestions={search.suggestions}
        isSearchActive={search.isActive}
        matchCount={search.matchedMemberIds.size + search.matchedEmotionalLinkIds.size}
        onExportPng={() => {
          if (canvasRef.current) {
            exportAsPng(canvasRef.current, fileName);
            toast('Export PNG en cours…', { duration: 2000 });
          }
        }}
        onExportSvg={() => {
          if (canvasRef.current) {
            exportAsSvg(canvasRef.current, members, CARD_W, CARD_H, fileName);
            toast('Export SVG téléchargé', { duration: 2000 });
          }
        }}
        onExportPdf={() => {
          if (canvasRef.current) {
            exportAsPdf(canvasRef.current, fileName);
            toast('Export PDF en cours…', { duration: 2000 });
          }
        }}
        saveStatus={genogramId ? saveStatus : undefined}
        onOpenNotes={() => setNotesModalOpen(true)}
        noteCount={noteCount}
      />
      <div className="flex flex-1 overflow-hidden">
        {!presentationMode && (
          <EditorSidebar
            members={members}
            unions={unions}
            emotionalLinks={emotionalLinks}
            fileName={fileName}
            onFileNameChange={setFileName}
            onFocusMember={handleFocusMember}
            onBack={() => setShowLeaveDialog(true)}
            highlightedUnionStatus={highlightedUnionStatus}
            onHighlightUnionStatus={setHighlightedUnionStatus}
            soloEmotionalType={soloEmotionalType}
            onToggleSoloEmotional={handleToggleSoloEmotional}
            emotionalLinksVisible={emotionalLinksVisible}
            onToggleEmotionalLinksVisible={() => setEmotionalLinksVisible(prev => !prev)}
            pathologiesVisible={pathologiesVisible}
            onTogglePathologiesVisible={() => setPathologiesVisible(prev => !prev)}
            dynamicPathologies={dynamicPathologies}
            onAddPathology={addPathology}
          />
        )}

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
            {/* Smart alignment guides */}
            {smartGuides.length > 0 && (
              <svg className="absolute pointer-events-none" style={{ zIndex: 100, overflow: 'visible', top: 0, left: 0, width: 1, height: 1 }}>
                {smartGuides.map((guide, i) =>
                  guide.type === 'horizontal' ? (
                    <line key={`guide-${i}`} x1={guide.from} y1={guide.pos} x2={guide.to} y2={guide.pos}
                      stroke="hsl(var(--primary))" strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />
                  ) : (
                    <line key={`guide-${i}`} x1={guide.pos} y1={guide.from} x2={guide.pos} y2={guide.to}
                      stroke="hsl(var(--primary))" strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />
                  )
                )}
              </svg>
            )}
            <FamilyLinkLines members={members} unions={unions} onEditUnion={(id) => setEditingUnionId(id)} searchMatchedUnionIds={search.matchedUnionIds} isSearchActive={search.isActive} highlightedUnionStatus={highlightedUnionStatus} />
            {/* All children go through unions now */}
            <svg className="absolute pointer-events-none" style={{ zIndex: 50, overflow: 'visible', top: 0, left: 0, width: 1, height: 1, opacity: presentationMode ? 1 : (search.isActive && search.matchedEmotionalLinkIds.size === 0) ? 0.1 : 1, transition: 'opacity 0.3s' }}>
              {/* Over-card transparency mask: full opacity in void, reduced over cards & union badges */}
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
                  {/* Mask over union badge areas */}
                  {unions.map(u => {
                    const p1 = members.find(m => m.id === u.partner1);
                    const p2 = members.find(m => m.id === u.partner2);
                    if (!p1 || !p2) return null;
                    const [left, right] = p1.x < p2.x ? [p1, p2] : [p2, p1];
                    const midX = (left.x + CARD_W + right.x) / 2;
                    const midY = (left.y + CARD_H / 2 + right.y + CARD_H / 2) / 2;
                    // Badge area: ~120w × 60h centered on union midpoint
                    return (
                      <rect
                        key={`mask-badge-${u.id}`}
                        x={midX - 60} y={midY - 40}
                        width={120} height={70}
                        rx={14}
                        fill="rgba(255,255,255,0.15)"
                      />
                    );
                  })}
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
                    const isSearchHighlighted = search.isActive && search.matchedEmotionalLinkIds.has(link.id);
                    const isSearchDimmed = search.isActive && !isSearchHighlighted;
                    // Visibility toggle or solo mode
                    if (!emotionalLinksVisible) return null;
                    const isSoloHidden = soloEmotionalType !== null && link.type !== soloEmotionalType;
                    if (isSoloHidden) return null;
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
                        searchHighlighted={isSearchHighlighted}
                        searchDimmed={isSearchDimmed}
                        onClick={() => setEditingLinkId(link.id)}
                      />
                    );
                  });
                })()}
              </g>
            </svg>
            {members.map(member => {
              // Detect if this member is a bio parent of a child who also has adoptive parents
              const isBioParentOfAdoptedChild = unions.some(bioUnion =>
                !bioUnion.isAdoption &&
                (bioUnion.partner1 === member.id || bioUnion.partner2 === member.id) &&
                bioUnion.children.some(childId =>
                  unions.some(adoptUnion => adoptUnion.isAdoption && adoptUnion.children.includes(childId))
                )
              );
              return (
              <MemberCard
                key={member.id}
                member={member}
                isSelected={selectedMember === member.id}
                isAnimating={isAnimating}
                isColliding={collisions.has(member.id)}
                state={getMemberState(member.id)}
                isLinkTarget={!!linkDrag && linkDrag.fromId !== member.id}
                isFadingOut={fadingOutIds.has(member.id)}
                searchDimmed={search.isActive && !search.matchedMemberIds.has(member.id)}
                searchHighlighted={search.isActive && search.matchedMemberIds.has(member.id)}
                presentationMode={presentationMode}
                compact={isBioParentOfAdoptedChild}
                onSelect={handleSelect}
                onDragStart={handleDragStart}
                onCreateRelated={handleCreateRelated}
                onEdit={handleEdit}
                onToggleLock={handleToggleLock}
                onView={handleView}
                onHover={setHoveredMember}
                onLinkDragStart={handleLinkDragStart}
                onCancelAnchor={handleCancelAnchor}
                disabledOptions={getDisabledOptions(member.id)}
                dynamicPathologies={dynamicPathologies}
                showParentSplit={shouldShowParentSplit(member.id)}
                isAdopted={isMemberAdopted(member.id)}
              />
              );
            })}
            {/* Parent picker popover for multi-union child creation */}
            {parentPickerState && (() => {
              const pickerSource = members.find(m => m.id === parentPickerState.sourceId);
              if (!pickerSource) return null;
              const sourceUnions = unions.filter(u => u.partner1 === parentPickerState.sourceId || u.partner2 === parentPickerState.sourceId);
              return (
                <ParentPicker
                  sourceMember={pickerSource}
                  unions={sourceUnions}
                  members={members}
                  open={parentPickerState.open}
                  onOpenChange={(open) => {
                    if (!open) { setParentPickerState(null); setPendingPerinatalType(null); setPendingStillbornGender(null); }
                  }}
                  onSelectUnion={(unionId) => {
                    executeChildCreation(parentPickerState.sourceId, unionId);
                    setParentPickerState(null);
                  }}
                  onSelectNewPartner={() => {
                    executeChildCreation(parentPickerState.sourceId);
                    setParentPickerState(null);
                  }}
                
                >
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: pickerSource.x + CARD_W / 2,
                      top: pickerSource.y + CARD_H + 40,
                      width: 1,
                      height: 1,
                    }}
                  />
                </ParentPicker>
              );
            })()}
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
                recordSnapshot();
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

          {/* Edit existing emotional link modal */}
          <LinkTypeModal
            open={!!editingLinkId}
            currentType={emotionalLinks.find(l => l.id === editingLinkId)?.type}
            onSelect={(type: EmotionalLinkType) => {
              if (editingLinkId) {
                recordSnapshot();
                setEmotionalLinks(prev => prev.map(l => l.id === editingLinkId ? { ...l, type } : l));
              }
              setEditingLinkId(null);
            }}
            onDelete={() => {
              if (editingLinkId) {
                recordSnapshot();
                setEmotionalLinks(prev => prev.filter(l => l.id !== editingLinkId));
              }
              setEditingLinkId(null);
            }}
            onClose={() => setEditingLinkId(null)}
          />

          {/* Leave confirmation dialog */}
          <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Enregistrer les modifications ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Vous avez apporté des modifications à ce génogramme. Souhaitez-vous les enregistrer avant de quitter ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => navigate('/dashboard')}>
                  Non, quitter
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => navigate('/dashboard')}>
                  Oui, enregistrer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <UnionEditDrawer
            union={unions.find(u => u.id === editingUnionId) ?? null}
            open={!!editingUnionId}
            onClose={() => setEditingUnionId(null)}
            onUpdate={(updated) => { recordSnapshot(); setUnions(prev => prev.map(u => u.id === updated.id ? updated : u)); }}
            getMemberName={(id) => {
              const m = members.find(m => m.id === id);
              return m ? `${m.firstName} ${m.lastName}` : id;
            }}
          />

          <MemberEditDrawer
            member={editingNewMember}
            open={newMemberDrawerOpen}
            initialEditing={drawerEditing}
            onClose={() => { setNewMemberDrawerOpen(false); setEditingNewMember(null); }}
            onSave={handleSaveMember}
            onDelete={handleDeleteMember}
            emotionalLinks={emotionalLinks}
            members={members}
            unions={unions}
            dynamicPathologies={dynamicPathologies}
            onAddPathology={addPathology}
            onDeletePathology={deletePathology}
            onUpdateEmotionalLink={(linkId, newType) => {
              recordSnapshot();
              setEmotionalLinks(prev => prev.map(l => l.id === linkId ? { ...l, type: newType } : l));
            }}
            onDeleteEmotionalLink={(linkId) => {
              recordSnapshot();
              setEmotionalLinks(prev => prev.filter(l => l.id !== linkId));
            }}
            onUpdateUnion={(unionId, updates) => {
              recordSnapshot();
              setUnions(prev => prev.map(u => u.id === unionId ? { ...u, ...updates } : u));
            }}
            onLiveUpdate={(updated) => {
              const currentYear = new Date().getFullYear();
              const age = updated.birthYear ? currentYear - updated.birthYear : updated.age;
              setMembers(prev => prev.map(m => m.id === updated.id ? { ...updated, age } : m));
            }}
          />

          <FloatingControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitToScreen={handleFitToScreen}
            onAutoLayout={presentationMode ? undefined : handleAutoLayout}
            zoom={zoom}
            presentationMode={presentationMode}
            onTogglePresentation={() => {
              setPresentationMode(prev => !prev);
              setSelectedMember(null);
              setAnchorActiveMember(null);
            }}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={history.canUndo}
            canRedo={history.canRedo}
          />
        </div>
      </div>
      {genogramId && (
        <DossierNotesModal
          open={notesModalOpen}
          onClose={() => setNotesModalOpen(false)}
          genogramId={genogramId}
          genogramName={fileName}
        />
      )}
    </div>
  );
};

export default GenogramEditor;
