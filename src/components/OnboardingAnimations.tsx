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

/* ── 4. Create link: drag from anchor to another card ── */
export const LinkAnimation: React.FC = () => {
  const cardAX = 16, cardAY = 14, cardBX = 100, cardBY = 14;
  const cardW = 48, cardH = 28;

  // Anchor positions on all 4 sides of each card (midpoints)
  const anchorsA = [
    { cx: cardAX + cardW / 2, cy: cardAY, label: 'top' },           // top
    { cx: cardAX + cardW, cy: cardAY + cardH / 2, label: 'right' }, // right ← active
    { cx: cardAX + cardW / 2, cy: cardAY + cardH, label: 'bottom' },// bottom
    { cx: cardAX, cy: cardAY + cardH / 2, label: 'left' },          // left
  ];
  const anchorsB = [
    { cx: cardBX + cardW / 2, cy: cardBY, label: 'top' },
    { cx: cardBX + cardW, cy: cardBY + cardH / 2, label: 'right' },
    { cx: cardBX + cardW / 2, cy: cardBY + cardH, label: 'bottom' },
    { cx: cardBX, cy: cardBY + cardH / 2, label: 'left' },          // left ← active
  ];

  const fromAnchor = anchorsA[1]; // right side of A
  const toAnchor = anchorsB[3];   // left side of B

  return (
    <div className="relative w-full h-[80px] rounded-lg bg-muted/30 border border-border/40 overflow-hidden flex items-center justify-center">
      <svg width="164" height="56" viewBox="0 0 164 56">
        {/* Card A */}
        <MiniCard x={cardAX} y={cardAY} w={cardW} h={cardH} label="Marie" />
        {/* Card B */}
        <MiniCard x={cardBX} y={cardBY} w={cardW} h={cardH} label="Paul" />

        {/* All 4 anchor dots on Card A */}
        {anchorsA.map((a, i) => (
          <motion.circle
            key={`a-${i}`}
            cx={a.cx} cy={a.cy} r={2.5}
            fill={i === 1 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.35)'}
            stroke={i === 1 ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
            strokeWidth={0.8}
            animate={i === 1 ? { scale: [1, 1.5, 1], r: [2.5, 3.5, 2.5] } : { scale: [0.8, 1, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i === 1 ? 0 : 0.3 }}
          />
        ))}

        {/* All 4 anchor dots on Card B */}
        {anchorsB.map((a, i) => (
          <motion.circle
            key={`b-${i}`}
            cx={a.cx} cy={a.cy} r={2.5}
            fill={i === 3 ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--muted-foreground) / 0.35)'}
            stroke={i === 3 ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
            strokeWidth={0.8}
            animate={i === 3 ? { scale: [0, 0, 1.4, 1, 0], opacity: [0, 0, 1, 1, 0] } : { scale: [0.8, 1, 0.8] }}
            transition={i === 3
              ? { duration: 2.8, repeat: Infinity, times: [0, 0.3, 0.45, 0.6, 0.7] }
              : { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }
            }
          />
        ))}

        {/* Elastic line from right side of A → left side of B */}
        <motion.line
          x1={fromAnchor.cx} y1={fromAnchor.cy}
          x2={fromAnchor.cx} y2={fromAnchor.cy}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          strokeLinecap="round"
          animate={{ x2: [fromAnchor.cx, toAnchor.cx, toAnchor.cx, fromAnchor.cx] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 0.6, 1] }}
        />

        {/* Cursor following the line */}
        <motion.g
          animate={{
            x: [0, toAnchor.cx - fromAnchor.cx - 6, toAnchor.cx - fromAnchor.cx - 6, 0],
            opacity: [1, 1, 0.4, 1],
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 0.6, 1] }}
        >
          <g transform={`translate(${fromAnchor.cx + 2}, ${fromAnchor.cy + 2})`}>
            {CURSOR}
          </g>
        </motion.g>
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

const STEP_ANIMATIONS = [PanAnimation, ZoomAnimation, DragAnimation, LinkAnimation, UndoAnimation];

export default STEP_ANIMATIONS;
