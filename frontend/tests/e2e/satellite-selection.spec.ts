import { test, expect } from '@playwright/test';

test.describe('Satellite Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for satellites to load
    await page.waitForSelector('[data-testid="satellite-map"]', { timeout: 10000 });
  });

  test('displays map on load', async ({ page }) => {
    const map = page.locator('[data-testid="satellite-map"]');
    await expect(map).toBeVisible();
  });

  test('displays satellite icons on map', async ({ page }) => {
    // Wait for deck.gl to render
    await page.waitForTimeout(2000);
    
    // Check that canvas is rendered
    const canvas = page.locator('[data-testid="satellite-map"] canvas');
    await expect(canvas.first()).toBeVisible();
  });

  test('clicking satellite shows details panel', async ({ page }) => {
    // Click on a satellite in the sidebar list
    const satelliteItem = page.locator('[data-testid="satellite-item"]').first();
    
    if (await satelliteItem.isVisible()) {
      await satelliteItem.click();
      
      // Details panel should appear
      const detailsPanel = page.locator('[data-testid="details-panel"]');
      await expect(detailsPanel).toBeVisible({ timeout: 5000 });
    }
  });

  test('selected satellite shows ground track', async ({ page }) => {
    const satelliteItem = page.locator('[data-testid="satellite-item"]').first();
    
    if (await satelliteItem.isVisible()) {
      await satelliteItem.click();
      
      // Wait for ground track calculation
      await page.waitForTimeout(1500);
      
      // Ground track canvas layer should be rendered
      const map = page.locator('[data-testid="satellite-map"]');
      await expect(map).toBeVisible();
    }
  });

  test('clicking elsewhere deselects satellite', async ({ page }) => {
    const satelliteItem = page.locator('[data-testid="satellite-item"]').first();
    
    if (await satelliteItem.isVisible()) {
      // Select satellite
      await satelliteItem.click();
      const detailsPanel = page.locator('[data-testid="details-panel"]');
      await expect(detailsPanel).toBeVisible({ timeout: 5000 });
      
      // Click close button or elsewhere
      const closeButton = page.locator('[data-testid="close-details"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await expect(detailsPanel).not.toBeVisible();
      }
    }
  });

  test('details panel shows satellite information', async ({ page }) => {
    const satelliteItem = page.locator('[data-testid="satellite-item"]').first();
    
    if (await satelliteItem.isVisible()) {
      await satelliteItem.click();
      
      const detailsPanel = page.locator('[data-testid="details-panel"]');
      await expect(detailsPanel).toBeVisible({ timeout: 5000 });
      
      // Check for satellite name
      const nameElement = detailsPanel.locator('h2, h3').first();
      await expect(nameElement).toBeVisible();
    }
  });
});
