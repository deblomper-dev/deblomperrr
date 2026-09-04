import type { Project } from "./types";

/**
 * Curated from an audit of github.com/nub-coders on 2026-09-04. Every fact here
 * — language, visibility, creation date, live URL — was read off the repository
 * or the running service. Nothing is estimated.
 */
export const projects: Project[] = [
  {
    slug: "halvo",
    name: "Halvo",
    kind: "Deployment platform",
    lang: "TypeScript",
    since: "2025-03",
    source: "private",
    summary:
      "Connect a GitHub repository and Halvo detects or generates a Dockerfile, builds the image, and streams the build log over a WebSocket while the container comes up.",
    tags: ["TypeScript", "Docker Engine API", "Express", "React", "PostgreSQL", "Redis"],
    liveUrl: "https://halvo.nubcoders.com",
    featured: true,
    architecture: [
      {
        label: "Deployment engine",
        detail:
          "Talks to the Docker Engine API through dockerode over the unix socket, with a CLI fallback path and a sweeper that reclaims orphaned containers, images and volumes.",
      },
      {
        label: "Live operations",
        detail:
          "Build and runtime logs stream over ws; the Docker events stream drives per-container CPU and memory readouts without polling.",
      },
      {
        label: "Dockerfile fallback",
        detail:
          "When a repository ships no container spec, a Gemini call generates one from the detected runtime and lockfiles rather than failing the deploy.",
      },
      {
        label: "CLI companion",
        detail:
          "@nub-coders/halvo wraps build, push, deploy, logs and rollback in a Commander.js + Inquirer interface for people who never open the dashboard.",
      },
      {
        label: "Auth and metering",
        detail:
          "Four sign-in paths — Telegram initData, Google OAuth, GitHub App/OAuth, email OTP — over a state-machine credit ledger backed by Stripe and Razorpay.",
      },
    ],
    body: [
      "Halvo is the largest thing here by some distance, and the one that taught me the most about the gap between a deploy that works and a deploy that keeps working. It takes a Git reference or a prebuilt image and puts a running, addressable container behind it.",
      "The frontend is React 18; the backend is Express on TypeScript. Neither is interesting on its own. What matters is the layer underneath: a Docker Engine API client that has to stay correct when a build fails halfway, when a user closes the tab mid-stream, or when a previous deploy left resources behind. Orphan reclamation and a CLI fallback for the socket exist because both of those happened.",
      "Credit deduction is modelled as a state machine rather than a counter, so a container that dies during provisioning does not silently bill. That decision came out of a bug, not a design doc.",
    ],
  },
  {
    slug: "nubmail",
    name: "NubMail",
    kind: "Mail infrastructure",
    lang: "TypeScript",
    since: "2025-10",
    source: "private",
    summary:
      "A self-hosted mail stack — Postfix out, Dovecot for IMAP and POP3, a hand-written SMTP receiver in — with a dashboard for domains, mailboxes and API sending.",
    tags: ["Next.js", "React 19", "PostgreSQL", "Postfix", "Dovecot", "Docker"],
    liveUrl: "https://mails.nubcoders.com",
    featured: true,
    architecture: [
      {
        label: "Inbound",
        detail:
          "A Node SMTP receiver on the ingress port parses RFC 5322 messages directly instead of handing off to a local delivery agent.",
      },
      {
        label: "Outbound",
        detail:
          "Postfix relay with DKIM signing, plus tooling to check that a domain's SPF and DMARC records actually resolve before mail starts flowing.",
      },
      {
        label: "Client access",
        detail:
          "Dovecot serves standard IMAP and POP3, so existing mail clients sync without a bespoke protocol.",
      },
      {
        label: "Durability",
        detail:
          "PostgreSQL for mailboxes and metadata, with nightly encrypted snapshots pushed off-box to B2 or R2 via rclone.",
      },
    ],
    body: [
      "NubMail exists because transactional email vendors are a recurring tax on small projects, and because I wanted to know what is actually involved. The answer is: more than the pricing pages suggest, and less than the folklore.",
      "The dashboard is Next.js and React 19 — configure DNS records, create mailboxes, delegate access to a team, send programmatically over REST. Behind it, Postfix handles delivery and DKIM signing, Dovecot handles client sync, and a small Node receiver handles ingress so I control parsing and storage rather than shelling out to a delivery agent.",
      "Deliverability is the whole game, so the SPF, DKIM and DMARC verification tooling is not a nicety — it is the difference between working software and a spam folder.",
    ],
  },
  {
    slug: "ytube-api",
    name: "Ytube API",
    kind: "Media extraction service",
    lang: "Python",
    since: "2025-08",
    source: "public",
    summary:
      "An async FastAPI service for YouTube search, metadata and stream resolution that runs an embedded Deno runtime to evaluate signature challenges, with Redis token buckets in front.",
    tags: ["Python 3.13", "FastAPI", "Redis", "Deno", "yt-dlp", "Docker"],
    liveUrl: "https://api.nubcoders.com",
    codeUrl: "https://github.com/nub-coders/ytube_api",
    featured: true,
    architecture: [
      {
        label: "Signature resolution",
        detail:
          "An embedded Deno runtime evaluates YouTube's EJS challenges at request time, which is the part that breaks when you try to reimplement it in Python.",
      },
      {
        label: "Rate limiting",
        detail:
          "Redis-backed token buckets enforce per-token daily extraction caps, so one client cannot exhaust the upstream budget for everyone.",
      },
      {
        label: "Control surface",
        detail:
          "A Telegram admin bot issues tokens, adjusts limits and tails logs — no separate admin frontend to maintain.",
      },
      {
        label: "Deployment",
        detail: "Docker Compose stack behind Traefik, running on the same box as the rest of the services.",
      },
    ],
    body: [
      "Ytube API resolves search queries, metadata, playlists and direct stream URLs without an upstream API key. It runs at api.nubcoders.com and is public source.",
      "The interesting constraint is that YouTube's player signature logic is JavaScript that changes without notice. Rather than chase it in Python, the service ships a Deno runtime and evaluates the real thing. That is more moving parts in the container and far fewer at three in the morning.",
      "In front of that sits Redis, doing double duty as a metadata cache and a token-bucket limiter keyed per API token.",
    ],
  },
  {
    slug: "nub-music-bot",
    name: "Nub Music Bot",
    kind: "Telegram streaming engine",
    lang: "Python",
    since: "2025-04",
    source: "public",
    summary:
      "Streams HD audio and video into Telegram group voice chats from a pool of assistant clients, with address-level SSRF checks on every remote URL and a sweeper for idle calls.",
    tags: ["Python 3.13", "Pyrogram", "PyTgCalls", "MongoDB", "asyncio", "yt-dlp"],
    codeUrl: "https://github.com/nub-coders/nub-music-bot",
    featured: true,
    architecture: [
      {
        label: "Assistant pool",
        detail:
          "Up to five string-session PyTgCalls workers are managed dynamically, so concurrent calls do not queue behind a single client.",
      },
      {
        label: "SSRF guard",
        detail:
          "url_guard.py resolves each host and rejects link-local, loopback and cloud metadata addresses before anything is fetched — validation at the address, not the string.",
      },
      {
        label: "Idle sweeper",
        detail:
          "A background worker evicts inactive voice chats, which is what keeps the assistants under Telegram's 500-group ceiling.",
      },
      {
        label: "Provider seam",
        detail:
          "Spotify tracks and playlists fall back to YouTube search behind one interface, flattening up to 50 items per request.",
      },
    ],
    body: [
      "A Telegram bot that joins a group voice chat and streams audio or video into it. Simple to describe, unpleasant to make reliable: Telegram's calling layer is stateful, the media sources are hostile, and users will paste anything into a /play command.",
      "The defensive work is the part I would point at. url_guard.py resolves hostnames and checks the resulting addresses against private and metadata ranges before a fetch happens, because blocklisting URL strings is not the same as refusing to talk to 169.254.169.254. The idle sweeper exists because Telegram caps how many groups an account can sit in, and an assistant that never leaves eventually cannot join.",
      "Unit and integration tests run on GitHub Actions, including cases that assert the guard rejects what it should.",
    ],
  },
  {
    slug: "nubdb",
    name: "NubDB",
    kind: "In-memory database",
    lang: "Zig",
    since: "2026-01",
    source: "public",
    summary:
      "An in-memory key-value store written in Zig with append-only persistence and background compaction, plus client libraries across seven languages and a web console.",
    tags: ["Zig", "TypeScript", "Go", "Rust", "Python", "Kubernetes"],
    codeUrl: "https://github.com/nub-coders/nubdt",
    architecture: [
      {
        label: "Engine",
        detail:
          "A hand-written hash table behind an RwLock, with atomic operation counters and per-key TTL expiry.",
      },
      {
        label: "Persistence",
        detail: "Append-only log writer with asynchronous compaction, so restart replays a bounded file.",
      },
      {
        label: "Clients",
        detail:
          "Published SDKs for Python, Rust, Go, Java, Ruby and Node against one wire protocol — the useful test of whether that protocol is actually simple.",
      },
      {
        label: "Operations",
        detail: "Next.js and Prisma console for provisioning and monitoring, with Kubernetes manifests for deployment.",
      },
    ],
    body: [
      "NubDB is a socket-addressable in-memory key-value engine in Zig 0.13 — SET, GET, DEL, EXISTS, INCR, DECR, SIZE, CLEAR, with optional TTLs. It is not trying to replace Redis. It is the project where I stopped treating a data store as a black box.",
      "Writing the hash table, the lock discipline and the append-only log by hand made the tradeoffs concrete in a way that reading about them did not. Compaction runs in the background because an append-only log that only grows is a restart-time problem waiting to happen.",
      "Six client libraries exist mostly as a forcing function: a wire protocol that is genuinely simple is one you can reimplement in an afternoon in a language you do not use much.",
    ],
  },
  {
    slug: "zipper",
    name: "Zipper",
    kind: "Archive bot",
    lang: "Python",
    since: "2024-01",
    source: "public",
    summary:
      "Extracts, inspects and repacks multi-gigabyte archives over Telegram while holding an active byte-and-time budget over the 7z child process to stop decompression bombs.",
    tags: ["Python 3.13", "Pyrogram", "MongoDB", "p7zip", "asyncio"],
    codeUrl: "https://github.com/nub-coders/zipper",
    architecture: [
      {
        label: "Active bomb budget",
        detail:
          "The 7z child is watched while it runs and killed the moment output bytes or entry counts cross the bound — a limit that holds even when the header lies about its size.",
      },
      {
        label: "Path safety",
        detail:
          "Every extracted target is re-checked with lstat and realpath, so a symlink cannot walk the write out of the working directory.",
      },
      {
        label: "Upload debouncer",
        detail: "Bursts of files collapse into one status card refreshed on a one-second debounce instead of a message per item.",
      },
      {
        label: "No-database mode",
        detail: "memory_db.py mirrors the PyMongo surface so the bot runs with zero external dependencies.",
      },
    ],
    body: [
      "Zipper takes an archive over Telegram and gives back its contents, or the reverse. The whole design question is what happens when the archive is malicious.",
      "Checking the declared size before extracting is not enough — headers lie. So the extraction is supervised: the 7z child process runs under a live byte and entry budget and is killed the instant it crosses it. Extracted paths are re-resolved with lstat and realpath before anything is written, because an archive containing a symlink to /etc is a legal archive.",
      "The rest is throughput work: chunked streaming for multi-gigabyte files, and a debouncer so a fifty-file drop produces one status card rather than fifty.",
    ],
  },
  {
    slug: "userbot-deployer",
    name: "Userbot Deployer",
    kind: "Multi-tenant orchestrator",
    lang: "Python",
    since: "2024-04",
    source: "private",
    summary:
      "Runs many Pyrogram user clients concurrently in one process from sessions in MongoDB, with a dependency-free AST checker that fails CI on un-awaited async database calls.",
    tags: ["Python 3.13", "Pyrogram", "MongoDB", "OpenCV", "asyncio"],
    architecture: [
      {
        label: "In-process concurrency",
        detail:
          "A manager provisions and runs individual user clients in one event loop from session strings held in MongoDB.",
      },
      {
        label: "Static policy check",
        detail:
          "check_await.py walks the AST and fails CI on un-awaited AsyncMongoClient calls — the class of bug that passes review and silently drops writes.",
      },
      {
        label: "Payments",
        detail: "Razorpay UPI QR flow with OpenCV-side QR decoding, alongside Telegram Stars.",
      },
    ],
    body: [
      "A manager that provisions, updates and runs client userbots on demand. Source is private; the part worth describing is the tooling around it.",
      "Forgetting await on an async Mongo call is invisible: nothing raises, nothing logs, the write just never lands. So check_await.py walks the syntax tree in CI and fails the build on it. No dependency, roughly a screen of code, and it has caught the bug more than once.",
      "That is the pattern I keep returning to — when a mistake is cheap to make and expensive to find, encode the rule where it runs automatically instead of trusting review.",
    ],
  },
  {
    slug: "cppgram",
    name: "CppGram",
    kind: "Client framework",
    lang: "C++",
    since: "2026-05",
    source: "public",
    summary:
      "A C++20 Telegram client framework over TDLib with a Pyrogram-shaped API, composable boolean filters and Result-typed error handling.",
    tags: ["C++20", "TDLib", "CMake", "OpenSSL"],
    codeUrl: "https://github.com/nub-coders/CppGram",
    architecture: [
      {
        label: "Filter algebra",
        detail:
          "Operator overloads make handler conditions read as expressions: Filters::text() && Filters::privateChat() && !Filters::bot().",
      },
      {
        label: "Native core",
        detail:
          "Hand-written TDLib object mapping with Result<T> error returns instead of exceptions, wired up through CMake.",
      },
    ],
    body: [
      "CppGram wraps TDLib 1.8.0 in an API shaped like Pyrogram's, because the ergonomics of the Python client are the reason people tolerate writing Telegram bots at all.",
      "The filter algebra is the piece I like: overloaded && , || and ! compose handler predicates into something that reads as a sentence, with no runtime cost over hand-written conditionals. Errors come back as Result<T> rather than exceptions, which suits a library that will be embedded in other people's event loops.",
    ],
  },
  {
    slug: "magisk-flasher",
    name: "Magisk Flasher V2",
    kind: "Android tool",
    lang: "Python",
    since: "2024-08",
    source: "public",
    summary:
      "Patches a stock boot.img with any Magisk channel, fetching Official, Delta and Canary builds live from the GitHub release API rather than bundling APKs.",
    tags: ["Python 3.12", "Pyrogram", "magiskboot", "Docker"],
    codeUrl: "https://github.com/nub-coders/MAGISK-FLASHER-V2",
    architecture: [
      {
        label: "Live release resolution",
        detail:
          "Queries the GitHub release API for Official, Delta and Canary builds at runtime, so the tool does not go stale and ship an old APK.",
      },
      {
        label: "Isolated patching",
        detail:
          "Pulls boot_patch.sh and libmagiskboot.so into a temporary working directory per job, with strict cleanup afterwards.",
      },
    ],
    body: [
      "A patcher for stock Android boot images, usable as a CLI or through Telegram. The oldest thing on this list and the most narrowly useful.",
      "It resolves Magisk builds from the GitHub release API at runtime instead of vendoring an APK, which is why it still works two years on. Each job gets its own temporary directory and is cleaned up on exit — the alternative, patching in place, is how people end up with an unbootable phone.",
    ],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
