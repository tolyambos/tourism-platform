-- Add indexes for performance optimization

-- Site indexes
CREATE INDEX IF NOT EXISTS "Site_subdomain_status_idx" ON "Site"("subdomain", "status");
CREATE INDEX IF NOT EXISTS "Site_domain_status_idx" ON "Site"("domain", "status");
CREATE INDEX IF NOT EXISTS "Site_status_createdAt_idx" ON "Site"("status", "createdAt" DESC);

-- Page indexes
CREATE INDEX IF NOT EXISTS "Page_siteId_status_idx" ON "Page"("siteId", "status");
CREATE INDEX IF NOT EXISTS "Page_siteId_slug_status_idx" ON "Page"("siteId", "slug", "status");
CREATE INDEX IF NOT EXISTS "Page_type_status_idx" ON "Page"("type", "status");

-- Section indexes
CREATE INDEX IF NOT EXISTS "Section_pageId_order_idx" ON "Section"("pageId", "order");
CREATE INDEX IF NOT EXISTS "Section_pageId_isActive_idx" ON "Section"("pageId", "isActive");

-- SectionContent indexes
CREATE INDEX IF NOT EXISTS "SectionContent_sectionId_language_idx" ON "SectionContent"("sectionId", "language");
CREATE INDEX IF NOT EXISTS "SectionContent_generatedAt_idx" ON "SectionContent"("generatedAt" DESC);

-- Deployment indexes
CREATE INDEX IF NOT EXISTS "Deployment_siteId_status_idx" ON "Deployment"("siteId", "status");
CREATE INDEX IF NOT EXISTS "Deployment_siteId_createdAt_idx" ON "Deployment"("siteId", "createdAt" DESC);

-- WebhookEvent indexes
CREATE INDEX IF NOT EXISTS "WebhookEvent_siteId_createdAt_idx" ON "WebhookEvent"("siteId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "WebhookEvent_type_status_idx" ON "WebhookEvent"("type", "status");

-- Template indexes
CREATE INDEX IF NOT EXISTS "Template_type_isDefault_idx" ON "Template"("type", "isDefault");
CREATE INDEX IF NOT EXISTS "Template_type_defaultOrder_idx" ON "Template"("type", "defaultOrder");