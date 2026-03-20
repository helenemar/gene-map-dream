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
      {/* Dashed origin */}
      <rect x={30} y={18} width={48} height={24} rx={4} fill="none" stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="3 2" />
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
export const LinkAnimation: React.FC = () => (
  <div className="relative w-full h-[80px] rounded-lg bg-muted/30 border border-border/40 overflow-hidden flex items-center justify-center">
    <svg width="160" height="60" viewBox="0 0 160 60">
      {/* Card A */}
      <MiniCard x={20} y={18} w={44} h={24} label="Marie" />
      {/* Card B */}
      <MiniCard x={96} y={18} w={44} h={24} label="Paul" />
      {/* Anchor dot on Card A */}
      <motion.circle
        cx={64} cy={30} r={3.5}
        fill="hsl(var(--primary))"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Elastic line growing */}
      <motion.line
        x1={64} y1={30}
        x2={64} y2={30}
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeLinecap="round"
        animate={{ x2: [64, 96, 96, 64] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 0.6, 1] }}
      />
      {/* Snap pulse on Card B anchor */}
      <motion.circle
        cx={96} cy={30} r={3.5}
        fill="hsl(var(--primary) / 0.3)"
        stroke="hsl(var(--primary))"
        strokeWidth={1.5}
        animate={{ scale: [0, 0, 1.4, 1, 0], opacity: [0, 0, 1, 1, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, times: [0, 0.3, 0.45, 0.6, 0.7] }}
      />
    </svg>
  </div>
);

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
