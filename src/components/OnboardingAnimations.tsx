import React from 'react';
import { motion } from 'framer-motion';

/** Shared labels type for animation translations */
export interface AnimLabels {
  clickPlus: string;
  holdAndDrag: string;
  click: string;
  clickPencil: string;
  guide: string;
  slide: string;
  spouse: string;
  found: string;
  undoDesc: string;
  typeLien: string;
  fusionnel: string;
  select: string;
  drag: string;
  choose: string;
}

const HAND = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M18 11V6.5a1.5 1.5 0 0 0-3 0V11" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M15 9.5V5.5a1.5 1.5 0 0 0-3 0v6" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 11.5V4a1.5 1.5 0 0 0-3 0v8" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 11.5V7.5a1.5 1.5 0 0 0-3 0V14a6 6 0 0 0 12 0v-3.5a1.5 1.5 0 0 0-3 0" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CURSOR = (
  <svg width="18" height="22" viewBox="0 0 16 20" fill="none">
    <path d="M1 1L1 14.5L4.5 11L8.5 18L11 17L7 10L12 10L1 1Z" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="1.2" />
  </svg>
);

const MiniCard: React.FC<{ x?: number; y?: number; w?: number; h?: number; label?: string; highlight?: boolean }> = ({
  x = 0, y = 0, w = 52, h = 28, label, highlight,
}) => (
  <g transform={`translate(${x},${y})`}>
    <rect width={w} height={h} rx={5} fill="hsl(var(--card))" stroke={highlight ? 'hsl(var(--primary))' : 'hsl(var(--border))'} strokeWidth={highlight ? 1.5 : 1} />
    {label && (
      <text x={w / 2} y={h / 2 + 4} textAnchor="middle" fontSize={8} fill="hsl(var(--muted-foreground))" fontFamily="sans-serif" fontWeight="500">
        {label}
      </text>
    )}
  </g>
);

const AnimLabel: React.FC<{ x: number; y: number; children: React.ReactNode; animate?: any; transition?: any }> = ({ x, y, children, animate, transition }) => (
  <motion.text
    x={x} y={y}
    textAnchor="middle"
    fontSize={7.5}
    fontFamily="sans-serif"
    fontWeight="600"
    fill="hsl(var(--primary))"
    animate={animate}
    transition={transition}
  >
    {children}
  </motion.text>
);

const AnimBox: React.FC<{ children: React.ReactNode; height?: string }> = ({ children, height = '100px' }) => (
  <div className="relative w-full rounded-xl bg-muted/30 border border-border/40 overflow-hidden flex items-center justify-center" style={{ height }}>
    {children}
  </div>
);

/* ── 1. Pan gesture ── */
export const PanAnimation: React.FC<{ labels?: AnimLabels }> = ({ labels }) => (
  <AnimBox height="110px">
    <svg width="200" height="90" viewBox="0 0 200 90">
      {Array.from({ length: 9 }).map((_, i) =>
        Array.from({ length: 5 }).map((_, j) => (
          <motion.circle key={`${i}-${j}`} cx={10 + i * 22} cy={6 + j * 18} r={2} fill="hsl(var(--border))"
            animate={{ x: [0, -30, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
        ))
      )}
      <motion.g animate={{ x: [0, -30, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        <MiniCard x={30} y={25} w={50} h={26} label="Marie" />
        <MiniCard x={110} y={25} w={50} h={26} label="Jean" />
      </motion.g>
      <motion.g animate={{ x: [0, -30, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        <g transform="translate(88, 52)">{HAND}</g>
      </motion.g>
      <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 3, repeat: Infinity }}>
        <path d="M85 82 L75 82 M78 78 L74 82 L78 86" stroke="hsl(var(--primary))" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M115 82 L125 82 M122 78 L126 82 L122 86" stroke="hsl(var(--primary))" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
      <text x={100} y={86} textAnchor="middle" fontSize={7} fill="hsl(var(--muted-foreground))" fontFamily="sans-serif">{labels?.slide || 'Glissez'}</text>
    </svg>
  </AnimBox>
);

/* ── 2. Zoom gesture ── */
export const ZoomAnimation: React.FC<{ labels?: AnimLabels }> = () => (
  <AnimBox height="110px">
    <svg width="200" height="90" viewBox="0 0 200 90">
      <motion.g animate={{ scale: [0.6, 1.2, 0.6] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '100px 38px' }}>
        <MiniCard x={74} y={24} w={52} h={28} label="Marie" />
      </motion.g>
      <motion.circle cx={80} cy={38} r={6} fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth={1.5}
        animate={{ cx: [80, 68, 80] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.circle cx={120} cy={38} r={6} fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth={1.5}
        animate={{ cx: [120, 132, 120] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.g animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3.5, repeat: Infinity }}>
        <path d="M74 38 L66 38" stroke="hsl(var(--primary) / 0.5)" strokeWidth={1} fill="none" strokeLinecap="round" />
        <path d="M126 38 L134 38" stroke="hsl(var(--primary) / 0.5)" strokeWidth={1} fill="none" strokeLinecap="round" />
      </motion.g>
      <motion.g animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3.5, repeat: Infinity }}>
        <rect x={82} y={70} width={16} height={14} rx={3} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} />
        <text x={90} y={80} textAnchor="middle" fontSize={10} fill="hsl(var(--foreground))" fontFamily="sans-serif" fontWeight="bold">−</text>
        <rect x={102} y={70} width={16} height={14} rx={3} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} />
        <text x={110} y={80} textAnchor="middle" fontSize={10} fill="hsl(var(--foreground))" fontFamily="sans-serif" fontWeight="bold">+</text>
      </motion.g>
    </svg>
  </AnimBox>
);

/* ── 3. Create member ── */
export const CreateMemberAnimation: React.FC<{ labels?: AnimLabels }> = ({ labels }) => (
  <AnimBox height="110px">
    <svg width="220" height="90" viewBox="0 0 220 90">
      <MiniCard x={30} y={22} w={56} h={30} label="Marie" />
      <motion.g animate={{ x: [0, 30, 30, 30], y: [12, 0, 0, 0], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.25, 0.55, 0.75] }}>
        <g transform="translate(60, 34)">{CURSOR}</g>
      </motion.g>
      <motion.g animate={{ opacity: [0, 0, 1, 1, 1, 0], scale: [0.5, 0.5, 1, 1, 1.15, 0.5] }}
        transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.2, 0.3, 0.5, 0.6, 0.75] }}
        style={{ transformOrigin: '100px 37px' }}>
        <circle cx={100} cy={37} r={11} fill="hsl(var(--primary))" />
        <text x={100} y={42} textAnchor="middle" fontSize={16} fill="hsl(var(--primary-foreground))" fontFamily="sans-serif" fontWeight="bold">+</text>
      </motion.g>
      <AnimLabel x={100} y={17} animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.25, 0.32, 0.55, 0.65] }}>
        {labels?.clickPlus || 'Cliquez sur ＋'}
      </AnimLabel>
      <motion.g animate={{ opacity: [0, 0, 0, 1, 1] }} transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.55, 0.6, 0.7, 1] }}>
        <path d="M116 37 L130 37 M127 33 L131 37 L127 41" stroke="hsl(var(--primary) / 0.5)" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
      <motion.g animate={{ opacity: [0, 0, 0, 1], y: [8, 8, 8, 0], scale: [0.8, 0.8, 0.8, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.55, 0.65, 0.85] }}
        style={{ transformOrigin: '162px 37px' }}>
        <MiniCard x={136} y={22} w={52} h={30} label="?" highlight />
      </motion.g>
    </svg>
  </AnimBox>
);

/* ── 4. Edit member ── */
export const EditMemberAnimation: React.FC<{ labels?: AnimLabels }> = ({ labels }) => (
  <AnimBox height="110px">
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-1.5">
        <motion.div
          className="relative px-4 py-2.5 rounded-lg border text-xs font-medium"
          style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', backgroundColor: 'hsl(var(--card))' }}
          animate={{ borderColor: ['hsl(var(--border))', 'hsl(var(--primary))', 'hsl(var(--primary))'], boxShadow: ['0 0 0 0px transparent', '0 0 0 3px hsl(var(--primary) / 0.15)', '0 0 0 3px hsl(var(--primary) / 0.15)'] }}
          transition={{ duration: 3, repeat: Infinity, times: [0, 0.25, 1] }}
        >
          Jean
          <motion.div className="absolute inset-0 rounded-lg border-2 border-primary" animate={{ scale: [0.95, 1.1], opacity: [0.5, 0] }} transition={{ duration: 1.2, repeat: Infinity }} />
        </motion.div>
        <motion.span className="text-[9px] font-medium text-primary"
          animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 3, repeat: Infinity, times: [0, 0.15, 0.35, 0.45] }}>
          ① {labels?.click || 'Cliquez'}
        </motion.span>
      </div>
      <motion.div animate={{ opacity: [0, 1, 1], x: [-4, 0, 0] }} transition={{ duration: 3, repeat: Infinity, times: [0, 0.3, 1] }}>
        <svg width="20" height="14" viewBox="0 0 20 14"><path d="M2 7h14M13 3l4 4-4 4" stroke="hsl(var(--primary))" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </motion.div>
      <div className="flex flex-col items-center gap-1.5">
        <motion.div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border"
          style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
          animate={{ opacity: [0, 0, 1], x: [8, 8, 0] }} transition={{ duration: 3, repeat: Infinity, times: [0, 0.35, 0.55] }}>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1.5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          </motion.div>
          <span className="text-[10px] text-muted-foreground">Modifier</span>
        </motion.div>
        <motion.span className="text-[9px] font-medium text-primary"
          animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 3, repeat: Infinity, times: [0, 0.45, 0.55, 1] }}>
          ② {labels?.clickPencil || 'Cliquez sur ✏️'}
        </motion.span>
      </div>
    </div>
  </AnimBox>
);

/* ── 5. Drag member ── */
export const DragAnimation: React.FC<{ labels?: AnimLabels }> = ({ labels }) => (
  <AnimBox height="110px">
    <svg width="220" height="90" viewBox="0 0 220 90">
      <rect x={30} y={24} width={52} height={28} rx={5} fill="none" stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="4 3" />
      <text x={56} y={42} textAnchor="middle" fontSize={7} fill="hsl(var(--border))" fontFamily="sans-serif">Jean</text>
      <motion.g animate={{ x: [0, 80, 80, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 0.65, 1] }}>
        <MiniCard x={30} y={24} w={52} h={28} label="Jean" highlight />
      </motion.g>
      <motion.g animate={{ x: [0, 80, 80, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 0.65, 1] }}>
        <g transform="translate(64, 38)">{CURSOR}</g>
      </motion.g>
      <motion.line x1={138} y1={8} x2={138} y2={82} stroke="hsl(var(--primary) / 0.4)" strokeWidth={1} strokeDasharray="4 3"
        animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.3, 0.4, 0.6, 0.7] }} />
      <AnimLabel x={154} y={16} animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.3, 0.42, 0.6, 0.7] }}>
        {labels?.guide || 'Repère'}
      </AnimLabel>
      <MiniCard x={152} y={24} w={52} h={28} label="Marie" />
      <text x={56} y={82} textAnchor="middle" fontSize={7} fill="hsl(var(--muted-foreground))" fontFamily="sans-serif">{labels?.holdAndDrag || 'Maintenez + glissez'}</text>
    </svg>
  </AnimBox>
);

/* ── 6. Create emotional link ── */
export const LinkAnimation: React.FC<{ labels?: AnimLabels }> = ({ labels }) => {
  const selectLabel = labels?.select || 'Sélectionner';
  const dragLabel = labels?.drag || 'Glisser';
  const chooseLabel = labels?.choose || 'Choisir';
  const typeLienLabel = labels?.typeLien || 'Type de lien';
  const fusionnelLabel = labels?.fusionnel || 'Fusionnel ▾';

  const cardAX = 10, cardAY = 14, cardBX = 120, cardBY = 14;
  const cardW = 52, cardH = 30;
  const cornersA = [
    { cx: cardAX, cy: cardAY }, { cx: cardAX + cardW, cy: cardAY },
    { cx: cardAX, cy: cardAY + cardH }, { cx: cardAX + cardW, cy: cardAY + cardH },
  ];
  const cornersB = [
    { cx: cardBX, cy: cardBY }, { cx: cardBX + cardW, cy: cardBY },
    { cx: cardBX, cy: cardBY + cardH }, { cx: cardBX + cardW, cy: cardBY + cardH },
  ];
  const fromDot = cornersA[1];
  const toDot = cornersB[0];

  return (
    <AnimBox height="120px">
      <svg width="190" height="100" viewBox="0 0 190 100">
        <motion.rect x={cardAX} y={cardAY} width={cardW} height={cardH} rx={5} fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth={1.5}
          animate={{ stroke: ['hsl(var(--border))', 'hsl(var(--primary))', 'hsl(var(--primary))', 'hsl(var(--primary))', 'hsl(var(--border))'] }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.08, 0.6, 0.82, 0.92] }} />
        <text x={cardAX + cardW / 2} y={cardAY + cardH / 2 + 4} textAnchor="middle" fontSize={8} fill="hsl(var(--muted-foreground))" fontFamily="sans-serif" fontWeight="500">Marie</text>

        <motion.rect x={cardBX} y={cardBY} width={cardW} height={cardH} rx={5} fill="hsl(var(--card))" strokeWidth={1.5}
          animate={{ stroke: ['hsl(var(--border))', 'hsl(var(--border))', 'hsl(var(--border))', 'hsl(var(--primary))', 'hsl(var(--primary))', 'hsl(var(--border))'] }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.25, 0.38, 0.42, 0.6, 0.82] }} />
        <text x={cardBX + cardW / 2} y={cardBY + cardH / 2 + 4} textAnchor="middle" fontSize={8} fill="hsl(var(--muted-foreground))" fontFamily="sans-serif" fontWeight="500">Paul</text>

        <motion.rect x={cardBX - 4} y={cardBY - 4} width={cardW + 8} height={cardH + 8} rx={7} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5}
          animate={{ opacity: [0, 0, 0, 0.6, 0.8, 0], scale: [1, 1, 1, 1, 1.03, 1] }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.25, 0.38, 0.42, 0.52, 0.6] }}
          style={{ transformOrigin: `${cardBX + cardW / 2}px ${cardBY + cardH / 2}px` }} />

        {cornersA.map((dot, i) => (
          <motion.circle key={`ca-${i}`} cx={dot.cx} cy={dot.cy} r={4}
            fill={i === 1 ? 'hsl(var(--primary))' : 'hsl(var(--card))'} stroke="hsl(var(--primary))" strokeWidth={1.3}
            animate={{ opacity: [0, 1, 1, 1, 0], scale: i === 1 ? [0, 1, 1.3, 1, 0] : [0, 1, 1, 1, 0] }}
            transition={{ duration: 5, repeat: Infinity, times: [0, 0.1, 0.18, 0.6, 0.82] }} />
        ))}
        {cornersB.map((dot, i) => (
          <motion.circle key={`cb-${i}`} cx={dot.cx} cy={dot.cy} r={4}
            fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth={1}
            animate={{ opacity: [0, 0, 0, 0.5, 0.5, 0] }}
            transition={{ duration: 5, repeat: Infinity, times: [0, 0.25, 0.38, 0.42, 0.56, 0.82] }} />
        ))}

        <motion.line x1={fromDot.cx} y1={fromDot.cy} x2={fromDot.cx} y2={fromDot.cy}
          stroke="hsl(var(--primary))" strokeWidth={2.5} strokeLinecap="round"
          animate={{ x2: [fromDot.cx, fromDot.cx, toDot.cx, toDot.cx, fromDot.cx], y2: [fromDot.cy, fromDot.cy, toDot.cy, toDot.cy, fromDot.cy], opacity: [0, 1, 1, 1, 0] }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.18, 0.42, 0.56, 0.82] }} />

        <motion.g
          animate={{ x: [0, 0, toDot.cx - fromDot.cx - 8, toDot.cx - fromDot.cx - 8, 0], y: [0, 0, toDot.cy - fromDot.cy, toDot.cy - fromDot.cy, 0], opacity: [0, 1, 1, 0.3, 0] }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.15, 0.42, 0.56, 0.82] }}>
          <g transform={`translate(${fromDot.cx + 2}, ${fromDot.cy + 2})`}>{CURSOR}</g>
        </motion.g>

        <motion.g animate={{ opacity: [0, 0, 0, 0, 1, 1, 0], y: [6, 6, 6, 6, 0, 0, 6] }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.42, 0.48, 0.54, 0.6, 0.78, 0.85] }}>
          <rect x={80} y={54} width={64} height={36} rx={5} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} />
          <text x={112} y={66} textAnchor="middle" fontSize={7} fill="hsl(var(--foreground))" fontFamily="sans-serif" fontWeight="600">{typeLienLabel}</text>
          <rect x={84} y={72} width={56} height={14} rx={3} fill="hsl(var(--primary) / 0.08)" stroke="hsl(var(--primary) / 0.25)" strokeWidth={0.5} />
          <text x={112} y={82} textAnchor="middle" fontSize={6.5} fill="hsl(var(--primary))" fontFamily="sans-serif">{fusionnelLabel}</text>
        </motion.g>

        <AnimLabel x={cardAX + cardW / 2} y={cardAY + cardH + 16}
          animate={{ opacity: [0, 1, 1, 0, 0] }} transition={{ duration: 5, repeat: Infinity, times: [0, 0.06, 0.15, 0.2, 1] }}>
          ① {selectLabel}
        </AnimLabel>
        <AnimLabel x={95} y={10}
          animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 5, repeat: Infinity, times: [0, 0.18, 0.24, 0.4, 0.44] }}>
          ② {dragLabel}
        </AnimLabel>
        <AnimLabel x={112} y={52}
          animate={{ opacity: [0, 0, 0, 1, 1, 0] }} transition={{ duration: 5, repeat: Infinity, times: [0, 0.52, 0.56, 0.6, 0.78, 0.85] }}>
          ③ {chooseLabel}
        </AnimLabel>
      </svg>
    </AnimBox>
  );
};

/* ── 7. Create union ── */
export const CreateUnionAnimation: React.FC<{ labels?: AnimLabels }> = ({ labels }) => (
  <AnimBox height="110px">
    <svg width="220" height="90" viewBox="0 0 220 90">
      <MiniCard x={24} y={22} w={52} h={30} label="Marie" />
      <MiniCard x={144} y={22} w={52} h={30} label="Jean" />
      <motion.g animate={{ opacity: [0, 1, 1, 0.3, 0.3], scale: [0.5, 1, 1.1, 0.8, 0.8] }}
        transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.15, 0.3, 0.45, 1] }} style={{ transformOrigin: '88px 37px' }}>
        <circle cx={88} cy={37} r={10} fill="hsl(var(--primary))" />
        <text x={88} y={41.5} textAnchor="middle" fontSize={14} fill="hsl(var(--primary-foreground))" fontFamily="sans-serif" fontWeight="bold">+</text>
      </motion.g>
      <AnimLabel x={110} y={18}
        animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.25, 0.35, 0.5, 0.6] }}>
        {labels?.spouse || 'Conjoint(e)'}
      </AnimLabel>
      <motion.line x1={76} y1={37} x2={76} y2={37} stroke="hsl(var(--foreground))" strokeWidth={2}
        animate={{ x2: [76, 76, 144, 144] }} transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.45, 0.7, 1], ease: 'easeInOut' }} />
      <motion.g animate={{ opacity: [0, 0, 0, 1], scale: [0.3, 0.3, 0.3, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.5, 0.65, 0.8] }} style={{ transformOrigin: '110px 28px' }}>
        <text x={110} y={18} textAnchor="middle" fontSize={14} fill="hsl(var(--primary))">♥</text>
      </motion.g>
    </svg>
  </AnimBox>
);

/* ── 8. Search & filter ── */
export const SearchFilterAnimation: React.FC<{ labels?: AnimLabels }> = ({ labels }) => (
  <AnimBox height="110px">
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <motion.div className="flex items-center gap-2 px-4 py-2 rounded-full border"
          style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
          animate={{ borderColor: ['hsl(var(--border))', 'hsl(var(--primary))', 'hsl(var(--primary))', 'hsl(var(--border))'] }}
          transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.2, 0.6, 0.8] }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <div className="w-16 relative h-4 overflow-hidden">
            <motion.span className="text-[11px] font-medium absolute left-0" style={{ color: 'hsl(var(--foreground))' }}
              animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.2, 0.4, 1] }}>
              Marie...
            </motion.span>
          </div>
        </motion.div>
        <motion.div animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.15, 0.5, 0.6] }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
        </motion.div>
      </div>
      <motion.div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
        style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
        animate={{ opacity: [0, 0, 0, 1], y: [4, 4, 4, 0], borderColor: ['hsl(var(--border))', 'hsl(var(--border))', 'hsl(var(--border))', 'hsl(var(--primary))'] }}
        transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.35, 0.45, 0.6] }}>
        <motion.div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center"
          animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 2 }}>
          <span className="text-[8px] text-primary font-bold">M</span>
        </motion.div>
        <span className="text-[10px] text-foreground font-medium">Marie Dupont</span>
        <motion.span className="text-[8px] text-primary font-medium"
          animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.55, 0.65, 1] }}>
          {labels?.found || '← trouvé !'}
        </motion.span>
      </motion.div>
    </div>
  </AnimBox>
);

/* ── 9. Undo/Redo ── */
export const UndoAnimation: React.FC<{ labels?: AnimLabels }> = ({ labels }) => (
  <AnimBox height="110px">
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <motion.div className="px-3 py-2 rounded-lg border text-xs font-mono font-semibold"
          style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))', backgroundColor: 'hsl(var(--muted))' }}
          animate={{ borderColor: ['hsl(var(--border))', 'hsl(var(--primary))', 'hsl(var(--border))'], color: ['hsl(var(--muted-foreground))', 'hsl(var(--primary))', 'hsl(var(--muted-foreground))'], scale: [1, 0.92, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.3, 0.6] }}>
          Ctrl
        </motion.div>
        <span className="text-muted-foreground/50 text-sm font-bold">+</span>
        <motion.div className="w-9 h-9 rounded-lg border flex items-center justify-center text-sm font-mono font-bold"
          style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))', backgroundColor: 'hsl(var(--muted))' }}
          animate={{ borderColor: ['hsl(var(--border))', 'hsl(var(--primary))', 'hsl(var(--border))'], color: ['hsl(var(--muted-foreground))', 'hsl(var(--primary))', 'hsl(var(--muted-foreground))'], scale: [1, 0.88, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.3, 0.6], delay: 0.05 }}>
          Z
        </motion.div>
        <motion.div animate={{ x: [0, -8, 0], opacity: [0.2, 1, 0.2] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.3, 0.6] }}>
          <svg width="30" height="20" viewBox="0 0 28 20">
            <path d="M22 17C22 10 17 6 10 6L4 6M4 6L9 1M4 6L9 11" stroke="hsl(var(--primary))" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </motion.div>
      </div>
      <motion.p className="text-[10px] text-muted-foreground font-medium text-center"
        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }}>
        {labels?.undoDesc || 'Annule la dernière action'}
      </motion.p>
    </div>
  </AnimBox>
);

const STEP_ANIMATIONS = [PanAnimation, ZoomAnimation, CreateMemberAnimation, EditMemberAnimation, DragAnimation, LinkAnimation, CreateUnionAnimation, SearchFilterAnimation, UndoAnimation];

export default STEP_ANIMATIONS;
