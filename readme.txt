# Technical Task: Multi-Site Tourism Platform with AI Content Generation

## Project Overview

Build a multi-tenant tourism platform that allows creation and management of unlimited tourism websites (city-based or attraction-based) from a single admin panel. The system will use AI to generate all content, deploy sites automatically, and manage everything centrally.

## Architecture Overview

- **CMS Platform**: Railway-hosted admin panel and API
- **Websites**: Vercel-hosted Next.js sites
- **Content Generation**: Google Gemini 2.5 Pro
- **Database**: PostgreSQL with Prisma ORM

## Phase 1: Core Infrastructure Setup

### 1.1 Initialize CMS Platform

Create a new Next.js 14 project with the following structure:

```
tourism-platform/
├── apps/
│   ├── cms/                    # Admin panel (Railway)
│   └── website-template/       # Template for all sites (Vercel)
├── packages/
│   ├── database/              # Shared Prisma schema
│   ├── ui/                    # Shared components
│   └── types/                 # Shared TypeScript types
└── package.json               # Monorepo configuration
```

**Tasks:**
- [ ] Setup monorepo with pnpm workspaces
- [ ] Initialize Next.js 14 with App Router for CMS
- [ ] Initialize Next.js 14 with App Router for website template
- [ ] Setup TypeScript with strict mode
- [ ] Configure ESLint and Prettier

### 1.2 Database Setup

**Schema Creation:**

```prisma
// packages/database/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Site {
  id              String    @id @default(cuid())
  name            String
  domain          String    @unique
  subdomain       String    @unique
  type            SiteType
  status          Status    @default(DRAFT)
  languages       String[]  @default(["en"])
  defaultLanguage String    @default("en")
  theme           Json
  features        Json
  seoSettings     Json
  pages           Page[]
  deployments     Deployment[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Page {
  id              String    @id @default(cuid())
  siteId          String
  site            Site      @relation(fields: [siteId], references: [id], onDelete: Cascade)
  type            PageType
  slug            String
  status          Status    @default(DRAFT)
  sections        Section[]
  @@unique([siteId, slug])
}

model Section {
  id              String    @id @default(cuid())
  pageId          String
  page            Page      @relation(fields: [pageId], references: [id], onDelete: Cascade)
  templateId      String
  template        Template  @relation(fields: [templateId], references: [id])
  order           Int
  content         SectionContent[]
}

model SectionContent {
  id              String    @id @default(cuid())
  sectionId       String
  section         Section   @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  language        String
  data            Json
  imageUrls       String[]
  generatedBy     String
  generatedAt     DateTime
  @@unique([sectionId, language])
}

model Template {
  id              String    @id @default(cuid())
  name            String    @unique
  category        String
  schema          Json
  systemPrompt    String
  userPromptTemplate String
  componentName   String
  sections        Section[]
}

enum SiteType {
  CITY
  ATTRACTION
}

enum PageType {
  HOME
  CATEGORY
  ATTRACTION
  GUIDE
}

enum Status {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

**Tasks:**
- [ ] Setup Prisma with PostgreSQL
- [ ] Create initial migration
- [ ] Seed database with template data
- [ ] Create Prisma client package

### 1.3 Authentication Setup

Implement authentication for the CMS using NextAuth.js:

```typescript
// apps/cms/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Implement user verification
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  }
}
```

**Tasks:**
- [ ] Install and configure NextAuth.js
- [ ] Create login/register pages
- [ ] Implement session management
- [ ] Add middleware for protected routes

## Phase 2: AI Content Generation Engine

### 2.1 Gemini Integration

Create the content generation service:

```typescript
// packages/ai-engine/src/gemini-generator.ts
import { GoogleGenAI, Type } from '@google/genai';

export class GeminiContentGenerator {
  private ai: GoogleGenAI;
  
  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }
  
  async generateContent(
    template: Template,
    context: GenerationContext
  ): Promise<GeneratedContent> {
    const config = {
      thinkingConfig: { thinkingBudget: -1 },
      responseMimeType: 'application/json',
      responseSchema: template.schema,
      systemInstruction: [{
        text: template.systemPrompt
      }]
    };
    
    const prompt = this.buildPrompt(template.userPromptTemplate, context);
    
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-pro',
      config,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    return response.json();
  }
}
```

**Tasks:**
- [ ] Setup Gemini API integration
- [ ] Create content generation service
- [ ] Implement section-specific generators
- [ ] Add error handling and retries
- [ ] Create content validation

### 2.2 Section Templates

Create comprehensive section templates:

```typescript
// packages/database/seed/templates.ts
const templates = [
  {
    name: 'hero-banner',
    category: 'headers',
    componentName: 'HeroBanner',
    schema: {
      type: Type.OBJECT,
      required: ['headline', 'subheadline', 'ctaText'],
      properties: {
        headline: { type: Type.STRING },
        subheadline: { type: Type.STRING },
        ctaText: { type: Type.STRING },
        backgroundImagePrompt: { type: Type.STRING }
      }
    },
    systemPrompt: 'You are an expert travel content creator...',
    userPromptTemplate: 'Generate hero content for {siteName}...'
  },
  // Add more templates...
]
```

**Tasks:**
- [ ] Define 20+ section templates
- [ ] Create JSON schemas for each template
- [ ] Write optimized prompts
- [ ] Test content generation
- [ ] Create template documentation

### 2.3 Image Generation

Integrate Replicate for AI image generation:

```typescript
// packages/ai-engine/src/image-generator.ts
import Replicate from 'replicate';

export class ImageGenerator {
  private replicate: Replicate;
  
  async generateImage(prompt: string): Promise<string> {
    const output = await this.replicate.run(
      "black-forest-labs/flux-pro",
      { input: { prompt } }
    );
    
    return this.uploadToR2(output);
  }
}
```

**Tasks:**
- [ ] Setup Replicate API
- [ ] Create image generation service
- [ ] Implement Cloudflare R2 storage
- [ ] Add image optimization
- [ ] Create fallback system

## Phase 3: Admin Panel Development

### 3.1 Dashboard

Create the main dashboard:

```typescript
// apps/cms/app/dashboard/page.tsx
export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard title="Total Sites" value={sites.length} />
      <StatsCard title="Published" value={publishedCount} />
      <StatsCard title="Total Views" value={totalViews} />
      
      <RecentSites sites={recentSites} />
      <QuickActions />
    </div>
  );
}
```

**Tasks:**
- [ ] Create dashboard layout
- [ ] Implement stats components
- [ ] Add recent activity feed
- [ ] Create quick action buttons
- [ ] Add charts for analytics

### 3.2 Site Builder

Implement site creation workflow:

```typescript
// apps/cms/app/sites/create/page.tsx
export default function CreateSite() {
  const [step, setStep] = useState(1);
  
  return (
    <div className="max-w-4xl mx-auto">
      {step === 1 && <SiteTypeSelector onSelect={handleTypeSelect} />}
      {step === 2 && <SiteDetailsForm onSubmit={handleDetailsSubmit} />}
      {step === 3 && <ContentGeneration siteId={siteId} />}
      {step === 4 && <DeploymentStep siteId={siteId} />}
    </div>
  );
}
```

**Tasks:**
- [ ] Create multi-step site builder
- [ ] Implement AI prompt interface
- [ ] Add template selection
- [ ] Create progress indicators
- [ ] Add preview functionality

### 3.3 Content Editor

Build the visual content editor:

```typescript
// apps/cms/app/sites/[siteId]/editor/page.tsx
export default function ContentEditor({ params }) {
  return (
    <div className="flex h-screen">
      <Sidebar sections={sections} />
      <Canvas>
        {sections.map(section => (
          <SectionRenderer
            key={section.id}
            section={section}
            onEdit={handleEdit}
            onRegenerate={handleRegenerate}
          />
        ))}
      </Canvas>
      <Inspector section={selectedSection} />
    </div>
  );
}
```

**Tasks:**
- [ ] Create drag-drop interface
- [ ] Implement inline editing
- [ ] Add section management
- [ ] Create property inspector
- [ ] Add undo/redo functionality

### 3.4 Deployment Center

Create deployment management:

```typescript
// apps/cms/app/sites/[siteId]/deploy/page.tsx
export default function DeploymentCenter({ params }) {
  return (
    <div className="space-y-6">
      <DeploymentStatus current={currentDeployment} />
      <DeploymentActions onDeploy={handleDeploy} />
      <DeploymentHistory deployments={deployments} />
      <DomainSettings site={site} />
    </div>
  );
}
```

**Tasks:**
- [ ] Create deployment interface
- [ ] Add Vercel API integration
- [ ] Implement deployment status
- [ ] Add rollback functionality
- [ ] Create domain management

## Phase 4: Website Template Development

### 4.1 Dynamic Routing

Setup dynamic site rendering:

```typescript
// apps/website-template/app/[locale]/layout.tsx
export default async function LocaleLayout({ 
  children, 
  params: { locale } 
}) {
  const siteConfig = await getSiteConfig();
  
  return (
    <html lang={locale}>
      <body>
        <ThemeProvider theme={siteConfig.theme}>
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Tasks:**
- [ ] Implement multi-language routing
- [ ] Create dynamic page generation
- [ ] Add ISR configuration
- [ ] Setup API routes
- [ ] Create middleware for domains

### 4.2 Section Components

Build all section components:

```typescript
// apps/website-template/components/sections/HeroBanner.tsx
export function HeroBanner({ content, settings }) {
  return (
    <section className={cn("relative h-screen", settings.className)}>
      <Image
        src={content.backgroundImage}
        alt=""
        fill
        className="object-cover"
      />
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold">{content.headline}</h1>
          <p className="text-2xl mt-4">{content.subheadline}</p>
          <Button size="lg" className="mt-8">
            {content.ctaText}
          </Button>
        </div>
      </div>
    </section>
  );
}
```

**Tasks:**
- [ ] Create 20+ section components
- [ ] Implement responsive design
- [ ] Add animations/interactions
- [ ] Create component variants
- [ ] Build component documentation

### 4.3 SEO Implementation

Add comprehensive SEO:

```typescript
// apps/website-template/app/[locale]/[...slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const page = await getPage(params.slug);
  
  return {
    title: page.seo.title,
    description: page.seo.description,
    openGraph: {
      images: [page.seo.ogImage],
    },
    alternates: {
      languages: generateAlternates(page),
    },
  };
}
```

**Tasks:**
- [ ] Implement dynamic metadata
- [ ] Add structured data
- [ ] Create XML sitemaps
- [ ] Add robots.txt generation
- [ ] Implement canonical URLs

## Phase 5: Integration & Deployment

### 5.1 API Development

Create API endpoints:

```typescript
// apps/cms/app/api/sites/route.ts
export async function POST(request: Request) {
  const data = await request.json();
  
  // Create site
  const site = await createSite(data);
  
  // Generate content
  await generateSiteContent(site.id);
  
  // Deploy to Vercel
  await deployToVercel(site);
  
  return Response.json(site);
}
```

**Tasks:**
- [ ] Create CRUD APIs for all models
- [ ] Add authentication middleware
- [ ] Implement rate limiting
- [ ] Add webhook endpoints
- [ ] Create API documentation

### 5.2 Background Jobs

Setup job queues:

```typescript
// apps/cms/lib/queues/content-generation.ts
export const contentQueue = new Queue('content-generation', {
  connection: redis,
});

contentQueue.add('generate-section', {
  siteId,
  sectionId,
  templateId,
  language,
});
```

**Tasks:**
- [ ] Setup BullMQ with Redis
- [ ] Create job processors
- [ ] Add job monitoring
- [ ] Implement retry logic
- [ ] Create job dashboard

### 5.3 Deployment Configuration

Configure Railway and Vercel:

```yaml
# railway.toml
[build]
builder = "nixpacks"
buildCommand = "pnpm install && pnpm build:cms"

[deploy]
startCommand = "pnpm start:cms"

# vercel.json (website-template)
{
  "functions": {
    "app/api/revalidate/route.ts": {
      "maxDuration": 10
    }
  }
}
```

**Tasks:**
- [ ] Setup Railway project
- [ ] Configure Vercel deployment
- [ ] Setup environment variables
- [ ] Create CI/CD pipeline
- [ ] Add monitoring

## Phase 6: Testing & Optimization

### 6.1 Testing

Implement comprehensive testing:

**Tasks:**
- [ ] Unit tests for services
- [ ] Integration tests for API
- [ ] E2E tests with Playwright
- [ ] Performance testing
- [ ] Load testing

### 6.2 Performance Optimization

**Tasks:**
- [ ] Implement caching strategies
- [ ] Optimize database queries
- [ ] Add CDN configuration
- [ ] Implement lazy loading
- [ ] Optimize bundle size

### 6.3 Documentation

**Tasks:**
- [ ] Create user documentation
- [ ] Write API documentation
- [ ] Document deployment process
- [ ] Create component library
- [ ] Add code comments

## Success Criteria

- [ ] Can create a new site in under 2 minutes
- [ ] All content is SEO-optimized
- [ ] Sites load in under 2 seconds
- [ ] Support for 10+ languages
- [ ] 99.9% uptime
- [ ] Scalable to 1000+ sites

## Tech Stack Summary

**CMS (Railway):**
- Next.js 14, TypeScript, PostgreSQL, Prisma, Redis, BullMQ, tRPC, shadcn/ui

**Websites (Vercel):**
- Next.js 14, TypeScript, Tailwind CSS, next-intl

**AI Services:**
- Google Gemini 2.5 Pro, Replicate (Flux Pro)

**Infrastructure:**
- Railway, Vercel, Cloudflare, Sentry

Start with Phase 1 and progress sequentially. Each phase should be fully tested before moving to the next.