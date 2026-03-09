import React, { memo } from 'react';
import { type Node, type NodeProps } from '@xyflow/react';
import MemberCard, { type MemberCardState } from '@/components/MemberCard';
import { FamilyMember } from '@/types/genogram';
import type { DynamicPathology } from '@/hooks/usePathologies';
import type { RelationshipChoice, DisabledOptions } from '@/components/CreateMemberDropdown';

export interface MemberNodeData {
  member: FamilyMember;
  isSelected: boolean;
  isAnimating: boolean;
  isColliding: boolean;
  state: MemberCardState;
  isLinkTarget: boolean;
  isFadingOut: boolean;
  searchDimmed: boolean;
  searchHighlighted: boolean;
  presentationMode: boolean;
  compact: boolean;
  onSelect: (id: string) => void;
  onCreateRelated: (id: string, relationship: RelationshipChoice) => void;
  onEdit: (id: string) => void;
  onToggleLock: (id: string) => void;
  onView: (id: string) => void;
  onHover: (id: string | null) => void;
  onLinkDragStart: (id: string, e: React.MouseEvent) => void;
  onCancelAnchor: (id: string) => void;
  disabledOptions: DisabledOptions;
  dynamicPathologies: DynamicPathology[];
  showParentSplit: boolean;
  isAdopted: boolean;
  [key: string]: unknown;
}

export type MemberFlowNode = Node<MemberNodeData, 'member'>;

function MemberNode({ data, id }: NodeProps<MemberFlowNode>) {
  const {
    member,
    presentationMode,
    onSelect,
    onEdit,
    onView,
    onHover,
    isFadingOut,
    searchDimmed,
    ...rest
  } = data;

  return (
    <div
      className="nopan nodrag nowheel"
      onClick={() => {
        if (presentationMode) {
          if (!member.isPlaceholder && !member.isDraft) onView?.(id);
        } else if (member.isPlaceholder || member.isDraft) {
          onEdit?.(id);
        } else {
          onSelect?.(id);
        }
      }}
      onDoubleClick={() => {
        if (!presentationMode && !member.isPlaceholder && !member.isDraft) {
          onView?.(id);
        }
      }}
      onMouseEnter={() => onHover?.(id)}
      onMouseLeave={() => onHover?.(null)}
      style={{
        opacity: isFadingOut ? 0 : searchDimmed ? 0.12 : 1,
        transform: isFadingOut ? 'scale(0.85)' : 'scale(1)',
        transition: 'opacity 0.3s, transform 0.3s',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      <MemberCard
        member={member}
        static={true}
        presentationMode={presentationMode}
        onSelect={onSelect}
        onEdit={onEdit}
        onView={onView}
        onHover={onHover}
        isFadingOut={isFadingOut}
        searchDimmed={searchDimmed}
        {...rest}
      />
    </div>
  );
}

export default memo(MemberNode);
