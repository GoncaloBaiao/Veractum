# Veractum

**See clearly. Think freely.**

An AI-powered web application that analyses YouTube videos — extracting structured summaries, identifying factual claims, and fact-checking each one with confidence scores and source references.

---

## Features

- **Instant Summary** — Get key points and a structured overview of any video in seconds
- **Claim Extraction** — AI identifies every factual statement, opinion, and prediction
- **Source-backed Fact-checking** — Each claim is verified against real web sources with confidence scoring
- **Visual Timeline** — Colour-coded topic segments show what was discussed and when
- **Analysis History** — Save and revisit past analyses (requires sign-in)
- **Beautiful UI** — Dark theme with amber/gold accents, Geist typography, smooth Framer Motion animations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, TypeScript strict) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js v5 (Google + GitHub) |
| AI | OpenAI GPT-4o (summary, claims, fact-check) |
| Web Search | Tavily API (evidence gathering) |
| Fonts | Geist Sans + Geist Mono |
| Animations | Framer Motion |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- API keys (see Environment Variables below)

### Installation

```bash
# Clone the repository
git clone https://github.com/GoncaloBaiao/veractum.git
cd veractum

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# → Fill in your API keys (see below)

# Set up the database
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Session encryption secret (generate with `openssl rand -base64 32`) | Yes |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) | Yes |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key | Yes |
| `OPENAI_API_KEY` | OpenAI API key (GPT-4o access required) | Yes |
| `TAVILY_API_KEY` | Tavily web search API key (for fact-checking evidence) | Recommended |
| `NEXT_PUBLIC_GA_ID` | Google Analytics Measurement ID | No |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | For Google sign-in |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | For Google sign-in |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID | For GitHub sign-in |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret | For GitHub sign-in |

---

## Architecture

```
src/
├── app/                   # Next.js App Router pages & API routes
│   ├── page.tsx           # Landing page with hero, features, demo preview
│   ├── analysis/[id]/     # Dynamic analysis result page
│   ├── history/           # Past analyses (auth required)
│   ├── pricing/           # Pricing tiers
│   └── api/               # REST API endpoints
│       ├── analyze/       # Main analysis pipeline
│       ├── transcript/    # Transcript fetcher
│       └── factcheck/     # Standalone fact-check endpoint
├── components/            # Reusable UI components
├── lib/                   # Core business logic
│   ├── youtube.ts         # YouTube Data API v3 client
│   ├── transcription.ts   # Caption extraction
│   ├── ai.ts              # OpenAI GPT-4o integration
│   ├── factcheck.ts       # Claim verification with web search
│   ├── prisma.ts          # Database client singleton
│   └── utils.ts           # Helpers, constants, config
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript type definitions
```

### Analysis Pipeline

1. **URL Validation** — Extract YouTube video ID from URL
2. **Metadata Fetch** — Get title, channel, duration, thumbnail via YouTube API
3. **Transcript Extraction** — Fetch captions (auto-generated or manual)
4. **Summary Generation** — GPT-4o produces structured summary with key points and topic segments
5. **Claim Extraction** — GPT-4o identifies up to 15 verifiable claims
6. **Fact-checking** — Each claim is assessed using GPT-4o + Tavily web search evidence
7. **Results** — Everything saved to database, rendered as interactive report

---

## Roadmap

### Phase 1: Web MVP (Current)
- [x] Landing page with demo preview
- [x] YouTube video analysis pipeline
- [x] AI summary + claim extraction
- [x] Fact-checking with confidence scores
- [x] Visual topic timeline
- [x] Analysis history
- [x] Pricing page
- [ ] NextAuth.js authentication integration
- [ ] Usage quota enforcement
- [ ] Stripe payment integration

### Phase 2: Enhancements
- [ ] Chrome extension — analyse while watching
- [ ] Batch analysis — analyse playlists
- [ ] Comparative analysis — compare claims across videos
- [ ] Public API with API key auth
- [ ] Multi-language transcript support
- [ ] Whisper fallback for videos without captions

---

## Etymology

**Veractum** — from Latin *verus* (true) + *factum* (deed, thing done). Literally: *"the truth of what was done"* — what was truthfully said and shown. The name embodies the mission: to illuminate what is true in what we watch and hear.

*See clearly. Think freely.*

---

## License

MIT
