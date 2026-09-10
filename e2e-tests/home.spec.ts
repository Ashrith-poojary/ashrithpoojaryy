import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the correct title', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle('Tailspin Toys - Crowdfunding your new favorite game!');
  });

  test('should display the main heading', async ({ page }) => {
    // Check that the main page heading is present
    await expect(page.getByRole('heading', { name: 'Welcome to Tailspin Toys', exact: true })).toBeVisible();
  });

  test('should display the site branding in header', async ({ page }) => {
    // Check that the site branding is present in the header (no longer an h1)
    await expect(page.getByText('Tailspin Toys').first()).toBeVisible();
  });

  test('should display the welcome message', async ({ page }) => {
    // Check that the welcome message is present using more specific locator
    await expect(page.getByText('Find your next game! And maybe even back one! Explore our collection!')).toBeVisible();
  });

  test('filters games by category and updates the URL', async ({ page }) => {
    await page.getByLabel('Categories').selectOption({ label: 'Strategy' });

    await expect(page.locator('[data-testid="game-card"]:visible')).toHaveCount(4);
    await expect(page).toHaveURL(/category=\d+/);
    await expect(page.getByTestId('filter-results-count')).toHaveText('4 games shown');
  });

  test('combines category and publisher filters', async ({ page }) => {
    await page.getByLabel('Categories').selectOption({ label: 'Strategy' });
    await page.getByLabel('Publisher').selectOption({ label: 'CodeForge Studios' });

    await expect(page.locator('[data-testid="game-card"]:visible')).toHaveCount(1);
    await expect(page.locator('[data-testid="game-card"]:visible [data-testid="game-title"]')).toHaveText('DevOps Dominion');
    await expect(page).toHaveURL(/category=\d+&publisher=\d+/);
  });

  test('clears active filters', async ({ page }) => {
    await page.getByLabel('Categories').selectOption({ label: 'Strategy' });
    await page.getByLabel('Publisher').selectOption({ label: 'CodeForge Studios' });
    await page.getByTestId('clear-filters').click();

    await expect(page.locator('[data-testid="game-card"]:visible')).toHaveCount(6);
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('filter-results-count')).toHaveText('21 games shown');
  });

  test('paginates the game list with previous and next controls', async ({ page }) => {
    await expect(page.locator('[data-testid="game-card"]:visible')).toHaveCount(6);
    await expect(page.getByTestId('page-indicator')).toHaveText('Page 1 of 4');
    await expect(page.getByTestId('previous-page')).toBeDisabled();
    await expect(page.getByTestId('next-page')).toBeEnabled();

    await page.getByTestId('next-page').click();

    await expect(page.locator('[data-testid="game-card"]:visible')).toHaveCount(6);
    await expect(page.getByTestId('page-indicator')).toHaveText('Page 2 of 4');
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByTestId('previous-page')).toBeEnabled();

    await page.getByTestId('previous-page').click();

    await expect(page.locator('[data-testid="game-card"]:visible')).toHaveCount(6);
    await expect(page.getByTestId('page-indicator')).toHaveText('Page 1 of 4');
    await expect(page).toHaveURL('/');
  });

  test('resets pagination when a filter changes', async ({ page }) => {
    await page.getByTestId('next-page').click();
    await expect(page.getByTestId('page-indicator')).toHaveText('Page 2 of 4');

    await page.getByLabel('Categories').selectOption({ label: 'Strategy' });

    await expect(page.locator('[data-testid="game-card"]:visible')).toHaveCount(4);
    await expect(page.getByTestId('page-indicator')).toHaveText('Page 1 of 1');
    await expect(page).toHaveURL(/category=\d+$/);
  });

  test('persists high contrast mode across reloads', async ({ page }) => {
    const contrastToggle = page.getByTestId('contrast-toggle');

    await expect(contrastToggle).toHaveAttribute('aria-pressed', 'false');
    await contrastToggle.click();
    await expect(contrastToggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveClass(/high-contrast/);

    await page.reload();

    await expect(page.getByTestId('contrast-toggle')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveClass(/high-contrast/);
  });
});
