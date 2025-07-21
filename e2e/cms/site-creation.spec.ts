import { test, expect } from '@playwright/test';

test.describe('Site Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication by setting cookies or local storage
    // In a real app, you'd use a test user account
    await page.goto('/sign-in');
    // Simulate login
  });

  test('should create a new tourism site', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Click create site button
    await page.click('text=Create New Site');
    
    // Step 1: Choose site type
    await expect(page).toHaveURL('/sites/create');
    await page.click('[data-site-type="CITY"]');
    
    // Step 2: Site details
    await page.fill('input[name="name"]', 'Test Barcelona Tourism');
    await page.fill('input[name="subdomain"]', 'test-barcelona');
    
    // Select languages
    await page.click('button:has-text("Add Language")');
    await page.click('text=Spanish');
    await page.click('text=Catalan');
    
    // Add location context
    await page.fill(
      'textarea[name="locationContext"]',
      'Barcelona, Spain - Mediterranean coastal city known for Gaudí architecture, beaches, and vibrant culture'
    );
    
    await page.click('button:has-text("Next")');
    
    // Step 3: Content generation
    await expect(page).toHaveText(/Generating content/);
    
    // Wait for content generation (mocked in tests)
    await page.waitForSelector('[data-status="completed"]', { timeout: 30000 });
    
    // Step 4: Review and deploy
    await expect(page).toHaveText(/Review your site/);
    await page.click('button:has-text("Deploy Site")');
    
    // Verify success
    await expect(page).toHaveURL(/\/sites\/[^\/]+\/dashboard/);
    await expect(page).toHaveText(/Site deployed successfully/);
  });

  test('should validate subdomain uniqueness', async ({ page }) => {
    await page.goto('/sites/create');
    
    // Skip to site details
    await page.click('[data-site-type="CITY"]');
    
    // Try to use existing subdomain
    await page.fill('input[name="name"]', 'Another Rome Site');
    await page.fill('input[name="subdomain"]', 'rome'); // Assuming 'rome' already exists
    
    await page.click('button:has-text("Next")');
    
    // Should show error
    await expect(page).toHaveText(/Subdomain already exists/);
  });

  test('should allow site customization', async ({ page }) => {
    // Navigate to existing site
    await page.goto('/sites/test-site-id/editor');
    
    // Drag and drop sections
    const section = page.locator('[data-section-id="hero"]');
    const target = page.locator('[data-section-id="features"]');
    
    await section.dragTo(target);
    
    // Edit section content
    await page.click('[data-section-id="hero"] button:has-text("Edit")');
    
    // Modify content in modal
    await page.fill('input[name="headline"]', 'Welcome to Amazing Barcelona');
    await page.click('button:has-text("Save")');
    
    // Save changes
    await page.click('button:has-text("Save Order")');
    
    // Verify changes saved
    await expect(page).toHaveText(/Changes saved successfully/);
  });
});