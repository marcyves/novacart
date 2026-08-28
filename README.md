# NovaCart

Fictional EU electronics shop for the IPAG MSc course **WEB Tools** (`26M_ICT_559`).

Live (GitHub Pages): **https://marcyves.github.io/novacart/**

## Why HTML, not React

Students are project managers. They need real URLs (PDP, campaign landing, checkout), Lighthouse on two contrasting pages, and a cookie bar they can audit. A SPA build would hide that.

## Pages

| URL | Role |
|-----|------|
| `/` | Home — reasonably clean |
| `/catalog.html` | Three SKUs |
| `/products/pulse-buds.html` | PDP aligned with the GSC pack (`pulse-buds`) |
| `/c/paid-social.html` | **Deliberately bad** Paid Social landing (LCP, contrast, duplicate H1, no alt, extra scripts) |
| `/cart.html` · `/checkout.html` | `localStorage` cart, demo checkout (no payment) |
| `/legal/cookies.html` | Accept-only bar documented as a QA gap |

Analytics **numbers** for the case still come from the Moodle pack. The live site sends hits to instructor GA4 (`G-DFD5LG0TBV` via gtag). GTM can replace gtag later without changing the property.

## Local

Open `index.html` or serve the folder (`python3 -m http.server`). Relative links work on project Pages (`/novacart/`).

## License

Course material. Not a real store.
