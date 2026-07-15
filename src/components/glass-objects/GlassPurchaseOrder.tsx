import { CARD_FILL, CARD_STROKE, GlassTop } from './tokens';

// PURCHASE ORDER — paper-scroll silhouette (rolled curl on the TOP edge),
// "PURCHASE ORDER" header label, PO number, 3-col mini table, circular seal
// with a check. Reads in 2s as a signed purchase order.
export function GlassPurchaseOrder() {
  return (
    <svg width='160' height='200' viewBox='0 0 160 200' fill='none'>
      <defs>
        <GlassTop id='poTop' />
        {/* top-light / bottom-dark shade that sells the rolled curl */}
        <linearGradient id='poCurl' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#ffffff' stopOpacity='0.26' />
          <stop offset='1' stopColor='#000000' stopOpacity='0.28' />
        </linearGradient>
      </defs>

      {/* sheet body — starts below the curl so the roll reads as "over" it */}
      <rect
        x='12'
        y='34'
        width='136'
        height='156'
        rx='14'
        fill={CARD_FILL}
        stroke={CARD_STROKE}
      />
      <rect x='12' y='34' width='136' height='156' rx='14' fill='url(#poTop)' />
      {/* cast shade of the curl onto the sheet */}
      <path
        d='M16 40 Q80 50 144 40 L144 46 Q80 56 16 46 Z'
        fill='rgba(0,0,0,0.16)'
      />

      {/* rolled-scroll curl across the very top */}
      <rect
        x='6'
        y='18'
        width='148'
        height='22'
        rx='11'
        fill={CARD_FILL}
        stroke={CARD_STROKE}
      />
      <rect x='6' y='18' width='148' height='22' rx='11' fill='url(#poCurl)' />
      <path
        d='M14 23 Q80 15 146 23'
        fill='none'
        stroke='rgba(255,255,255,0.30)'
        strokeWidth='1'
      />

      {/* header label + PO number */}
      <text
        x='24'
        y='60'
        fontSize='10.5'
        letterSpacing='1.6'
        fontWeight='600'
        fill='rgba(255,255,255,0.55)'
        fontFamily='system-ui, sans-serif'
      >
        PURCHASE ORDER
      </text>
      <text
        x='24'
        y='74'
        fontSize='8'
        letterSpacing='0.6'
        fontWeight='500'
        fill='rgba(255,255,255,0.40)'
        fontFamily='system-ui, sans-serif'
      >
        PO-2041
      </text>
      <line x1='24' y1='82' x2='136' y2='82' stroke='rgba(255,255,255,0.16)' />

      {/* 3-column mini table (3 rows) */}
      <rect
        x='24'
        y='92'
        width='112'
        height='48'
        rx='3'
        fill='none'
        stroke='rgba(255,255,255,0.16)'
      />
      <line x1='61' y1='92' x2='61' y2='140' stroke='rgba(255,255,255,0.14)' />
      <line x1='98' y1='92' x2='98' y2='140' stroke='rgba(255,255,255,0.14)' />
      <line
        x1='24'
        y1='108'
        x2='136'
        y2='108'
        stroke='rgba(255,255,255,0.14)'
      />
      <line
        x1='24'
        y1='124'
        x2='136'
        y2='124'
        stroke='rgba(255,255,255,0.14)'
      />
      <rect
        x='30'
        y='98'
        width='22'
        height='4'
        rx='2'
        fill='rgba(255,255,255,0.34)'
      />
      <rect
        x='67'
        y='98'
        width='20'
        height='4'
        rx='2'
        fill='rgba(255,255,255,0.30)'
      />
      <rect
        x='104'
        y='98'
        width='18'
        height='4'
        rx='2'
        fill='rgba(255,255,255,0.30)'
      />
      <rect
        x='30'
        y='114'
        width='18'
        height='4'
        rx='2'
        fill='rgba(255,255,255,0.24)'
      />
      <rect
        x='67'
        y='114'
        width='22'
        height='4'
        rx='2'
        fill='rgba(255,255,255,0.24)'
      />
      <rect
        x='104'
        y='114'
        width='16'
        height='4'
        rx='2'
        fill='rgba(255,255,255,0.24)'
      />
      <rect
        x='30'
        y='130'
        width='20'
        height='4'
        rx='2'
        fill='rgba(255,255,255,0.22)'
      />
      <rect
        x='104'
        y='130'
        width='18'
        height='4'
        rx='2'
        fill='rgba(255,255,255,0.22)'
      />

      {/* circular approval seal bottom-right with a check */}
      <circle
        cx='118'
        cy='166'
        r='15'
        fill='none'
        stroke='rgba(255,255,255,0.30)'
      />
      <circle
        cx='118'
        cy='166'
        r='10'
        fill='none'
        stroke='rgba(255,255,255,0.20)'
      />
      <path
        d='M112 166 l4 4 l8 -8'
        fill='none'
        stroke='rgba(255,255,255,0.44)'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export default GlassPurchaseOrder;
