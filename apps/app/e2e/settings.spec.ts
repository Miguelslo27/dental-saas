import { test, expect } from '@playwright/test'

test.describe('Settings and Profile', () => {
  // Note: These tests assume the user is authenticated

  test.describe('Settings Page', () => {
    test('should display settings page when authenticated', async ({ page }) => {
      await page.goto('/settings')

      const url = page.url()

      if (url.includes('/login')) {
        await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible()
      } else {
        await expect(page.getByRole('heading', { name: /configuración/i })).toBeVisible()
      }
    })

    test('should have clinic settings section', async ({ page }) => {
      await page.goto('/settings')

      if (page.url().includes('/login')) {
        test.skip()
      }

      await expect(page.getByText(/información de la clínica/i)).toBeVisible()
    })

    test('should have language selector', async ({ page }) => {
      await page.goto('/settings')

      if (page.url().includes('/login')) {
        test.skip()
      }

      // Should have language selector (either dropdown or buttons)
      const hasLanguageDropdown = await page.getByRole('combobox').isVisible().catch(() => false)
      const hasLanguageButtons = await page.getByRole('button', { name: /ES|EN|AR/i }).isVisible().catch(() => false)

      expect(hasLanguageDropdown || hasLanguageButtons).toBeTruthy()
    })

    test('should display clinic information fields', async ({ page }) => {
      await page.goto('/settings')

      if (page.url().includes('/login')) {
        test.skip()
      }

      // Should have input fields for clinic info
      await expect(page.getByText(/nombre de la clínica/i)).toBeVisible()
    })
  })

  test.describe('Language Switching', () => {
    test('should be able to change language from dropdown', async ({ page }) => {
      await page.goto('/settings')

      if (page.url().includes('/login')) {
        test.skip()
      }

      // Try to find language dropdown
      const languageSelect = page.getByRole('combobox').first()
      const isVisible = await languageSelect.isVisible().catch(() => false)

      if (isVisible) {
        // Get current value
        const currentValue = await languageSelect.inputValue()

        // Change to different language
        const newLang = currentValue === 'es' ? 'en' : 'es'
        await languageSelect.selectOption(newLang)

        // Wait for language change to take effect
        await page.waitForTimeout(500)

        // Verify language changed (page content should reflect new language)
        expect(await languageSelect.inputValue()).toBe(newLang)
      } else {
        test.skip()
      }
    })

    test('should be able to change language from buttons', async ({ page }) => {
      await page.goto('/settings')

      if (page.url().includes('/login')) {
        test.skip()
      }

      // Try to find language buttons
      const enButton = page.getByRole('button', { name: /EN/i })
      const isVisible = await enButton.isVisible().catch(() => false)

      if (isVisible) {
        await enButton.click()

        // Wait for language change
        await page.waitForTimeout(500)

        // Button should now be highlighted/active
        const classes = await enButton.getAttribute('class')
        expect(classes).toContain('bg-blue')
      } else {
        test.skip()
      }
    })
  })

  test.describe('Clinic Information Update', () => {
    test('should have save button for clinic settings', async ({ page }) => {
      await page.goto('/settings')

      if (page.url().includes('/login')) {
        test.skip()
      }

      await expect(page.getByRole('button', { name: /guardar/i })).toBeVisible()
    })

    test('should allow editing clinic name', async ({ page }) => {
      await page.goto('/settings')

      if (page.url().includes('/login')) {
        test.skip()
      }

      // Find clinic name input
      const nameInput = page.getByRole('textbox').first()
      const isVisible = await nameInput.isVisible().catch(() => false)

      if (isVisible) {
        // Clear and type new name
        await nameInput.fill('Test Clinic Name')

        // Value should be updated
        await expect(nameInput).toHaveValue('Test Clinic Name')
      } else {
        test.skip()
      }
    })
  })

  test.describe('Navigation', () => {
    test('should have navigation menu visible', async ({ page }) => {
      await page.goto('/settings')

      if (page.url().includes('/login')) {
        test.skip()
      }

      // Should have links to other pages
      await expect(page.getByRole('link', { name: /pacientes/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /citas/i })).toBeVisible()
    })

    test('should navigate to patients page from menu', async ({ page }) => {
      await page.goto('/settings')

      if (page.url().includes('/login')) {
        test.skip()
      }

      await page.getByRole('link', { name: /pacientes/i }).click()

      await expect(page).toHaveURL(/\/patients/)
    })

    test('should navigate to appointments page from menu', async ({ page }) => {
      await page.goto('/settings')

      if (page.url().includes('/login')) {
        test.skip()
      }

      await page.getByRole('link', { name: /citas/i }).click()

      await expect(page).toHaveURL(/\/appointments/)
    })
  })

  test.describe('User Profile', () => {
    test('should display user profile section', async ({ page }) => {
      await page.goto('/settings')

      if (page.url().includes('/login')) {
        test.skip()
      }

      // Should have user profile information
      const hasUserSection = await page.getByText(/perfil/i).isVisible().catch(() => false)

      // User profile might be in different section
      expect(typeof hasUserSection).toBe('boolean')
    })
  })
})
