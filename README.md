# RAWI | راوي

RAWI is a UAE-born media delivery platform concept for photographers, videographers, content creators and agencies.

## What is included

- Premium yellow / white / charcoal brand direction
- Responsive public landing page
- Pricing
- Creator dashboard demo
- Projects view
- New project flow
- Gallery builder prototype
- Client gallery preview
- Analytics screen
- Branding settings
- English / Arabic RTL toggle
- Mobile responsive layout

## Run locally

This prototype has no build step.

Open `index.html` directly in a browser, or use any simple static server:

```bash
python -m http.server 8080
```

Then open http://localhost:8080

## Deploy

### GitHub Pages
Push these files to a GitHub repository and enable Pages from the repository settings.

### Vercel
Import the repository into Vercel and deploy it as a static site.

## Next production phase

The prototype is intentionally front-end only. Production services should be added in this order:

1. Supabase Auth + PostgreSQL
2. Cloudflare R2 resumable object uploads
3. Mux or Cloudflare Stream video processing
4. Gallery permissions / passwords / expiry
5. Stripe subscriptions
6. Email notifications
7. WhatsApp share flow
8. Client favorites / approvals
9. Custom domains
10. Arabic localization content
