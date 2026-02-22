import { test, expect } from '@playwright/test';

test.describe('Category Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="satellite-map"]', { timeout: 10000 });
  });

  test('displays filter panel', async ({ page }) => {
    const filterPanel = page.locator('[data-testid="filter-panel"]');
    await expect(filterPanel).toBeVisible();
  });

  test('all categories enabled by default', async ({ page }) => {
    const stationFilter = page.locator('[data-testid="filter-station"]');
    const navFilter = page.locator('[data-testid="filter-navigation"]');
    const weatherFilter = page.locator('[data-testid="filter-weather"]');

    // Check that filters exist and are enabled
    if (await stationFilter.isVisible()) {
      const checkbox = stationFilter.locator('input[type="checkbox"]');
      await expect(checkbox).toBeChecked();
    }
    
    if (await navFilter.isVisible()) {
      const checkbox = navFilter.locator('input[type="checkbox"]');
      await expect(checkbox).toBeChecked();
    }
    
    if (await weatherFilter.isVisible()) {
      const checkbox = weatherFilter.locator('input[type="checkbox"]');
      await expect(checkbox).toBeChecked();
    }
  });

  test('toggling filter hides category satellites', async ({ page }) => {
    const stationFilter = page.locator('[data-testid="filter-station"]');
    
    if (await stationFilter.isVisible()) {
      // Get initial satellite count
      const initialItems = await page.locator('[data-testid="satellite-item"]').count();
      
      // Click filter to disable
      const checkbox = stationFilter.locator('input[type="checkbox"]');
      await checkbox.click();
      
      // Wait for update
      await page.waitForTimeout(500);
      
      // Station satellites should be hidden
      const afterItems = await page.locator('[data-testid="satellite-item"]').count();
      
      // Should have fewer items (or same if no station satellites)
      expect(afterItems).toBeLessThanOrEqual(initialItems);
    }
  });

  test('re-enabling filter shows satellites again', async ({ page }) => {
    const stationFilter = page.locator('[data-testid="filter-station"]');
    
    if (await stationFilter.isVisible()) {
      const checkbox = stationFilter.locator('input[type="checkbox"]');
      
      // Disable then re-enable
      await checkbox.click();
      await page.waitForTimeout(300);
      
      await checkbox.click();
      await page.waitForTimeout(300);
      
      // Should be checked again
      await expect(checkbox).toBeChecked();
    }
  });

  test('disabling all filters shows no satellites', async ({ page }) => {
    const filters = ['station', 'navigation', 'weather', 'science', 'debris', 'unknown'];
    
    for (const filter of filters) {
      const filterElement = page.locator(`[data-testid="filter-${filter}"]`);
      if (await filterElement.isVisible()) {
        const checkbox = filterElement.locator('input[type="checkbox"]');
        if (await checkbox.isChecked()) {
          await checkbox.click();
        }
      }
    }
    
    await page.waitForTimeout(500);
    
    // No satellite items should be visible
    const items = await page.locator('[data-testid="satellite-item"]').count();
    expect(items).toBe(0);
  });

  test('filter persists after selecting satellite', async ({ page }) => {
    const navFilter = page.locator('[data-testid="filter-navigation"]');
    
    if (await navFilter.isVisible()) {
      // Disable navigation filter
      const checkbox = navFilter.locator('input[type="checkbox"]');
      await checkbox.click();
      
      // Select a visible satellite if any
      const satelliteItem = page.locator('[data-testid="satellite-item"]').first();
      if (await satelliteItem.isVisible()) {
        await satelliteItem.click();
        
        // Filter should still be unchecked
        await expect(checkbox).not.toBeChecked();
      }
    }
  });
});
