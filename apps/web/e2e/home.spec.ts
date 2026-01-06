import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display the main title', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('🦷 Alveo System')).toBeVisible()
    await expect(page.getByText('Sistema de gestión para clínicas dentales')).toBeVisible()
  })

  test('should have API Health Check section', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('API Health Check')).toBeVisible()
  })

  test('should show health status when API is running', async ({ page }) => {
    await page.goto('/')

    // Wait for the API response to load
    await expect(page.getByText(/"status"/)).toBeVisible({ timeout: 10000 })
  })
})
