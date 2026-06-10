# Ko-fi Donate Page Research

Researched: 2026-06-10

## Summary

The best path is to create a native `/donate` page in this Nuxt app and integrate Ko-fi as the payment surface rather than relying on the current global floating button. The page should use That Covid Life's existing Ko-fi account (`thatcovidlife`) and should include:

- A branded TCL donate/support page built in Vue/Tailwind.
- Ko-fi's inline Tip Panel embed, generated from Ko-fi's logged-in Widgets page.
- Native fallback links to `https://ko-fi.com/thatcovidlife` and, if memberships are desired, `https://ko-fi.com/thatcovidlife/tiers`.
- Updated footer/sitemap/i18n entries.
- Keeping the current floating widget as-is for now.

Ko-fi supports both one-time tips and memberships through the widget, but the official docs are inconsistent about whether an external widget can default to memberships. Treat one-time support as the reliable default for the embedded widget, and use a direct `/tiers` link when monthly support should be prominent.

## Product Decisions

- Keep the existing floating Ko-fi button as-is for now.
- Give one-time tips and monthly memberships equal emphasis on the `/donate` page.
- Mirror the Ko-fi Goal story in native website copy.
- Use Ko-fi's dashboard as the donation record source of truth.
- Do not add Ko-fi webhooks in this phase.
- If webhook payloads are stored in a future phase, update the privacy/legal pages first.

## Current App State

Current Ko-fi integration:

- `plugins/kofi.client.ts` injects `https://storage.ko-fi.com/cdn/scripts/overlay-widget.js` globally on the client.
- It calls `kofiWidgetOverlay.draw('thatcovidlife', { type: 'floating-chat', ... })`.
- `assets/css/main.css` contains global overrides for the floating Ko-fi container and popup.
- `nuxt.config.ts` currently includes `storage.ko-fi.com` only under CSP `img-src`.

Relevant app files for a donate page:

- `pages/support.vue` and `pages/contribute.vue` show the existing page/form style.
- `components/TclSeo.vue` can provide title/meta/canonical markup.
- `composables/useFooterConfig.ts` controls footer links.
- `server/api/__sitemap__/urls.get.ts` has a static `pages` list that should include `/donate`.
- `i18n/locales/{en,es,fr,pt}.ts` need donate page labels/copy if the page is localized.

## Ko-fi Capabilities

Ko-fi's docs describe two website widget modes:

- **Floating Button**: the current behavior. It stays visible and expands into the tip panel when clicked.
- **Tip Panel**: an inline, always-visible panel intended for a dedicated page, sidebar, footer, or other permanent space.

The Tip Panel is the right fit for a `/donate` page because it lets the page own the layout, copy, SEO, accessibility, and fallback links while Ko-fi handles payment UI.

Ko-fi also supports:

- Direct creator pages, e.g. `https://ko-fi.com/thatcovidlife`.
- Direct membership pages by appending `/tiers`, e.g. `https://ko-fi.com/thatcovidlife/tiers`.
- Direct shop/commission links by appending `/shop` or `/commissions`, though Ko-fi says Shop and Commissions cannot currently be embedded through the tip widget.
- Optional Ko-fi Goals that can communicate a fundraising target on the Ko-fi page.
- Payment webhooks for payment events only.

## Recommended Approach

Build `pages/donate.vue` as a native app page with a Ko-fi Tip Panel embedded in the main content area.

Page structure:

- Header: clear title, campaign story copy, and paired external Ko-fi fallback buttons for one-time and monthly support.
- Main payment area: the Ko-fi Tip Panel inside a fixed-height, responsive container.
- Secondary CTAs: direct links for one-time support and monthly support with equal visual weight.
- Trust/privacy note: payments are processed by Ko-fi through PayPal/Stripe; supporters may share name/email and payment-provider information.

Native campaign copy:

```text
Help Keep That Covid Life Running & Growing

That Covid Life is an independent, ad-free platform curating COVID news, research, product reviews, and resources for the COVID-conscious community. Your support helps cover hosting costs and the continued development of the site and its free mobile app. Every donation makes a difference. Thank you.
```

Recommended route:

- `/donate`

Recommended links:

- One-time support: `https://ko-fi.com/thatcovidlife`
- Monthly support: `https://ko-fi.com/thatcovidlife/tiers`

## Embed Options

### Option A: Official Tip Panel Code

Use Ko-fi's logged-in Widgets page, choose **Tip Panel**, preview it, and copy the generated embed code. This is the official integration path and should be treated as the source of truth.

Implementation in Nuxt:

- Wrap script-driven embed code in `<ClientOnly>`.
- Prefer a small client-only component such as `components/TclKofiTipPanel.client.vue` if the generated code needs direct DOM/script access.
- Include a normal external Ko-fi link below the panel for browsers/extensions that block third-party embeds.

### Option B: Direct Iframe Embed

Ko-fi's current overlay widget script constructs an iframe URL in this form:

```text
https://ko-fi.com/{pageId}/?hidefeed=true&widget=true&embed=true
```

For That Covid Life, that would be:

```text
https://ko-fi.com/thatcovidlife/?hidefeed=true&widget=true&embed=true
```

This is simpler than injecting the overlay script, but it should only be used after confirming the generated Tip Panel code still matches this pattern in the Ko-fi account. If Ko-fi changes the widget contract, the generated code should win.

Example Vue shape:

```vue
<template>
  <iframe
    src="https://ko-fi.com/thatcovidlife/?hidefeed=true&widget=true&embed=true"
    title="Support That Covid Life on Ko-fi"
    class="h-[712px] w-full border-0"
    loading="lazy"
  />
</template>
```

### Option C: Native Buttons Only

Create a fully native donate page with styled TCL buttons that link to Ko-fi. This avoids third-party scripts/iframes, is fastest, and is easiest to make accessible, but supporters leave the site to complete the payment.

This is the best fallback and the safest first implementation if the Ko-fi embed runs into CSP or third-party cookie issues.

## CSP and Security Notes

The current app only explicitly allows `storage.ko-fi.com` in `img-src`. The dedicated page should be tested with Nuxt Security enabled because the embed may need additional CSP sources.

Likely CSP allowances:

- `script-src`: `https://storage.ko-fi.com` if using Ko-fi's generated script.
- `style-src`: `https://storage.ko-fi.com` and possibly `https://fonts.googleapis.com` if the widget script loads Ko-fi CSS/fonts.
- `font-src`: `https://fonts.gstatic.com` if Google fonts are loaded by the widget.
- `frame-src` or `child-src`: `https://ko-fi.com` for the payment iframe.
- `img-src`: keep `https://storage.ko-fi.com`; add `https://ko-fi.com` if the iframe or generated code loads images outside the iframe context.

Do not add broad wildcard CSP entries unless testing proves they are required.

## Payment and UX Constraints

Payment methods:

- Ko-fi payments are made through the creator's connected PayPal and/or Stripe accounts.
- Available payment methods depend on settings, supporter location, currency, payment type, browser, and device.
- Ko-fi's general payment docs mention cards, PayPal, Apple Pay, Google Pay, Venmo, Cash App, and local methods where supported.
- Ko-fi's widget FAQ says Apple Pay/Google Pay are not currently possible in the widget. For that reason, keep a direct Ko-fi page link available; it may provide the fullest payment-method surface.

Fees:

- Ko-fi Free lists 0% Ko-fi service fee on one-off tips and 5% on shop, memberships, monthly payments, and commissions.
- Contributor mode applies a 5% Ko-fi fee to all payments, including one-time tips.
- PayPal/Stripe processor fees still apply.

Memberships:

- The widget can present memberships/monthly support, but official docs conflict on whether the external widget can default to memberships.
- Use `https://ko-fi.com/thatcovidlife/tiers` as the reliable monthly-support CTA.

Privacy:

- Ko-fi says creators see supporter display name and email.
- PayPal/Stripe may expose additional payment-provider details such as legal name, email, or partial address.
- If this app stores webhook data later, update privacy/legal copy accordingly.

## Future Webhook Integration

Webhooks are out of scope for the first `/donate` page implementation. Ko-fi's dashboard is enough for donation records right now.

Add webhooks later only if the app needs internal donation tracking, supporter acknowledgements, analytics, or campaign progress independent of Ko-fi's UI. If webhook payloads will be stored, update the app's privacy/legal pages before launch.

Ko-fi webhook behavior from docs:

- Webhooks are sent when a payment happens.
- Ko-fi sends an HTTP POST to a configured URL.
- The listener should return `200`; otherwise Ko-fi retries with the same `message_id`.
- Ko-fi provides test payments from the Webhooks page.
- The API is currently limited to payment events. It does not notify when a membership ends.

Possible Nuxt endpoint:

```text
server/api/kofi/webhook.post.ts
```

Webhook implementation notes:

- Store a Ko-fi verification token in runtime config, not in client env.
- Capture the real payload from Ko-fi's test tool before finalizing schema validation.
- Verify the token included in the payload.
- Make handling idempotent using Ko-fi's `message_id`.
- Return `200` quickly, then process any non-critical work asynchronously.
- Do not block the donate page launch on webhooks.

## Implementation Checklist

1. In Ko-fi, confirm `thatcovidlife` payment setup, preferred currency, and whether PayPal, Stripe, or both are enabled.
2. In Ko-fi, generate and preview the official **Tip Panel** embed code.
3. Add `pages/donate.vue`.
4. Add donate copy in all active locale files.
5. Add `/donate` to `composables/useFooterConfig.ts`.
6. Add `/donate` to `server/api/__sitemap__/urls.get.ts`.
7. Keep `plugins/kofi.client.ts` and the existing floating button behavior unchanged for now.
8. Keep existing floating-widget CSS in `assets/css/main.css` while the global widget remains active.
9. Update `nuxt.config.ts` CSP only as needed after testing the chosen embed.
10. Test desktop and mobile layout.
11. Test with browser console open for CSP/frame/script errors.
12. Test with content blockers disabled and enabled; verify the fallback Ko-fi links remain usable.
13. Do not implement webhooks in this phase.

## Resolved Questions

- Floating Ko-fi button: keep it as-is for now.
- Support emphasis: one-time tips and monthly memberships should be equally prominent.
- Ko-fi Goal: yes, mirror it on the website using the campaign copy above.
- Donation records: Ko-fi dashboard is enough.
- Webhooks: not part of this phase; update privacy/legal pages first if stored webhook payloads are added later.

## Sources

- Ko-fi Tip Widget: https://help.ko-fi.com/hc/en-us/articles/360018381678-Ko-fi-tip-widget
- Ko-fi API/Webhooks: https://help.ko-fi.com/hc/en-us/articles/360004162298-Does-Ko-fi-have-an-API-or-webhook
- Ko-fi Payment Methods: https://help.ko-fi.com/hc/en-us/articles/24482435253661-What-payment-methods-are-available-on-Ko-fi
- Ko-fi Fees: https://help.ko-fi.com/hc/en-us/articles/360002506494-Does-Ko-fi-take-a-fee
- Ko-fi Memberships: https://help.ko-fi.com/hc/en-us/articles/4402945994001-Ko-fi-Memberships-and-Membership-Tiers
- Ko-fi Goals: https://help.ko-fi.com/hc/en-us/articles/360004392158-Set-your-Ko-fi-Goal
- Supporter Payments FAQ: https://help.ko-fi.com/hc/en-us/articles/360013140633-Supporter-payments-FAQ
- Supporter Privacy: https://help.ko-fi.com/hc/en-us/articles/12284014348189-What-personal-information-is-shared-on-Ko-fi-as-supporter
