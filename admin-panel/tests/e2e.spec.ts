import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

// ===== AUTH TESTS =====
test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('text=Daxil ol')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@mtm.az');
    await page.fill('input[type="password"]', 'R@shad123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await expect(page.locator('text=Xoş gəldiniz')).toBeVisible();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await expect(page.locator('.bg-red-50, .dark\\:bg-red-900\\/20')).toBeVisible();
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForURL('**/login');
  });
});

// ===== DASHBOARD TESTS =====
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@mtm.az');
    await page.fill('input[type="password"]', 'R@shad123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should display stat cards', async ({ page }) => {
    await expect(page.locator('text=24')).toBeVisible(); // Planned routes
    await expect(page.locator('text=18')).toBeVisible(); // Completed
  });

  test('should switch theme', async ({ page }) => {
    // Find theme toggle button
    const themeBtn = page.locator('button[aria-label="Toggle theme"]');
    await themeBtn.click();
    // Check dark class applied
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
    // Click again to go back
    await themeBtn.click();
  });

  test('should switch language to RU', async ({ page }) => {
    // Click language switcher
    await page.click('text=AZ');
    await page.click('text=RU');
    // Sidebar should show Russian
    await expect(page.locator('text=Панель управления')).toBeVisible();
  });
});

// ===== NAVIGATION TESTS =====
test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@mtm.az');
    await page.fill('input[type="password"]', 'R@shad123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  const pages = [
    { name: 'Canlı Xəritə', url: '/map' },
    { name: 'Marşrutlar', url: '/routes' },
    { name: 'Hesabatlar', url: '/reports' },
    { name: 'Müştərilər', url: '/customers' },
    { name: 'Tapşırıqlar', url: '/tasks' },
    { name: 'Xəbərdarlıqlar', url: '/alerts' },
    { name: 'Analitika', url: '/analytics' },
    { name: 'İstifadəçilər', url: '/users' },
  ];

  for (const p of pages) {
    test(`should navigate to ${p.name}`, async ({ page }) => {
      await page.click(`a[href="${p.url}"]`);
      await page.waitForURL(`**${p.url}`);
      await expect(page).toHaveURL(new RegExp(p.url));
    });
  }
});

// ===== CUSTOMERS CRUD TESTS =====
test.describe('Customers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@mtm.az');
    await page.fill('input[type="password"]', 'R@shad123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.goto(`${BASE_URL}/customers`);
  });

  test('should display customer list', async ({ page }) => {
    await expect(page.locator('text=Müştərilər')).toBeVisible();
    await expect(page.locator('text=Bakı Supermarket')).toBeVisible();
  });

  test('should open add customer modal', async ({ page }) => {
    await page.click('text=Yeni Müştəri');
    await expect(page.locator('text=Yeni Müştəri Əlavə Et')).toBeVisible();
  });

  test('should search customers', async ({ page }) => {
    await page.fill('input[placeholder*="axtar"]', 'Bravo');
    await expect(page.locator('text=Bravo Supermarket')).toBeVisible();
  });
});

// ===== ROUTES TESTS =====
test.describe('Routes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@mtm.az');
    await page.fill('input[type="password"]', 'R@shad123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.goto(`${BASE_URL}/routes`);
  });

  test('should display routes page', async ({ page }) => {
    await expect(page.locator('text=Marşrutlar')).toBeVisible();
    await expect(page.locator('text=Əhməd Məmmədov')).toBeVisible();
  });

  test('should open new route modal', async ({ page }) => {
    await page.click('text=Yeni Marşrut');
    await expect(page.locator('text=Marşrut adı')).toBeVisible();
    await expect(page.locator('text=Agent seçin')).toBeVisible();
  });

  test('should create a new route', async ({ page }) => {
    await page.click('text=Yeni Marşrut');
    await page.fill('input[placeholder="Marşrut adı"]', 'Test Marşrut');
    // Add a point
    await page.click('text=ABC Əczaxanası');
    await expect(page.locator('text=Marşrut Nöqtələri (1)')).toBeVisible();
    // Create
    await page.click('text=Marşrut yarat');
  });
});

// ===== REPORTS TESTS =====
test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@mtm.az');
    await page.fill('input[type="password"]', 'R@shad123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should navigate to daily report', async ({ page }) => {
    await page.goto(`${BASE_URL}/reports/daily`);
    await expect(page.locator('text=Gündəlik Hesabat')).toBeVisible();
  });

  test('should expand agent route detail', async ({ page }) => {
    await page.goto(`${BASE_URL}/reports/daily`);
    // Scroll to Agent Marşrut Detalı
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.click('text=Nigar Həsənova');
    await expect(page.locator('text=Unibank')).toBeVisible();
  });
});
