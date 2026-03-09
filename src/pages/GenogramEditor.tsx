import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
  useViewport,
  type Node,
  type NodeChange,
  applyNodeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@/styles/reactflow-overrides.css';

import DossierNotesModal, { useGenogramNoteCount } from '@/components/DossierNotesModal';
import ShareModal from '@/components/ShareModal';
import EditorHeader from '@/components/EditorHeader';
import EditorSidebar from '@/components/EditorSidebar';
import MemberCard from '@/components/MemberCard';
import { MEMBER_CARD_W } from '@/components/MemberCard';
import FamilyLinkLines from '@/components/FamilyLinkLines';
import EmotionalLinkLine from '@/components/EmotionalLinkLine';
import ElasticLinkLine from '@/components/ElasticLinkLine';
import LinkTypeModal from '@/components/LinkTypeModal';
import FloatingControls from '@/components/FloatingControls';
import LockPanel from '@/components/LockPanel';
import UnionEditDrawer from '@/components/UnionEditDrawer';
import MemberEditDrawer from '@/components/MemberEditDrawer';
import { RelationshipChoice } from '@/components/CreateMemberDropdown';
import type { DisabledOptions } from '@/components/CreateMemberDropdown';
import ParentPicker from '@/components/ParentPicker';
import ViewportOverlay from '@/components/canvas/ViewportOverlay';
import MemberNode from '@/components/canvas/MemberNode';
import type { MemberFlowNode } from '@/components/canvas/MemberNode';
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
const SNAP_GRID_X = 20;
const SNAP_GRID_Y = 20;
const LEVEL_SPACING_SNAP = 250;
const SNAP_LEVEL_THRESHOLD = 40;
const STORAGE_KEY = 'genogy-member-positions';

const NODE_TYPES = { member: MemberNode };

type Side = 'top' | 'bottom' | 'left' | 'right';

interface AnchorPoint { x: number; y: number; side: Side; }

/** Corner positions for a card */
function cardCorners(m: FamilyMember) {
  return [
    { x: m.x, y: m.y },
    { x: m.x + CARD_W, y: m.y },
    { x: m.x, y: m.y + CARD_H },
    { x: m.x + CARD_W, y: m.y + CARD_H },
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


const GenogramEditorInner: React.FC = () => {
  const { id: genogramId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const reactFlow = useReactFlow();
  const [dbLoaded, setDbLoaded] = useState(false);

  // Initialize with empty state — will be populated from DB or sample data
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    if (genogramId) return [];
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
  const [highlightedUnionStatus, setHighlightedUnionStatus] = useState<UnionStatus | null>(null);
  const [soloEmotionalType, setSoloEmotionalType] = useState<EmotionalLinkType | null>(null);
  const [emotionalLinksVisible, setEmotionalLinksVisible] = useState(true);
  const [pathologiesVisible, setPathologiesVisible] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [presentationMode, setPresentationMode] = useState(false);

  // Link drag state
  const [linkDrag, setLinkDrag] = useState<{
    fromId: string;
    startX: number; startY: number;
    cursorX: number; cursorY: number;
    snapX?: number; snapY?: number;
    snapTargetId?: string;
  } | null>(null);
  const [linkModalTarget, setLinkModalTarget] = useState<{ fromId: string; toId: string } | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);

  // React Flow nodes state
  const [nodes, setNodes] = useState<MemberFlowNode[]>([]);

  // ─── Notes du dossier ───
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
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

      // Center on first member after load
      if (loadedMembers.length > 0) {
        requestAnimationFrame(() => {
          const m = loadedMembers[0];
          reactFlow.setCenter(m.x + CARD_W / 2, m.y + CARD_H / 2, { zoom: 1, duration: 400 });
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

  // ─── React Flow event handlers ───
  const onNodesChange = useCallback((changes: NodeChange<MemberFlowNode>[]) => {
    setNodes(nds => applyNodeChanges(changes, nds));
  }, []);

  const onNodeDragStart = useCallback((_: React.MouseEvent, node: MemberFlowNode) => {
    if (node.data.member.locked || presentationMode) return;
    recordSnapshot();
  }, [recordSnapshot, presentationMode]);

  const onNodeDrag = useCallback((_: React.MouseEvent, node: MemberFlowNode) => {
    // Sync dragged position back to members in real-time for link lines
    setMembers(prev => prev.map(m =>
      m.id === node.id ? { ...m, x: node.position.x, y: node.position.y } : m
    ));
  }, []);

  const onNodeDragStop = useCallback((_: React.MouseEvent, node: MemberFlowNode) => {
    let newX = node.position.x;
    let newY = node.position.y;

    if (snapToGrid) {
      newX = Math.round(newX / SNAP_GRID_X) * SNAP_GRID_X;
      // Snap Y to nearest occupied generation row
      const occupiedYs = new Set<number>();
      for (const m of members) {
        if (m.id !== node.id) occupiedYs.add(m.y);
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

    setMembers(prev => prev.map(m =>
      m.id === node.id ? { ...m, x: newX, y: newY } : m
    ));
  }, [snapToGrid, members]);

  // Track zoom from React Flow viewport
  const onMoveEnd = useCallback((_: any, viewport: { x: number; y: number; zoom: number }) => {
    setZoom(viewport.zoom);
  }, []);

  // Link drag mouse move (attached to wrapper)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!linkDrag) return;
    const pos = reactFlow.screenToFlowPosition({ x: e.clientX, y: e.clientY });

    // Snap magnetism
    const SNAP_RADIUS = 30;
    let snapX: number | undefined;
    let snapY: number | undefined;
    let snapTargetId: string | undefined;
    let bestDist = SNAP_RADIUS;

    for (const m of members) {
      if (m.id === linkDrag.fromId) continue;
      const corners = cardCorners(m);
      for (const c of corners) {
        const d = Math.hypot(pos.x - c.x, pos.y - c.y);
        if (d < bestDist) {
          bestDist = d;
          snapX = c.x;
          snapY = c.y;
          snapTargetId = m.id;
        }
      }
    }

    setLinkDrag(prev => prev ? { ...prev, cursorX: pos.x, cursorY: pos.y, snapX, snapY, snapTargetId } : null);
  }, [linkDrag, members, reactFlow]);

  // Link drag mouse up
  const handleMouseUp = useCallback(() => {
    if (!linkDrag) return;
    const targetId = linkDrag.snapTargetId;
    if (targetId) {
      setLinkModalTarget({ fromId: linkDrag.fromId, toId: targetId });
    }
    setLinkDrag(null);
  }, [linkDrag]);

  // Click on empty canvas → deselect
  const onPaneClick = useCallback(() => {
    setSelectedMember(null);
    setAnchorActiveMember(null);
  }, []);

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

  /** Center canvas on a specific member with smooth animation */
  const centerOnMember = useCallback((member: FamilyMember) => {
    reactFlow.setCenter(member.x + CARD_W / 2, member.y + CARD_H / 2, { duration: 400 });
  }, [reactFlow]);

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
    const parentUnions = unions.filter(u => u.children.includes(memberId));
    const bioUnion = parentUnions.find(u => !u.isAdoption);
    const adoptiveUnion = parentUnions.find(u => u.isAdoption);

    if (parentUnions.length === 0) {
      // No parents at all
    } else if (bioUnion && adoptiveUnion) {
      disabled.parent = 'Ce membre a déjà ses parents biologiques et adoptifs';
      disabled.parent_bio = 'Ce membre a déjà ses parents biologiques';
      disabled.parent_adoptive = 'Ce membre a déjà ses parents adoptifs';
    } else {
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
    const SPOUSE_GAP = CARD_W + 120;

    switch (relationship) {
      case 'parent':
        return { x: source.x, y: source.y - LEVEL_Y };
      case 'child':
        return { x: source.x, y: source.y + LEVEL_Y };
      case 'sibling': {
        const sameLevelMembers = members.filter(m => Math.abs(m.y - source.y) < 50);
        const maxX = Math.max(...sameLevelMembers.map(m => m.x + CARD_W));
        return { x: maxX + 80, y: source.y };
      }
      case 'spouse_married':
      case 'spouse_divorced':
      case 'spouse_separated':
      case 'spouse_widowed': {
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

    setPendingPerinatalType(null);
    setPendingStillbornGender(null);

    if (targetUnionId) {
      const union = unions.find(u => u.id === targetUnionId);
      if (union) {
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

      const coupleCenterX = (sourceX + placeholderX + CARD_W) / 2 - CARD_W / 2;
      newChild.x = coupleCenterX;
      newChild.y = sourceY + LEVEL_Y;

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

      setSelectedMember(newChild.id);
      if (!perinatal) {
        setEditingNewMember(newChild);
        setDrawerEditing(true);
        setNewMemberDrawerOpen(true);
      }
      setTimeout(() => centerOnMember(newChild), 100);
      return;
    }

    setSelectedMember(newChild.id);
    if (!perinatal) {
      setEditingNewMember(newChild);
      setDrawerEditing(true);
      setNewMemberDrawerOpen(true);
    }
    setTimeout(() => centerOnMember(newChild), 100);
  }, [members, unions, centerOnMember, pendingPerinatalType, pendingStillbornGender]);

  /** Create a child with an existing member as co-parent */
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
    // ── Perinatal events ──
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

    if (relationship === 'child') {
      setPendingPerinatalType(null);
      setParentPickerState({ sourceId, open: true });
      return;
    }

    // ── Non-child relationships ──
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

    const statusMap: Record<string, UnionStatus> = {
      spouse_married: 'married',
      spouse_divorced: 'divorced',
      spouse_separated: 'separated',
      spouse_widowed: 'widowed',
    };

    recordSnapshot();
    setMembers(prev => [...prev, newMember]);

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

    if (relationship === 'parent' || relationship === 'parent_bio' || relationship === 'parent_adoptive') {
      const isAdoption = relationship === 'parent_adoptive';
      const existingParentUnion = unions.find(u =>
        u.children.includes(sourceId) && (relationship === 'parent' || u.isAdoption === isAdoption)
      );
      const SPOUSE_GAP = 200;
      const LEVEL_Y = 250;

      if (existingParentUnion) {
        const p1 = members.find(m => m.id === existingParentUnion.partner1);
        const p2 = members.find(m => m.id === existingParentUnion.partner2);
        const placeholderParent = [p1, p2].find(p => p && (p.isPlaceholder || p.isDraft));
        const realParent = [p1, p2].find(p => p && !p.isPlaceholder && !p.isDraft);

        if (!placeholderParent) {
          toast.error('Ce membre a déjà deux parents de ce type');
          return;
        }

        // Replace placeholder with new member
        newMember.x = placeholderParent.x;
        newMember.y = placeholderParent.y;
        newMember.gender = placeholderParent.gender;
        if (isAdoption) newMember.isAdoptiveParent = true;

        recordSnapshot();
        setMembers(prev => prev.map(m => m.id === placeholderParent.id ? { ...newMember, id: placeholderParent.id } : m));
        setSelectedMember(placeholderParent.id);
        setEditingNewMember({ ...newMember, id: placeholderParent.id });
        setDrawerEditing(true);
        setNewMemberDrawerOpen(true);
        setTimeout(() => centerOnMember(newMember), 100);
        return;
      } else {
        // Create new parent pair (duo-parenting)
        const sourceX = members.find(m => m.id === sourceId)?.x ?? 200;
        const sourceY = members.find(m => m.id === sourceId)?.y ?? 200;
        const yOffset = LEVEL_Y;

        // Check for existing other-type parent union to offset horizontally
        const existingOtherPairUnion = unions.find(u =>
          u.children.includes(sourceId) && u.isAdoption !== isAdoption
        );
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

      setSelectedMember(newMember.id);
      setEditingNewMember(newMember);
      setDrawerEditing(true);
      setNewMemberDrawerOpen(true);
      setTimeout(() => centerOnMember(newMember), 100);
      return;
    }

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
    recordSnapshot();
    setMembers(prev => prev.map(m => m.id === updated.id ? { ...updated, age, isPlaceholder: false } : m));
    setEditingNewMember(null);
  }, [recordSnapshot]);

  const [fadingOutIds, setFadingOutIds] = useState<Set<string>>(new Set());

  const handleDeleteMember = useCallback((id: string) => {
    recordSnapshot();

    const collectDescendants = (memberId: string, visited: Set<string>): void => {
      if (visited.has(memberId)) return;
      visited.add(memberId);
      const parentUnions = unions.filter(u => u.partner1 === memberId || u.partner2 === memberId);
      for (const union of parentUnions) {
        for (const childId of union.children) {
          collectDescendants(childId, visited);
        }
        const otherPartnerId = union.partner1 === memberId ? union.partner2 : union.partner1;
        const otherPartner = members.find(m => m.id === otherPartnerId);
        if (otherPartner?.isPlaceholder && !visited.has(otherPartnerId)) {
          visited.add(otherPartnerId);
        }
      }
    };

    const toRemoveSet = new Set<string>();
    collectDescendants(id, toRemoveSet);

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
    const cx = member.x + CARD_W / 2;
    const cy = member.y + CARD_H / 2;
    const pos = reactFlow.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setLinkDrag({ fromId, startX: cx, startY: cy, cursorX: pos.x, cursorY: pos.y });
  }, [members, reactFlow]);

  // ─── Fit to screen ───
  const handleFitToScreen = useCallback(() => {
    if (members.length === 0) return;
    reactFlow.fitView({ padding: 0.15, duration: 400 });
  }, [members, reactFlow]);

  // ─── Auto-layout: reorganize tree ───
  const handleAutoLayout = useCallback(() => {
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
    }, 900);
  }, [members, unions, emotionalLinks, handleFitToScreen]);

  // ─── Auto-layout on member/union count change ───
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

  // ─── Button zoom ───
  const handleZoomIn = useCallback(() => {
    reactFlow.zoomIn({ duration: 200 });
  }, [reactFlow]);

  const handleZoomOut = useCallback(() => {
    reactFlow.zoomOut({ duration: 200 });
  }, [reactFlow]);

  // ─── Sync members → React Flow nodes ───
  useEffect(() => {
    setNodes(members.map(member => {
      const isBioParentOfAdoptedChild = unions.some(bioUnion =>
        !bioUnion.isAdoption &&
        (bioUnion.partner1 === member.id || bioUnion.partner2 === member.id) &&
        bioUnion.children.some(childId =>
          unions.some(adoptUnion => adoptUnion.isAdoption && adoptUnion.children.includes(childId))
        )
      );

      return {
        id: member.id,
        type: 'member' as const,
        position: { x: member.x, y: member.y },
        draggable: !member.locked && !presentationMode,
        selectable: false,
        focusable: false,
        data: {
          member,
          isSelected: selectedMember === member.id,
          isAnimating,
          isColliding: collisions.has(member.id),
          state: getMemberState(member.id),
          isLinkTarget: !!linkDrag && linkDrag.fromId !== member.id,
          isFadingOut: fadingOutIds.has(member.id),
          searchDimmed: search.isActive && !search.matchedMemberIds.has(member.id),
          searchHighlighted: search.isActive && search.matchedMemberIds.has(member.id),
          presentationMode,
          compact: isBioParentOfAdoptedChild,
          onSelect: handleSelect,
          onCreateRelated: handleCreateRelated,
          onEdit: handleEdit,
          onToggleLock: handleToggleLock,
          onView: handleView,
          onHover: setHoveredMember,
          onLinkDragStart: handleLinkDragStart,
          onCancelAnchor: handleCancelAnchor,
          disabledOptions: getDisabledOptions(member.id),
          dynamicPathologies: pathologiesVisible ? dynamicPathologies : [],
          showParentSplit: shouldShowParentSplit(member.id),
          isAdopted: isMemberAdopted(member.id),
        },
      };
    }));
  }, [
    members, unions, selectedMember, hoveredMember, anchorActiveMember,
    isAnimating, collisions, linkDrag, fadingOutIds, search.isActive,
    search.matchedMemberIds, presentationMode, pathologiesVisible,
    dynamicPathologies, getMemberState, handleSelect, handleCreateRelated,
    handleEdit, handleToggleLock, handleView, handleLinkDragStart,
    handleCancelAnchor, getDisabledOptions, shouldShowParentSplit, isMemberAdopted,
  ]);

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
        onShare={() => genogramId && setShareModalOpen(true)}
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
          className={`flex-1 relative overflow-hidden ${isAnimating ? 'rf-animating' : ''}`}
          onMouseMove={linkDrag ? handleMouseMove : undefined}
          onMouseUp={linkDrag ? handleMouseUp : undefined}
        >
          <ReactFlow
            nodes={nodes}
            edges={[]}
            nodeTypes={NODE_TYPES}
            onNodesChange={onNodesChange}
            onNodeDragStart={onNodeDragStart}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            onMoveEnd={onMoveEnd}
            onPaneClick={onPaneClick}
            panOnScroll={false}
            zoomOnScroll={true}
            zoomOnPinch={true}
            panOnDrag={!linkDrag}
            selectionOnDrag={false}
            selectNodesOnDrag={false}
            nodesDraggable={!presentationMode}
            nodesConnectable={false}
            nodesFocusable={false}
            edgesFocusable={false}
            minZoom={0.15}
            maxZoom={3}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            proOptions={{ hideAttribution: true }}
            className="!bg-[hsl(var(--canvas-bg))]"
          >
            {!presentationMode && (
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                className="!stroke-[hsl(var(--canvas-dot))]"
                color="hsl(var(--canvas-dot))"
              />
            )}
            <MiniMap
              nodeColor={(node) => {
                const data = (node as MemberFlowNode).data;
                if (!data) return 'hsl(var(--muted))';
                return data.member.gender === 'male'
                  ? 'hsl(210, 70%, 60%)'
                  : data.member.gender === 'female'
                    ? 'hsl(340, 70%, 60%)'
                    : 'hsl(var(--muted))';
              }}
              maskColor="hsl(var(--background) / 0.7)"
              style={{ borderRadius: 12, border: '1px solid hsl(var(--border))' }}
              pannable
              zoomable
            />

            {/* Viewport-synced overlays for link lines */}
            <ViewportOverlay>
              <FamilyLinkLines
                members={members}
                unions={unions}
                onEditUnion={(id) => setEditingUnionId(id)}
                searchMatchedUnionIds={search.matchedUnionIds}
                isSearchActive={search.isActive}
                highlightedUnionStatus={highlightedUnionStatus}
              />

              {/* Emotional links SVG */}
              <svg className="absolute pointer-events-none" style={{ zIndex: 50, overflow: 'visible', top: 0, left: 0, width: 1, height: 1, opacity: presentationMode ? 1 : (search.isActive && search.matchedEmotionalLinkIds.size === 0) ? 0.1 : 1, transition: 'opacity 0.3s' }}>
                <defs>
                  <mask id="card-depth-mask">
                    <rect x="-99999" y="-99999" width="199998" height="199998" fill="white" />
                    {members.map(m => (
                      <rect
                        key={`mask-${m.id}`}
                        x={m.x - 2} y={m.y - 2}
                        width={CARD_W + 4} height={CARD_H + 4}
                        rx={12}
                        fill="rgba(255,255,255,0.2)"
                      />
                    ))}
                    {unions.map(u => {
                      const p1 = members.find(m => m.id === u.partner1);
                      const p2 = members.find(m => m.id === u.partner2);
                      if (!p1 || !p2) return null;
                      const [left, right] = p1.x < p2.x ? [p1, p2] : [p2, p1];
                      const midX = (left.x + CARD_W + right.x) / 2;
                      const midY = (left.y + CARD_H / 2 + right.y + CARD_H / 2) / 2;
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

              {/* Parent picker popover */}
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
            </ViewportOverlay>
          </ReactFlow>

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

          {!presentationMode && (
            <LockPanel members={members} onToggleLock={handleToggleLock} />
          )}
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
      {genogramId && (
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          genogramId={genogramId}
          genogramName={fileName}
        />
      )}
    </div>
  );
};

const GenogramEditor: React.FC = () => (
  <ReactFlowProvider>
    <GenogramEditorInner />
  </ReactFlowProvider>
);

export default GenogramEditor;
