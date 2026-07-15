// Shared CSS for the floating glass procurement objects — the staggered float,
// depth-layer hiding, and reduced-motion opt-out. Rendered once per page that
// uses the collage (portal-select + supplier-login) so the animation lives in a
// single source of truth. Positioning/rotation/scale stay per-page (inline).
//
//   .glass-object  float wrapper (reads --dur / --delay CSS vars)
//   .glass-inner   the rotate+scale + drop-shadow layer around the SVG
//   .glass-lower   far/lower pair — hidden < 1200px
//   all objects    hidden < 900px (mobile = clean gradient + content only)
export function GlassFloatStyles() {
  return (
    <style>{`
      .glass-object {
        will-change: transform;
        animation: glassFloat var(--dur, 16s) ease-in-out infinite alternate;
        animation-delay: var(--delay, 0s);
      }
      .glass-inner {
        filter: drop-shadow(0 16px 40px rgba(0, 0, 0, 0.35));
      }
      @keyframes glassFloat {
        from { transform: translateY(-10px) rotate(-1deg); }
        to   { transform: translateY(10px) rotate(1deg); }
      }
      /* Depth layering: hide the far/lower pair on narrower viewports,
         and drop all objects on mobile (clean gradient only). */
      @media (max-width: 1199px) {
        .glass-lower { display: none; }
      }
      @media (max-width: 899px) {
        .glass-object { display: none; }
      }
      @media (prefers-reduced-motion: reduce) {
        .glass-object { animation: none; }
      }
    `}</style>
  );
}

export default GlassFloatStyles;
