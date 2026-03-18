const { test, expect } = require('@playwright/test');

test('home page renders chatbot shell', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Car Cost Assistant')).toBeVisible();
  await expect(page.locator('#fullChatInput')).toBeVisible();
});

test('quick action dashboard responds in chat', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Dashboard Snapshot' }).click();
  await expect(
    page.locator('.full-bubble-bot').filter({ hasText: 'Dashboard snapshot' }).first()
  ).toBeVisible();
});

test('alternatives page still renders chatbot input', async ({ page }) => {
  await page.goto('/alternatives.html');

  await expect(page.locator('#cb-widget')).toBeVisible();
  await expect(page.locator('#cb-toggle')).toBeVisible();
});

test('switching quick action interrupts current flow', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Run Cost Calculator' }).click();
  await expect(
    page.locator('.full-bubble-bot').filter({ hasText: 'Calculator step 1/12' }).first()
  ).toBeVisible();

  await page.getByRole('button', { name: 'Dashboard Snapshot' }).click();
  await expect(
    page.locator('.full-bubble-bot').filter({ hasText: 'Switched from' }).first()
  ).toBeVisible();
  await expect(
    page.locator('.full-bubble-bot').filter({ hasText: 'Dashboard step 1/4' }).first()
  ).toBeVisible();
});

test('dashboard chart card includes clickable site link', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('#fullChatInput');

  await page.getByRole('button', { name: 'Dashboard Snapshot' }).click();
  await input.fill('ca');
  await input.press('Enter');
  await input.fill('average');
  await input.press('Enter');
  await input.fill('2018');
  await input.press('Enter');
  await input.fill('2024');
  await input.press('Enter');

  const chartCard = page.locator('.chat-chart[data-href^="dashboard.html?"]').first();
  await expect(chartCard).toBeVisible();
  const popupPromise = page.waitForEvent('popup');
  await chartCard.click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  await expect(popup).toHaveURL(/chart-view\.html/);
  const fullPageLink = popup.getByRole('link', { name: 'Open full page' });
  await expect(fullPageLink).toBeVisible();
  await expect(fullPageLink).toHaveAttribute('href', /dashboard\.html\?state=ca&profile=average&start=2018&end=2024/);
});
