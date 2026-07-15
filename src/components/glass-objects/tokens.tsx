/* --------------------------------------------------------------------------
 * Shared "glass object" design tokens + the reusable top-edge highlight.
 *
 * These back the soft glassmorphic 3D procurement artifacts (Purchase Order,
 * Shipment, Analytics, Contract) rendered as inline SVG and floated behind the
 * portal-select and supplier-login pages. Shared glass language:
 *   card body   : rgba(255,255,255,0.055) fill, 1px rgba(255,255,255,0.14) stroke
 *   top edge    : vertical highlight gradient (0.22 -> 0) that sells the glass
 *   details     : rgba(255,255,255,0.26–0.45) for hierarchy
 *   accent      : rgba(139,140,248,0.55) — exactly one indigo detail per object
 * ------------------------------------------------------------------------ */

export const CARD_FILL = 'rgba(255,255,255,0.055)';
export const CARD_STROKE = 'rgba(255,255,255,0.14)';
export const ACCENT = 'rgba(139,140,248,0.55)';
// Far-layer objects (Contract, Analytics) sit on the darker lower gradient, so
// their body/stroke run ~20% brighter than the near layer to stay legible
// while still reading as "further back".
export const FAR_FILL = 'rgba(255,255,255,0.07)';
export const FAR_STROKE = 'rgba(255,255,255,0.17)';

// Reusable top-edge glass highlight for a given gradient id.
export function GlassTop({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stopColor='#ffffff' stopOpacity='0.22' />
      <stop offset='0.45' stopColor='#ffffff' stopOpacity='0' />
    </linearGradient>
  );
}
