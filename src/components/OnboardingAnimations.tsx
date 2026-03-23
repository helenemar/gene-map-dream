import React from 'react';
import { motion } from 'framer-motion';

/** Animated mini-illustration for each onboarding step */

const CURSOR = (
  <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
    <path d="M1 1L1 14.5L4.5 11L8.5 18L11 17L7 10L12 10L1 1Z" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="1.2" />
  </svg>
);

const MiniCard: React.FC<{ x?: number; y?: number; w?: number; h?: number; label?: string }> = ({
  x = 0, y = 0, w = 48, h = 24, label,
}) => (
  <g transform={`translate(${x},${y})`}>
    <rect width={w} height={h} rx={4} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} />
    {label && (
      <text x={w / 2} y={h / 2 + 3.5} textAnchor="middle" fontSize={7} fill="hsl(var(--muted-foreground))" fontFamily="sans-serif">
        {label}
      </text>
    )}
  </g>
);

/* ── 1. Pan gesture: two dots slide together ── */
export const PanAnimation: React.FC = () => (
  <div className="relative w-full h-[80px] rounded-lg bg-muted/30 border border-border/40 overflow-hidden flex items-center justify-center">
    <svg width="140" height="60" viewBox="0 0 140 60">
      {/* Grid dots (background) */}
      {Array.from({ length: 7 }).map((_, i) =>
        Array.from({ length: 4 }).map((_, j) => (
          <motion.circle
            key={`${i}-${j}`}
            cx={10 + i * 20}
            cy={8 + j * 16}
            r={1.5}
            fill="hsl(var(--border))"
            animate={{ x: [0, -20, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))
      )}
      {/* Two fingers */}
      <motion.g animate={{ x: [0, -20, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
        <motion.circle cx={65} cy={24} r={5} fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={1.5} />
        <motion.circle cx={80} cy={24} r={5} fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={1.5} />
      </motion.g>
    </svg>
  </div>
);

/* ── 2. Zoom gesture: pinch in/out ── */
export const ZoomAnimation: React.FC = () => (
  <div className="relative w-full h-[80px] rounded-lg bg-muted/30 border border-border/40 overflow-hidden flex items-center justify-center">
    <svg width="140" height="60" viewBox="0 0 140 60">
      {/* Card that scales */}
      <motion.g
        animate={{ scale: [0.7, 1.1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '70px 30px' }}
      >
        <MiniCard x={46} y={18} w={48} h={24} label="Carte" />
      </motion.g>
      {/* Two fingers pinching */}
      <motion.circle
        cx={56} cy={30}
        r={4}
        fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={1.5}
        animate={{ cx: [56, 48, 56] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.circle
        cx={84} cy={30}
        r={4}
        fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={1.5}
        animate={{ cx: [84, 92, 84] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  </div>
);

/* ── 3. Drag member: card moves with cursor ── */
export const DragAnimation: React.FC = () => (
  <div className="relative w-full h-[80px] rounded-lg bg-muted/30 border border-border/40 overflow-hidden flex items-center justify-center">
    <svg width="160" height="60" viewBox="0 0 160 60">
      {/* Pulsing ring around the card to draw attention */}
      <motion.rect
        x={28} y={16} width={52} height={28} rx={6}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={1.5}
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '54px 30px' }}
      />
      {/* Dashed origin ghost */}
      <rect x={30} y={18} width={48} height={24} rx={4} fill="none" stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="3 2" />
      {/* Animated arrow hint: "drag this way" */}
      <motion.g
        animate={{ opacity: [0, 1, 1, 0], x: [0, 8, 8, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.15, 0.25, 0.35] }}
      >
        <path
          d="M86 30 L96 30 M93 26 L97 30 L93 34"
          stroke="hsl(var(--primary))"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </motion.g>
      {/* Moving card */}
      <motion.g animate={{ x: [0, 50, 50, 0], y: [0, 0, 0, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 0.6, 1] }}>
        <MiniCard x={30} y={18} w={48} h={24} label="Jean" />
      </motion.g>
      {/* Cursor following the card */}
      <motion.g animate={{ x: [0, 50, 50, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 0.6, 1] }}>
        <g transform="translate(62, 28)">
          {CURSOR}
        </g>
      </motion.g>
      {/* Smart guide line */}
      <motion.line
        x1={104} y1={4} x2={104} y2={56}
        stroke="hsl(var(--primary) / 0.4)"
        strokeWidth={1}
        strokeDasharray="3 2"
        animate={{ opacity: [0, 0, 1, 1, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, times: [0, 0.3, 0.4, 0.6, 0.7] }}
      />
    </svg>
  </div>
);

/* ── 4. Create emotional link: select card → dots appear → drag from corner dot → target highlights → modal appears ── */
export const LinkAnimation: React.FC<{ labels?: { select: string; drag: string; choose: string } }> = ({ labels }) => {
  const selectLabel = labels?.select || 'Sélectionner';
  const dragLabel = labels?.drag || 'Glisser';
  const chooseLabel = labels?.choose || 'Choisir';
  const cardAX = 10, cardAY = 10, cardBX = 104, cardBY = 10;
  const cardW = 48, cardH = 28;

  // Corner dots on card A (like real MemberCard)
  const cornersA = [
    { cx: cardAX, cy: cardAY },                       // top-left
    { cx: cardAX + cardW, cy: cardAY },                // top-right ← active
    { cx: cardAX, cy: cardAY + cardH },                // bottom-left
    { cx: cardAX + cardW, cy: cardAY + cardH },        // bottom-right
  ];
  // Corner dots on card B
  const cornersB = [
    { cx: cardBX, cy: cardBY },
    { cx: cardBX + cardW, cy: cardBY },
    { cx: cardBX, cy: cardBY + cardH },
    { cx: cardBX + cardW, cy: cardBY + cardH },
  ];

  const fromDot = cornersA[1]; // top-right of A
  const toDot = cornersB[0];   // top-left of B

  // Total cycle: 4s
  // Phase 1 (0-0.2): card A selected, dots appear
  // Phase 2 (0.2-0.5): drag from dot to card B
  // Phase 3 (0.5-0.65): target highlight + snap
  // Phase 4 (0.65-0.85): mini modal appears
  // Phase 5 (0.85-1): reset

  return (
    <div className="relative w-full h-[100px] rounded-lg bg-muted/30 border border-border/40 overflow-hidden flex items-center justify-center">
      <svg width="164" height="80" viewBox="0 0 164 80">
        {/* Card A with selection border */}
        <motion.rect
          x={cardAX} y={cardAY} width={cardW} height={cardH} rx={4}
          fill="hsl(var(--card))"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          animate={{
            stroke: ['hsl(var(--border))', 'hsl(var(--primary))', 'hsl(var(--primary))', 'hsl(var(--primary))', 'hsl(var(--border))'],
          }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.7, 0.85, 1] }}
        />
        <text x={cardAX + cardW / 2} y={cardAY + cardH / 2 + 3.5} textAnchor="middle" fontSize={7} fill="hsl(var(--muted-foreground))" fontFamily="sans-serif">Marie</text>

        {/* Card B */}
        <motion.rect
          x={cardBX} y={cardBY} width={cardW} height={cardH} rx={4}
          fill="hsl(var(--card))"
          strokeWidth={1.5}
          animate={{
            stroke: ['hsl(var(--border))', 'hsl(var(--border))', 'hsl(var(--border))', 'hsl(var(--primary))', 'hsl(var(--primary))', 'hsl(var(--border))'],
          }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.3, 0.45, 0.5, 0.7, 0.85] }}
        />
        <text x={cardBX + cardW / 2} y={cardBY + cardH / 2 + 3.5} textAnchor="middle" fontSize={7} fill="hsl(var(--muted-foreground))" fontFamily="sans-serif">Paul</text>

        {/* Target halo on card B */}
        <motion.rect
          x={cardBX - 3} y={cardBY - 3} width={cardW + 6} height={cardH + 6} rx={6}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          animate={{
            opacity: [0, 0, 0, 0.6, 0.8, 0],
            scale: [1, 1, 1, 1, 1.04, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.3, 0.45, 0.5, 0.6, 0.7] }}
          style={{ transformOrigin: `${cardBX + cardW / 2}px ${cardBY + cardH / 2}px` }}
        />

        {/* Corner dots on card A — appear when selected */}
        {cornersA.map((dot, i) => (
          <motion.circle
            key={`ca-${i}`}
            cx={dot.cx} cy={dot.cy} r={3}
            fill={i === 1 ? 'hsl(var(--primary))' : 'hsl(var(--card))'}
            stroke="hsl(var(--primary))"
            strokeWidth={1.2}
            animate={{
              opacity: [0, 1, 1, 1, 0],
              scale: i === 1 ? [0, 1, 1.3, 1, 0] : [0, 1, 1, 1, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.12, 0.2, 0.7, 0.85] }}
          />
        ))}

        {/* Corner dots on card B — appear when target is hovered */}
        {cornersB.map((dot, i) => (
          <motion.circle
            key={`cb-${i}`}
            cx={dot.cx} cy={dot.cy} r={3}
            fill="hsl(var(--primary) / 0.2)"
            stroke="hsl(var(--primary))"
            strokeWidth={1}
            animate={{
              opacity: [0, 0, 0, 0.5, 0.5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.3, 0.45, 0.5, 0.65, 0.85] }}
          />
        ))}

        {/* Elastic line from corner dot A → corner dot B */}
        <motion.line
          x1={fromDot.cx} y1={fromDot.cy}
          x2={fromDot.cx} y2={fromDot.cy}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          strokeLinecap="round"
          animate={{
            x2: [fromDot.cx, fromDot.cx, toDot.cx, toDot.cx, fromDot.cx],
            y2: [fromDot.cy, fromDot.cy, toDot.cy, toDot.cy, fromDot.cy],
            opacity: [0, 1, 1, 1, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.2, 0.5, 0.65, 0.85] }}
        />

        {/* Cursor — drags from dot to target */}
        <motion.g
          animate={{
            x: [0, 0, toDot.cx - fromDot.cx - 6, toDot.cx - fromDot.cx - 6, 0],
            y: [0, 0, toDot.cy - fromDot.cy, toDot.cy - fromDot.cy, 0],
            opacity: [0, 1, 1, 0.4, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.18, 0.5, 0.65, 0.85] }}
        >
          <g transform={`translate(${fromDot.cx + 2}, ${fromDot.cy + 2})`}>
            {CURSOR}
          </g>
        </motion.g>

        {/* Mini modal appearing after drop */}
        <motion.g
          animate={{
            opacity: [0, 0, 0, 0, 1, 1, 0],
            y: [4, 4, 4, 4, 0, 0, 4],
          }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.5, 0.55, 0.62, 0.68, 0.82, 0.88] }}
        >
          <rect x={70} y={44} width={56} height={30} rx={4} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} />
          <text x={98} y={55} textAnchor="middle" fontSize={6} fill="hsl(var(--foreground))" fontFamily="sans-serif" fontWeight="600">Type de lien</text>
          <rect x={74} y={60} width={48} height={10} rx={2} fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary) / 0.3)" strokeWidth={0.5} />
          <text x={98} y={67.5} textAnchor="middle" fontSize={5.5} fill="hsl(var(--primary))" fontFamily="sans-serif">Fusionnel ▾</text>
        </motion.g>

        {/* Step labels */}
        <motion.text x={cardAX + cardW / 2} y={cardAY + cardH + 14} textAnchor="middle" fontSize={5.5} fill="hsl(var(--primary))" fontFamily="sans-serif" fontWeight="600"
          animate={{ opacity: [0, 1, 1, 0, 0] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.08, 0.18, 0.22, 1] }}
        >① {selectLabel}</motion.text>

        <motion.text x={82} y={6} textAnchor="middle" fontSize={5.5} fill="hsl(var(--primary))" fontFamily="sans-serif" fontWeight="600"
          animate={{ opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.2, 0.28, 0.48, 0.52] }}
        >② {dragLabel}</motion.text>

        <motion.text x={98} y={42} textAnchor="middle" fontSize={5.5} fill="hsl(var(--primary))" fontFamily="sans-serif" fontWeight="600"
          animate={{ opacity: [0, 0, 0, 1, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.6, 0.64, 0.68, 0.82, 0.88] }}
        >③ {chooseLabel}</motion.text>
      </svg>
    </div>
  );
};

/* ── 5. Undo/Redo: keyboard keys animation ── */
export const UndoAnimation: React.FC = () => (
  <div className="relative w-full h-[80px] rounded-lg bg-muted/30 border border-border/40 overflow-hidden flex items-center justify-center">
    <div className="flex items-center gap-3">
      {/* Ctrl key */}
      <motion.div
        className="px-2.5 py-1.5 rounded-md border text-[11px] font-mono font-medium"
        style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))', backgroundColor: 'hsl(var(--muted))' }}
        animate={{
          borderColor: ['hsl(var(--border))', 'hsl(var(--primary))', 'hsl(var(--border))'],
          color: ['hsl(var(--muted-foreground))', 'hsl(var(--primary))', 'hsl(var(--muted-foreground))'],
          scale: [1, 0.93, 1],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', times: [0, 0.3, 0.6] }}
      >
        Ctrl
      </motion.div>
      <span className="text-muted-foreground/50 text-xs font-medium">+</span>
      {/* Z key */}
      <motion.div
        className="w-8 h-8 rounded-md border flex items-center justify-center text-[12px] font-mono font-semibold"
        style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))', backgroundColor: 'hsl(var(--muted))' }}
        animate={{
          borderColor: ['hsl(var(--border))', 'hsl(var(--primary))', 'hsl(var(--border))'],
          color: ['hsl(var(--muted-foreground))', 'hsl(var(--primary))', 'hsl(var(--muted-foreground))'],
          scale: [1, 0.9, 1],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', times: [0, 0.3, 0.6], delay: 0.05 }}
      >
        Z
      </motion.div>
      {/* Arrow showing the undo effect */}
      <motion.div
        animate={{ x: [0, -6, 0], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', times: [0, 0.3, 0.6] }}
      >
        <svg width="24" height="16" viewBox="0 0 24 16">
          <motion.path
            d="M18 14C18 8 14 5 8 5L3 5M3 5L7 1M3 5L7 9"
            stroke="hsl(var(--primary))"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </motion.div>
    </div>
  </div>
);

/* ── 6. Create member: hover card → click + button ── */
export const CreateMemberAnimation: React.FC = () => (
  <div className="relative w-full h-[80px] rounded-lg bg-muted/30 border border-border/40 overflow-hidden flex items-center justify-center">
    <svg width="160" height="60" viewBox="0 0 160 60">
      <MiniCard x={40} y={14} w={52} h={28} label="Marie" />
      {/* + button appearing on hover */}
      <motion.g
        animate={{ opacity: [0, 0, 1, 1, 1, 0], scale: [0.5, 0.5, 1, 1, 1.2, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.2, 0.3, 0.5, 0.65, 0.8] }}
        style={{ transformOrigin: '100px 28px' }}
      >
        <circle cx={100} cy={28} r={9} fill="hsl(var(--primary))" />
        <text x={100} y={32} textAnchor="middle" fontSize={14} fill="hsl(var(--primary-foreground))" fontFamily="sans-serif" fontWeight="bold">+</text>
      </motion.g>
      {/* Cursor moving to the + button */}
      <motion.g
        animate={{ x: [0, 20, 20, 20], y: [8, 0, 0, 0], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.3, 0.6, 0.8] }}
      >
        <g transform="translate(72, 28)">{CURSOR}</g>
      </motion.g>
      {/* New card appearing */}
      <motion.g
        animate={{ opacity: [0, 0, 0, 1], y: [10, 10, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.5, 0.65, 0.85] }}
      >
        <MiniCard x={110} y={14} w={40} h={28} label="?" />
      </motion.g>
    </svg>
  </div>
);

/* ── 7. Edit member: click card → pencil icon → drawer opens ── */
export const EditMemberAnimation: React.FC = () => (
  <div className="relative w-full h-[80px] rounded-lg bg-muted/30 border border-border/40 overflow-hidden flex items-center justify-center">
    <div className="flex items-center gap-3">
      {/* Card with click effect */}
      <motion.div
        className="relative px-4 py-2 rounded-lg border text-[11px] font-medium"
        style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', backgroundColor: 'hsl(var(--card))' }}
        animate={{
          borderColor: ['hsl(var(--border))', 'hsl(var(--primary))', 'hsl(var(--primary))'],
          boxShadow: ['0 0 0 0px transparent', '0 0 0 2px hsl(var(--primary) / 0.2)', '0 0 0 2px hsl(var(--primary) / 0.2)'],
        }}
        transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.25, 1] }}
      >
        Jean
      </motion.div>
      {/* Arrow */}
      <motion.div
        animate={{ opacity: [0, 1, 1], x: [-4, 0, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.3, 1] }}
      >
        <svg width="16" height="12" viewBox="0 0 16 12"><path d="M1 6h12M10 2l4 4-4 4" stroke="hsl(var(--primary))" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </motion.div>
      {/* Pencil icon + drawer mock */}
      <motion.div
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border"
        style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
        animate={{ opacity: [0, 0, 1], x: [8, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.35, 0.55] }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
        <span className="text-[10px] text-muted-foreground">Éditer</span>
      </motion.div>
    </div>
  </div>
);

/* ── 8. Create union: two cards joined by a line ── */
export const CreateUnionAnimation: React.FC = () => (
  <div className="relative w-full h-[80px] rounded-lg bg-muted/30 border border-border/40 overflow-hidden flex items-center justify-center">
    <svg width="160" height="60" viewBox="0 0 160 60">
      <MiniCard x={16} y={18} w={48} h={24} label="Marie" />
      <MiniCard x={96} y={18} w={48} h={24} label="Jean" />
      {/* Union line appearing */}
      <motion.line
        x1={64} y1={30} x2={64} y2={30}
        stroke="hsl(var(--foreground))"
        strokeWidth={2}
        animate={{ x2: [64, 96, 96] }}
        transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.4, 1], ease: 'easeInOut' }}
      />
      {/* Heart icon at center of line */}
      <motion.g
        animate={{ opacity: [0, 0, 1], scale: [0.3, 0.3, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.4, 0.6] }}
        style={{ transformOrigin: '80px 22px' }}
      >
        <text x={80} y={14} textAnchor="middle" fontSize={10} fill="hsl(var(--primary))">♥</text>
      </motion.g>
    </svg>
  </div>
);

/* ── 9. Search & filter: search bar + sidebar eye toggles ── */
export const SearchFilterAnimation: React.FC = () => (
  <div className="relative w-full h-[80px] rounded-lg bg-muted/30 border border-border/40 overflow-hidden flex items-center justify-center">
    <div className="flex items-center gap-3">
      {/* Search bar mock */}
      <motion.div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
        style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
        animate={{
          borderColor: ['hsl(var(--border))', 'hsl(var(--primary))', 'hsl(var(--primary))', 'hsl(var(--border))'],
        }}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.2, 0.6, 0.8] }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <motion.span
          className="text-[10px] font-mono"
          style={{ color: 'hsl(var(--foreground))' }}
          animate={{ opacity: [0, 0, 1, 1] }}
          transition={{ duration: 3, repeat: Infinity, times: [0, 0.2, 0.4, 1] }}
        >
          Marie
        </motion.span>
      </motion.div>
      {/* Eye toggle mock */}
      <motion.div
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg border"
        style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
      >
        <motion.div
          animate={{ opacity: [1, 1, 0.3, 0.3, 1] }}
          transition={{ duration: 3, repeat: Infinity, times: [0, 0.5, 0.6, 0.85, 0.95] }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
        </motion.div>
        <span className="text-[9px] text-muted-foreground">Filtres</span>
      </motion.div>
    </div>
  </div>
);

const STEP_ANIMATIONS = [PanAnimation, ZoomAnimation, CreateMemberAnimation, EditMemberAnimation, DragAnimation, LinkAnimation, CreateUnionAnimation, SearchFilterAnimation, UndoAnimation];

export default STEP_ANIMATIONS;
