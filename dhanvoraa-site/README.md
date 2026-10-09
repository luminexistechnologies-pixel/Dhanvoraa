# Dhanvoraa website

Responsive static website, built from the supplied PDF, SEO workbook and logo. Uses the Augmont reference palette: `#013443`, `#D99A29`, `#FFF8E1` and `#FAEBBD`. Website content comes from the supplied documents; the reference website is used for colours and the demo destination only.

## Run locally

Node.js is the only requirement. No dependency installation is needed. Run from the `dhanvoraa-site` folder or from the parent workspace folder.

```powershell
npm run dev
```

Open http://127.0.0.1:4173. Saving page content, styles, scripts, configuration or assets rebuilds the pages and refreshes the browser automatically. You can also run `npm run build`, `npm run check`, and `npm start` separately. Set the `PORT` environment variable if you need another port. The deployable static website is in `dist/`.

## Edit configuration and content

Update `site.config.json` with the final `origin`, `augmontUrl`, `supportEmail` and `supportPhone`, then rebuild. Contact fields are intentionally empty. The preview origin is real and can be replaced by the final production domain; rebuilding updates all canonical URLs, structured data, social metadata and sitemap URLs together.

Edit page content in `build.mjs`, visual styles in `styles.css`, and navigation, consent and click events in `app.js`. The brand image is in `assets/brand.jpeg`.

`Start saving` opens the supplied Augmont demo in a new tab. It does not use an iframe, collect financial information, process payments, or create recurring saving instructions.

## SEO

All nine workbook pages have rendered HTML, individual titles, descriptions, H1s and canonical URLs, Open Graph title/description, JSON-LD and contextual links. Additional requested pages cover how it works, contact, and policy information. Price pages explain how to review transaction quotes. The website has no calculator or live-rate integration. Product/Offer markup is omitted because this website does not display purchase offers.

Both header and footer use `assets/wordmark-transparent.png`. The footer links to Luminexis Technologies as the design and development credit.

The canonical files are `dist/robots.txt` and `dist/sitemap.xml`. Requested aliases `robot.txt` and `site.xml` contain the same content. The sitemap includes the Silver Price page, which was missing from the workbook's sample XML despite appearing as a worksheet.

Policy pages are draft preview information and have `noindex,follow`; they are excluded from the sitemap. Replace them with reviewed final policies and set `legalApproved` only after approval. No invented legal entity or support contact is published.

## Analytics

CTA clicks emit a `dhanvoraa:analytics` event with `name: start_saving_click`, page path and destination. If an approved `window.gtag` is available the event is forwarded to it. An optional `analyticsScriptUrl` can be configured; it is loaded only after analytics consent. No tracker is enabled by default. Hosting access logs are controlled by the hosting provider.

## Launch settings

Replace the demo destination and preview domain, add support contact details, publish approved policies and partner disclosures, and connect approved analytics when available. The current hosted copy is private; public search indexing requires a public production deployment. `robots.txt` is crawl guidance and does not control the hosting audience.
