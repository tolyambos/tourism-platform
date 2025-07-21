# Tourism Platform - Multi-Site AI Content Generation

A comprehensive multi-tenant tourism platform that allows creation and management of unlimited tourism websites with AI-generated content using Google Gemini 2.5 Pro.

## 🚀 Features

- **Multi-tenant Architecture**: Create unlimited tourism websites from a single admin panel
- **AI Content Generation**: All content generated using Google Gemini 2.5 Pro
- **Multi-language Support**: Built-in internationalization for global reach
- **Automatic Deployment**: Deploy sites to Vercel with one click
- **SEO Optimized**: Built with best practices for search engine visibility
- **Responsive Design**: Mobile-first approach for all generated sites

## 📁 Project Structure

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

## 🛠️ Tech Stack

### CMS (Railway)
- Next.js 14 with App Router
- TypeScript
- PostgreSQL with Prisma ORM
- tRPC for type-safe APIs
- NextAuth.js for authentication
- shadcn/ui components

### Websites (Vercel)
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- next-intl for i18n
- Framer Motion for animations

### AI Services
- Google Gemini 2.5 Pro for content generation
- Replicate (Flux Pro) for image generation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL database
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/tourism-platform.git
cd tourism-platform
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Copy example env files
cp packages/database/.env.example packages/database/.env
cp apps/cms/.env.example apps/cms/.env

# Edit the .env files with your credentials
```

4. Set up the database:
```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed the database with templates
pnpm db:seed
```

5. Start development servers:
```bash
# Start all services
pnpm dev

# Or start individually
pnpm --filter cms dev         # CMS on http://localhost:3000
pnpm --filter website-template dev  # Website on http://localhost:3001
```

## 📝 Available Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all applications
- `pnpm lint` - Run ESLint across the monorepo
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm format` - Format code with Prettier
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with templates

## 🏗️ Architecture

### Database Schema
The platform uses a comprehensive schema including:
- **Sites**: Multi-tenant site management
- **Pages**: Dynamic page creation
- **Sections**: Modular content sections
- **Templates**: Reusable content templates
- **Deployments**: Vercel deployment tracking
- **Analytics**: Built-in analytics tracking

### Content Generation Flow
1. User creates a new site with basic information
2. AI generates content based on templates and context
3. Content is stored with multi-language support
4. Images are generated using AI and stored in cloud storage
5. Site is deployed to Vercel automatically

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.