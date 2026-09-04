# Ankit Kumar (@deblomperr)

```text
  _       _     _                                 
 _| |___ | |_  | |___ _____ ___ ___ ___ ___ ___   
| . | -_|| . | | | . |     | . | -_|  _|  _| -_|  
|___|___||___| |_|___|_|_|_|  _|___|_| |_| |___|  
                           |_|                    
Full-Stack Developer • Systems, Deployment Platforms & Self-Hosted Infra
Live: https://deblomper.dev • Work: https://github.com/nub-coders
```

I build and operate backend services, deployment engines, and self-hosted infrastructure under [nub-coders](https://github.com/nub-coders) since 2020. Most of my work lives where long-running processes talk to systems they don't control — the Docker daemon, SMTP peers, Telegram's calling layer, or upstreams that rewrite their signatures without notice.

---

# Live Services in Production

| Service | Endpoint | Stack | Operational Highlights |
| :--- | :--- | :--- | :--- |
| **Halvo** | [halvo.nubcoders.com](https://halvo.nubcoders.com) | TypeScript · Docker Engine API · React | Automated container builds, live WebSocket log streaming, orphaned resource sweeper |
| **NubMail** | [mails.nubcoders.com](https://mails.nubcoders.com) | Next.js · Postfix · Dovecot · Postgres | Self-hosted mail stack with REST API dispatch, DKIM signing, and SPF/DMARC verification |
| **Ytube API** | [api.nubcoders.com](https://api.nubcoders.com) | Python 3.13 · FastAPI · Deno · Redis | Media extraction API with embedded Deno runtime for signature evaluation & token-bucket rate limits |

---

# Featured Systems & Open Source Work

**Halvo — Container Provisioning & Deployment Platform**
- Talks to the Docker Engine API over the Unix socket with an automated sweeper reclaiming orphaned containers, images, and volumes.
- Streams live container events and build logs over WebSockets; features state-machine credit deduction to avoid billing on provisioning failure.

**NubDB — In-Memory Key-Value Store (Zig)**
- Socket-addressable in-memory KV engine written in Zig 0.13 with append-only persistence and background log compaction.
- Tested against a bespoke binary wire protocol with client SDKs implemented across seven languages.

**CppGram — Telegram Client Framework (C++20)**
- C++20 Telegram client framework over TDLib with Pyrogram-style API ergonomics.
- Features expression-based boolean filter algebra (`Filters::text() && !Filters::bot()`) and `Result<T>` error monads instead of runtime exceptions.

**Zipper — Supervised Archive Bot (Python)**
- Extracts multi-gigabyte archives over Telegram under active byte-and-entry budgets over the 7z child process to stop decompression bombs.
- Re-verifies all output paths with `lstat` and `realpath` to prevent symlink traversal attacks.

**Nub Music Bot — Low-Latency Voice Chat Streaming (Python)**
- Streams HD media into Telegram group voice chats from an assistant worker pool.
- Incorporates address-level SSRF defenses (`url_guard.py`) resolving IP targets to block loopback, link-local, and cloud metadata queries.

---

# Engineering Practices

- **Operate what you build:** Real operational feedback (container leaks, SMTP deliverability, upstream API changes) drives reliable design far better than local mocks.
- **Strict boundary validation:** Defend against real attack surfaces: resolve IP addresses to block SSRF before making outbound requests, enforce live byte budgets during archive extraction, and verify DNS records (SPF, DKIM) before sending mail.
- **Automate rules where code runs:** If an error is easy to introduce and silent at runtime — like un-awaited async MongoDB queries — enforce it with AST checks in CI.
- **Understand the layer beneath:** Building a key-value store in Zig or TDLib bindings in C++20 is about knowing how allocators, hash tables, and event loops behave when high-level abstractions fail.

---

# Technical Stack

- **Languages:** TypeScript, Python 3.13, Zig 0.13, C++20, Go, Rust
- **Runtime & Infrastructure:** Docker, Docker Compose, Traefik, Kubernetes, Postfix, Dovecot, nginx
- **Databases & Stores:** PostgreSQL, MongoDB, Redis, Prisma
- **Interfaces & Frameworks:** React 19, Next.js 16, Tailwind CSS, FastAPI, Express, Pyrogram, TDLib

---

# Connect & Verify

- **Portfolio:** [deblomper.dev](https://deblomper.dev)
- **Work Account:** [github.com/nub-coders](https://github.com/nub-coders)
- **Direct Email:** [contact@deblomper.dev](mailto:contact@deblomper.dev) · [contact@nubcoder.dev](mailto:contact@nubcoder.dev)
- **Telegram:** [@nub_coder_s](https://t.me/nub_coder_s)
