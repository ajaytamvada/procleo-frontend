import { ACCENT, FAR_FILL, FAR_STROKE, GlassTop } from './tokens';

// CONTRACT — "CONTRACT" label, paragraph lines, a signature squiggle above a
// dashed signature line, and a two-tone wax seal with a ribbon tail bottom-
// left. Rolled curl on the BOTTOM edge (opposite the PO) so the two scrolls
// don't twin: PO curls at the top, the contract curls at the bottom.
export function GlassContract() {
  return (
    <svg width='160' height='200' viewBox='0 0 160 200' fill='none'>
      <defs>
        <GlassTop id='conTop' />
        {/* dark-top / light-bottom shade — mirror of the PO curl */}
        <linearGradient id='conCurl' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#000000' stopOpacity='0.28' />
          <stop offset='1' stopColor='#ffffff' stopOpacity='0.24' />
        </linearGradient>
      </defs>

      {/* sheet body — ends above the bottom curl */}
      <rect
        x='12'
        y='10'
        width='136'
        height='152'
        rx='14'
        fill={FAR_FILL}
        stroke={FAR_STROKE}
      />
      <rect
        x='12'
        y='10'
        width='136'
        height='152'
        rx='14'
        fill='url(#conTop)'
      />

      {/* label + subheading */}
      <text
        x='24'
        y='34'
        fontSize='10.5'
        letterSpacing='1.8'
        fontWeight='600'
        fill='rgba(255,255,255,0.55)'
        fontFamily='system-ui, sans-serif'
      >
        CONTRACT
      </text>
      <rect
        x='24'
        y='42'
        width='48'
        height='4'
        rx='2'
        fill='rgba(255,255,255,0.30)'
      />

      {/* paragraph lines (varying width) */}
      <rect
        x='24'
        y='58'
        width='104'
        height='4'
        rx='2'
        fill='rgba(255,255,255,0.36)'
      />
      <rect
        x='24'
        y='66'
        width='94'
        height='4'
        rx='2'
        fill='rgba(255,255,255,0.30)'
      />
      <rect
        x='24'
        y='74'
        width='104'
        height='4'
        rx='2'
        fill='rgba(255,255,255,0.34)'
      />
      <rect
        x='24'
        y='82'
        width='86'
        height='4'
        rx='2'
        fill='rgba(255,255,255,0.28)'
      />
      <rect
        x='24'
        y='90'
        width='98'
        height='4'
        rx='2'
        fill='rgba(255,255,255,0.32)'
      />
      <rect
        x='24'
        y='98'
        width='72'
        height='4'
        rx='2'
        fill='rgba(255,255,255,0.24)'
      />

      {/* signature squiggle above a dashed signature line (right side) */}
      <path
        d='M66 126 c 5 -16 11 7 18 -4 s 9 -14 15 -3 s 8 10 16 -5 s 9 7 15 -1'
        fill='none'
        stroke='rgba(255,255,255,0.50)'
        strokeWidth='2'
        strokeLinecap='round'
      />
      <line
        x1='64'
        y1='136'
        x2='136'
        y2='136'
        stroke='rgba(255,255,255,0.26)'
        strokeDasharray='3 3'
      />
      <rect
        x='64'
        y='142'
        width='38'
        height='3.5'
        rx='1.75'
        fill='rgba(255,255,255,0.22)'
      />

      {/* rolled-scroll curl across the very bottom */}
      <path
        d='M16 156 Q80 148 144 156 L144 162 Q80 154 16 162 Z'
        fill='rgba(0,0,0,0.14)'
      />
      <rect
        x='6'
        y='160'
        width='148'
        height='22'
        rx='11'
        fill={FAR_FILL}
        stroke={FAR_STROKE}
      />
      <rect
        x='6'
        y='160'
        width='148'
        height='22'
        rx='11'
        fill='url(#conCurl)'
      />
      <path
        d='M14 178 Q80 186 146 178'
        fill='none'
        stroke='rgba(255,255,255,0.24)'
        strokeWidth='1'
      />

      {/* two-tone wax seal + ribbon tail, bottom-left (drawn last so it drapes
          over the rolled edge) */}
      <path
        d='M32 150 L28 172 L38 165 L48 172 L44 150 Z'
        fill='rgba(139,140,248,0.42)'
      />
      <circle
        cx='38'
        cy='142'
        r='14'
        fill='rgba(139,140,248,0.24)'
        stroke={ACCENT}
      />
      <circle
        cx='38'
        cy='142'
        r='8.5'
        fill='rgba(139,140,248,0.34)'
        stroke='rgba(139,140,248,0.54)'
      />
      <path
        d='M38 137 l1.6 3.1 3.4 .3 -2.6 2.2 .8 3.3 -3.2 -1.8 -3.2 1.8 .8 -3.3 -2.6 -2.2 3.4 -.3 z'
        fill='rgba(255,255,255,0.34)'
      />
    </svg>
  );
}

export default GlassContract;
