# Ankit Kumar — Personal Portfolio (`deblomper.dev`)

Personal engineering portfolio for Ankit Kumar ([@deblomperr](https://github.com/deblomperr)), full-stack developer building and operating backend systems, deployment platforms, and self-hosted infrastructure.

Live site: [deblomper.dev](https://deblomper.dev)

---

# Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Styling**: Tailwind CSS v4 + custom zinc design tokens (light & dark mode)
- **Email Gateway**: NubMail API (`https://mails.nubcoders.com/api/emails/send-api`)
- **Bot Defense**: Cloudflare Turnstile verification + honeypot bot trap
- **Rate Limiting**: Sliding window in-memory rate limiter (5 requests / 10 min per IP, LRU eviction, memory bound)
- **Infrastructure**: Docker multi-stage build, Docker Compose, Traefik reverse proxy with Let's Encrypt SSL

---

# Project Structure

```
.
├── app/
│   ├── api/contact/route.ts       # Contact form API endpoint with rate limiting & Turnstile
│   ├── components/                # Reusable UI components (SiteHeader, ContactForm, Turnstile, etc.)
│   ├── sections/                  # Portfolio sections (Hero, SelectedWork, Approach, About, Contact)
│   ├── work/                      # Case studies and deep dives (/work/[slug])
│   ├── globals.css                # Zinc theme design system, typography, animations
│   ├── layout.tsx                 # Root layout with metadata and OpenGraph
│   └── page.tsx                   # Main portfolio page with Schema.org Person JSON-LD
├── lib/
│   ├── data/                      # Structured site data (projects, principles, stack)
│   ├── rate-limiter.ts            # In-memory sliding-window IP rate limiter
│   └── turnstile.ts               # Cloudflare Turnstile token validation
├── docker-compose.yml             # Production container orchestrator with Traefik labels
└── Dockerfile                     # Multi-stage optimized Node.js container build
```

---

# Getting Started

**Prerequisites**
- Node.js 20+
- npm or Docker

**Local Development**

1. Clone repository:
   ```bash
   git clone https://github.com/deblomperr/deblomperr.git
   cd deblomperr
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```
   Fill in your `EMAIL_API_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, and `TURNSTILE_SECRET_KEY`.

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

5. Run test suite:
   ```bash
   npm test
   ```

---

# Production Deployment (Docker Compose)

The project includes an optimized standalone Dockerfile and Traefik integration:

```bash
docker compose up -d --build
```

---

# License

MIT
