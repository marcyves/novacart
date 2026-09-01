# NovaCart

Fictional EU electronics shop for the IPAG MSc course **WEB Tools** (`26M_ICT_559`).

Live (GitHub Pages): **https://marcyves.github.io/novacart/**

## Why HTML, not React

Students are project managers. They need real URLs (PDP, campaign landing, checkout), Lighthouse on two contrasting pages, and a cookie bar they can audit. A SPA build would hide that.

## Pages

| URL | Role |
|-----|------|
| `/` | Home — Pulse Buds hero, funnel into the PDP |
| `/catalog.html` | 12 SKUs (Audio / Charge / Home / Carry) |
| `/products/pulse-buds.html` | Canonical PDP (GSC pack) |
| `/products/volt-charger.html` · `nest-plug.html` · `loft-sleeve.html` | The other three teaching PDPs |
| `/products/p.html?sku=` | The remaining eight SKUs |
| `/c/paid-social.html` | **Deliberately bad** Paid Social landing (LCP, contrast, duplicate H1, no alt) |
| `/cart.html` · `/checkout.html` | `localStorage` cart, demo checkout (no payment) |
| `/legal/cookies.html` | Accept-only bar documented as a QA gap |

Funnel events: `view_item` → `add_to_cart` → `begin_checkout`. Analytics **numbers** for the case still come from the Moodle pack. Hits go to instructor GA4 (`G-DFD5LG0TBV`). GTM can replace gtag later.

## Local

```bash
python3 -m http.server
```

Relative links also work on project Pages (`/novacart/`).

## License

Course material. Not a real store.
