import { test, expect } from '@playwright/test';

test.describe('Website Rendering', () => {
  test('should render site with correct content', async ({ page }) => {
    // Visit Rome site
    await page.goto('http://localhost:3001/en?subdomain=rome');
    
    // Check hero section
    await expect(page.locator('h1')).toContainText(/Rome/);
    await expect(page.locator('section').first()).toHaveClass(/hero/);
    
    // Check attractions grid
    await expect(page.locator('[data-section="attractions"]')).toBeVisible();
    await expect(page.locator('.attraction-card')).toHaveCount(8);
    
    // Check content features
    await expect(page.locator('[data-section="features"]')).toBeVisible();
    
    // Check testimonials
    await expect(page.locator('[data-section="testimonials"]')).toBeVisible();
  });

  test('should support multiple languages', async ({ page }) => {
    // Visit English version
    await page.goto('http://localhost:3001/en?subdomain=rome');
    await expect(page.locator('h1')).toContainText(/Rome/);
    
    // Switch to Spanish
    await page.goto('http://localhost:3001/es?subdomain=rome');
    await expect(page.locator('h1')).toContainText(/Roma/);
    
    // Switch to Italian
    await page.goto('http://localhost:3001/it?subdomain=rome');
    await expect(page.locator('h1')).toContainText(/Roma/);
  });

  test('should be mobile responsive', async ({ page, viewport }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3001/en?subdomain=rome');
    
    // Check mobile menu
    await expect(page.locator('[data-mobile-menu]')).toBeVisible();
    
    // Check responsive grid
    const attractionCards = page.locator('.attraction-card');
    const firstCard = attractionCards.first();
    const box = await firstCard.boundingBox();
    
    // Cards should be full width on mobile
    expect(box?.width).toBeGreaterThan(350);
  });

  test('should load images properly', async ({ page }) => {
    await page.goto('http://localhost:3001/en?subdomain=rome');
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Check hero image
    const heroImage = page.locator('section.hero img');
    await expect(heroImage).toBeVisible();
    await expect(heroImage).toHaveAttribute('alt', /Rome/);
    
    // Check that images are optimized (Next.js Image)
    await expect(heroImage).toHaveAttribute('srcset');
  });

  test('should handle 404 for non-existent sites', async ({ page }) => {
    const response = await page.goto('http://localhost:3001/en?subdomain=non-existent-site');
    
    expect(response?.status()).toBe(404);
    await expect(page).toHaveText(/Page not found/);
  });

  test('should have proper SEO metadata', async ({ page }) => {
    await page.goto('http://localhost:3001/en?subdomain=rome');
    
    // Check title
    await expect(page).toHaveTitle(/Rome/);
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Rome/);
    
    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Rome/);
    
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content');
  });
});