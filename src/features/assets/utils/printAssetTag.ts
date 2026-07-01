import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import type { Asset } from '../types';

export type AssetTagType = 'qrcode' | 'barcode';

/** Escape a value for safe insertion into the print window's HTML. */
const esc = (value?: string | number | null): string => {
  if (value == null || value === '') return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/** Best-available human location for the tag. */
const tagLocation = (a: Asset): string =>
  a.installedLocationName ||
  a.warehouseLocation ||
  a.storageLocation ||
  a.departmentName ||
  '';

/** Best-available category text for the tag. */
const tagCategory = (a: Asset): string =>
  [a.categoryName, a.subCategoryName].filter(Boolean).join(' / ');

/** Generate a QR code (encoding the asset tag) as a PNG data URL. */
const qrDataUrl = (text: string): Promise<string> =>
  QRCode.toDataURL(text, {
    width: 220,
    margin: 1,
    errorCorrectionLevel: 'H',
    color: { dark: '#000000', light: '#ffffff' },
  });

/** Generate a Code128 barcode (encoding the asset tag) as a PNG data URL. */
const barcodeDataUrl = (text: string): string => {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, text, {
    format: 'CODE128',
    width: 2,
    height: 60,
    displayValue: true,
    fontSize: 14,
    margin: 6,
  });
  return canvas.toDataURL('image/png');
};

const row = (label: string, value?: string | number): string => {
  const v = esc(value);
  if (!v) return '';
  return `<tr><td class="lbl">${label}</td><td class="sep">:</td><td class="val">${v}</td></tr>`;
};

const buildTag = (asset: Asset, imgSrc: string): string => `
  <div class="tag">
    <div class="code"><img src="${imgSrc}" alt="${esc(asset.assetTag)}" /></div>
    <table class="fields">
      ${row('Asset Tag', asset.assetTag)}
      ${row('Name', asset.itemName)}
      ${row('Serial No', asset.serialNumber)}
      ${row('Model', asset.itemCode)}
      ${row('Category', tagCategory(asset))}
      ${row('Location', tagLocation(asset))}
    </table>
  </div>`;

const PRINT_STYLES = `
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 12px; }
  .sheet { display: flex; flex-wrap: wrap; gap: 10px; }
  .tag {
    width: 260px; border: 1px solid #000; border-radius: 4px;
    padding: 10px; page-break-inside: avoid; break-inside: avoid;
    display: flex; flex-direction: column; align-items: center;
  }
  .code { margin-bottom: 6px; }
  .code img { display: block; max-width: 100%; height: auto; }
  table.fields { width: 100%; border-collapse: collapse; font-size: 12px; }
  table.fields td { padding: 1px 2px; vertical-align: top; }
  td.lbl { font-weight: bold; white-space: nowrap; }
  td.sep { width: 8px; text-align: center; }
  td.val { word-break: break-word; }
  @media print { body { padding: 0; } .no-print { display: none; } }
`;

/**
 * Render asset tags (QR or barcode) in a new window and open the browser print
 * dialog. Mirrors the legacy Tagging module: self-contained print window, one
 * tag per label, printed via the browser (no server round-trip).
 */
export async function printAssetTags(
  assets: Asset[],
  type: AssetTagType
): Promise<void> {
  if (!assets.length) return;

  const tagsHtml: string[] = [];
  for (const asset of assets) {
    try {
      const imgSrc =
        type === 'qrcode'
          ? await qrDataUrl(asset.assetTag)
          : barcodeDataUrl(asset.assetTag);
      tagsHtml.push(buildTag(asset, imgSrc));
    } catch (err) {
      // Skip a single bad tag rather than aborting the whole batch.
      console.error(`Failed to render tag for ${asset.assetTag}`, err);
    }
  }

  if (!tagsHtml.length) {
    throw new Error('Could not generate any asset tags.');
  }

  const win = window.open('', '_blank', 'width=900,height=650');
  if (!win) {
    throw new Error(
      'Unable to open the print window. Please allow pop-ups for this site.'
    );
  }

  win.document.write(`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Asset Tags</title>
        <style>${PRINT_STYLES}</style>
      </head>
      <body>
        <div class="sheet">${tagsHtml.join('')}</div>
        <script>
          window.onload = function () {
            setTimeout(function () { window.focus(); window.print(); }, 250);
          };
        </script>
      </body>
    </html>`);
  win.document.close();
}
