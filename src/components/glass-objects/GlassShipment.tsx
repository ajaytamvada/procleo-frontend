import React from 'react';
import { CARD_FILL, CARD_STROKE, GlassTop } from './tokens';

// SHIPMENT — a glass card (same body as the Analytics panel) carrying an
// isometric container stack, a dashed tracking route with a location dot,
// and a tracking-ID line. Same card / label / material as its three
// siblings; only the illustration inside differs. Each container is a solid
// glass volume with three faces (top 0.10 → front 0.06 → side 0.03), quiet
// 1px 0.14 strokes, a top-edge highlight, and subtle ribbing; one carries
// the lone indigo accent.
export function GlassShipment() {
  const STROKE = 'rgba(255,255,255,0.14)'; // same quiet stroke as every object
  // one isometric container anchored at its front-top-left (X, Y);
  // `accent` adds the single indigo tint across its three faces.
  const box = (X: number, Y: number, accent: boolean, id: string) => {
    const w = 40;
    const h = 18;
    const dx = 12; // depth run (screen-x) — identical across all three
    const dy = 7; // depth rise (screen-y) — identical across all three
    const topPts = `${X},${Y} ${X + dx},${Y - dy} ${X + w + dx},${Y - dy} ${X + w},${Y}`;
    const sidePts = `${X + w},${Y} ${X + w + dx},${Y - dy} ${X + w + dx},${Y - dy + h} ${X + w},${Y + h}`;
    const ribs: React.ReactElement[] = [];
    for (let i = 1; i <= 4; i++) {
      const rx = X + (w * i) / 5;
      ribs.push(
        <line
          key={i}
          x1={rx}
          y1={Y + 2.5}
          x2={rx}
          y2={Y + h - 2.5}
          stroke='rgba(255,255,255,0.10)'
        />
      );
    }
    return (
      <g key={id}>
        {/* three faces: side (darkest) → top (lightest) → front */}
        <polygon
          points={sidePts}
          fill='rgba(255,255,255,0.03)'
          stroke={STROKE}
        />
        <polygon
          points={topPts}
          fill='rgba(255,255,255,0.10)'
          stroke={STROKE}
        />
        <rect
          x={X}
          y={Y}
          width={w}
          height={h}
          fill='rgba(255,255,255,0.06)'
          stroke={STROKE}
        />
        {/* single indigo accent overlay across the three faces */}
        {accent && (
          <>
            <polygon points={sidePts} fill='rgba(139,92,246,0.18)' />
            <polygon points={topPts} fill='rgba(139,92,246,0.18)' />
            <rect
              x={X}
              y={Y}
              width={w}
              height={h}
              fill='rgba(139,92,246,0.18)'
            />
          </>
        )}
        {/* subtle front ribbing (4 lines) */}
        {ribs}
        {/* top-edge highlight on the lit leading edges */}
        <polyline
          points={`${X + dx},${Y - dy} ${X},${Y} ${X + w},${Y}`}
          fill='none'
          stroke='rgba(255,255,255,0.22)'
          strokeWidth='1'
        />
      </g>
    );
  };

  return (
    <svg width='200' height='150' viewBox='0 0 200 150' fill='none'>
      <defs>
        <GlassTop id='shipTop' />
      </defs>
      {/* card body + top-edge highlight (same treatment as the Analytics panel) */}
      <rect
        x='10'
        y='10'
        width='180'
        height='130'
        rx='14'
        fill={CARD_FILL}
        stroke={CARD_STROKE}
      />
      <rect
        x='10'
        y='10'
        width='180'
        height='130'
        rx='14'
        fill='url(#shipTop)'
      />

      {/* label */}
      <text
        x='28'
        y='32'
        fontSize='10'
        letterSpacing='1.4'
        fontWeight='600'
        fill='rgba(255,255,255,0.52)'
        fontFamily='system-ui, sans-serif'
      >
        SHIPMENT
      </text>

      {/* isometric container stack: 2 base + 1 offset on top, drawn back → front */}
      {box(76, 88, false, 'base-right')}
      {box(32, 88, false, 'base-left')}
      {box(58, 70, true, 'top')}

      {/* dashed tracking route + location dot to the right of the stack
          (kept left of the card's right third so the bleed never clips it) */}
      <polyline
        points='116,100 128,94 138,97'
        fill='none'
        stroke='rgba(255,255,255,0.28)'
        strokeWidth='1.5'
        strokeDasharray='3 3'
        strokeLinecap='round'
      />
      <circle
        cx='142'
        cy='95'
        r='4.5'
        fill='none'
        stroke='rgba(255,255,255,0.34)'
      />
      <circle cx='142' cy='95' r='1.8' fill='rgba(255,255,255,0.42)' />

      {/* tracking-ID line — two short dashes (PO text-line values) */}
      <rect
        x='30'
        y='120'
        width='40'
        height='3.5'
        rx='1.75'
        fill='rgba(255,255,255,0.34)'
      />
      <rect
        x='30'
        y='128'
        width='26'
        height='3.5'
        rx='1.75'
        fill='rgba(255,255,255,0.24)'
      />
    </svg>
  );
}

export default GlassShipment;
