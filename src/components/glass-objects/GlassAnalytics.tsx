import { ACCENT, FAR_FILL, FAR_STROKE, GlassTop } from './tokens';

// ANALYTICS PANEL — landscape dashboard: "SPEND ANALYTICS" title, 5 vertical
// bars on a labelled baseline, rising trend line with endpoint dot (accent).
// The title + axis baseline make it read as a dashboard, not abstract bars.
// A far-layer object, so it uses the brighter far fill.
export function GlassAnalytics() {
  return (
    <svg width='200' height='150' viewBox='0 0 200 150' fill='none'>
      <defs>
        <GlassTop id='anaTop' />
      </defs>
      <rect
        x='10'
        y='10'
        width='180'
        height='130'
        rx='14'
        fill={FAR_FILL}
        stroke={FAR_STROKE}
      />
      <rect
        x='10'
        y='10'
        width='180'
        height='130'
        rx='14'
        fill='url(#anaTop)'
      />
      {/* title */}
      <text
        x='28'
        y='32'
        fontSize='10'
        letterSpacing='1.4'
        fontWeight='600'
        fill='rgba(255,255,255,0.52)'
        fontFamily='system-ui, sans-serif'
      >
        SPEND ANALYTICS
      </text>
      {/* axes — y-axis + a brighter baseline that anchors the chart */}
      <line x1='30' y1='44' x2='30' y2='120' stroke='rgba(255,255,255,0.16)' />
      <line
        x1='30'
        y1='120'
        x2='180'
        y2='120'
        stroke='rgba(255,255,255,0.24)'
      />
      {/* y-axis ticks */}
      <line x1='27' y1='60' x2='30' y2='60' stroke='rgba(255,255,255,0.20)' />
      <line x1='27' y1='84' x2='30' y2='84' stroke='rgba(255,255,255,0.20)' />
      <line x1='27' y1='108' x2='30' y2='108' stroke='rgba(255,255,255,0.20)' />
      {/* bars (bottoms seated on the baseline y=120) */}
      <rect
        x='44'
        y='90'
        width='16'
        height='30'
        rx='2'
        fill='rgba(255,255,255,0.26)'
      />
      <rect
        x='70'
        y='74'
        width='16'
        height='46'
        rx='2'
        fill='rgba(255,255,255,0.34)'
      />
      <rect
        x='96'
        y='82'
        width='16'
        height='38'
        rx='2'
        fill='rgba(255,255,255,0.30)'
      />
      <rect
        x='122'
        y='58'
        width='16'
        height='62'
        rx='2'
        fill='rgba(255,255,255,0.40)'
      />
      <rect
        x='148'
        y='66'
        width='16'
        height='54'
        rx='2'
        fill='rgba(255,255,255,0.32)'
      />
      {/* rising trend line (accent) + endpoint dot */}
      <polyline
        points='52,92 78,78 104,84 130,60 156,54'
        fill='none'
        stroke={ACCENT}
        strokeWidth='2.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <circle cx='156' cy='54' r='4' fill={ACCENT} />
      {/* x-axis ticks */}
      <line x1='52' y1='120' x2='52' y2='123' stroke='rgba(255,255,255,0.20)' />
      <line
        x1='104'
        y1='120'
        x2='104'
        y2='123'
        stroke='rgba(255,255,255,0.20)'
      />
      <line
        x1='156'
        y1='120'
        x2='156'
        y2='123'
        stroke='rgba(255,255,255,0.20)'
      />
    </svg>
  );
}

export default GlassAnalytics;
