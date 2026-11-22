# Noor Al Zahra

Vue 3, Vite, TypeScript, Vue Router, Pinia, vue-i18n and vite-ssg. This is a **private preview, not a live commerce deployment**. The catalogue has no verified prices. Checkout is disabled by default; the current Sites preview hosts only the static frontend, not the Cloudflare Pages API functions. The contact form therefore displays a WhatsApp fallback in that preview.

## Run and check

Use Node 22.12+ or 24 and pnpm. Run `pnpm install`, `pnpm dev`, `pnpm lint`, `pnpm test:api` and `pnpm build`. The SSG output is in `dist`. Entry, shop and story are separate lazy-loaded views. English and Arabic shop routes are `/en/shop` and `/ar/shop`.

## Products and images

Edit `src/views/Shop.vue` for the current category cards. Confirm real product names, notes, sizes, stock and price before listing individual products. Server-side product IDs and paise prices belong in the `catalog` in `functions/api/[[path]].ts`; client-provided amounts are never trusted. **Do not enable checkout until shipping charges, tax, inventory, COD terms, actual products and policies are implemented and tested.** COD is not currently implemented.

`public/images/fragrance-illustration-original.png` is AI-generated and the category cards explicitly label it illustrative. Built-in image generation prompt: “Premium editorial fragrance photograph for a luxury black-and-gold perfume website, wide horizontal composition, unbranded dark attar oil bottle with gold cap, oud wood, and slender incense sticks on black stone with warm gold light and smoke; no text or logos.” The 3840-pixel card exports were enlarged from that smaller generated image; they do not contain native 4K detail. Supplied images are screenshots and need original clean photographs. Real-ESRGAN was not available; `pnpm images` uses Sharp and avoids enlarging the low-resolution supplied photos. Fonts are self-hosted from Fontsource packages.

## Cloudflare Pages and server configuration

Deploy the repository to Cloudflare Pages: build command `pnpm build`, output `dist`, and include the root `functions` directory. Add `APP_ORIGIN` as the exact HTTPS public origin, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `SHEETS_WEB_APP_URL` and `SHEETS_SHARED_SECRET` as server-side environment variables or secrets. Bind an `ORDERS` KV namespace and a Cloudflare `RATE_LIMITER` rate-limit binding. The API fails closed if either binding is absent. The CORS/origin check only permits the configured origin, requires HTTPS, limits request size, validates with Zod and uses a honeypot. Card data is handled by Razorpay, not this application.

The sample backend is **not yet production-ready**: finish shipping/tax/COD and add durable, atomic idempotency and payment-webhook reconciliation before accepting real orders. KV alone is eventually consistent and does not guarantee exactly-once processing. Verify capture, duplicate submissions, network failures and signature handling with Razorpay test mode. Complete a security and privacy review before live keys. Set `VITE_CHECKOUT_ENABLED=true` only after these steps. The Razorpay key ID is public; the secret must remain server-only. Activate and validate live credentials separately with Razorpay. International payments need a separately confirmed payment and delivery solution such as Stripe or PayPal.

## Google Sheets setup

1. Create a spreadsheet with tabs `Orders` and `Enquiries`. Add header rows matching the arrays in `integrations/google-apps-script.gs`.
2. In Apps Script, paste that file. Set Script Properties `SPREADSHEET_ID` and a long random `SHARED_SECRET`; keep the secret private.
3. Deploy as a web app running as the authorized owner and accessible to the server. Place its HTTPS `/exec` URL and the same secret in Cloudflare server secrets. Restrict spreadsheet access and use a dedicated account where possible.
4. Bind KV and the rate limiter, then test enquiries and test-mode orders. The server appends an order-created row and a payment-status row. Review retention and access to customer data. WhatsApp links open a separate conversation and are not automatically recorded in the sheet; use the WhatsApp Business Cloud API as an optional upgrade for automatic messages and a corresponding server-side audit flow.

## Domain, analytics and outstanding content

Attach the custom domain in Cloudflare Pages, configure DNS and wait for its automatic HTTPS certificate. Update absolute canonical, Open Graph, hreflang, robots and sitemap URLs when the domain is known. Plausible is disabled by default. After setting up Plausible and completing the privacy notice, set `VITE_PLAUSIBLE_DOMAIN` to the domain at build time to enable its script. The shop number, precise address, product details, shipping destinations and fees, bulk-COD conditions, founder story, returns, privacy and terms remain unconfirmed. The current footer policy placeholders are not legal policies. No Lighthouse score, payment end-to-end test, real upscaling or mobile accessibility audit has been verified.

## 3D story

The story dynamically imports pinned Three.js 0.187.0 only after the visitor chooses the story and WebGL/device checks pass. A single `THREE.Points` draw call uses a custom shader for the six morphing particle scenes; desktop devices use 18,000–30,000 particles and mobile uses 8,000. Pixel ratio adapts up to 2, and animation pauses when the tab is hidden. Low-power or WebGL-unavailable devices use the original 2D canvas; reduced-motion visitors go straight to the shop. Pointer or touch input repels the particles, while available device-orientation events add parallax; some devices require user permission and may not provide tilt data. The last scene samples the supplied bottle image because the previous shop screenshot was removed at the owner's request.

`public/images/product-clean-ai.png` and its WebP export are AI-edited versions of the supplied product screenshot. ImageGen prompt: “Remove only the three Instagram overlay badges: the black '1/2' circle at top right, the round profile icon at bottom left, and the round sound icon at bottom right. Reconstruct the background and preserve the bottle, label, composition and lighting.” Generative editing may subtly alter photographic details; the original supplied screenshot remains available for comparison. The shop and collection use lightweight decorative particles, paused off-screen and disabled for reduced motion.
