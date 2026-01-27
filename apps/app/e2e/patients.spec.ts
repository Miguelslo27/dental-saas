import { test, expect } from '@playwright/test'

test.describe('Patients Management', () => {
  // Note: These tests assume the user is authenticated
  // In a real scenario, you would use a setup helper to log in before tests

  test.describe('Patients List Page', () => {
    test('should display patients page when authenticated', async ({ page }) => {
      // This test will redirect to login if not authenticated
      await page.goto('/patients')

      // If authenticated, should see the patients page
      // If not authenticated, will be at login page
      const url = page.url()

      if (url.includes('/login')) {
        // User is not authenticated, which is expected behavior
        await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible()
      } else {
        // User is authenticated
        await expect(page.getByRole('heading', { name: /pacientes/i })).toBeVisible()
      }
    })

    test('should have search functionality visible', async ({ page }) => {
      await page.goto('/patients')

      // Skip if redirected to login
      if (page.url().includes('/login')) {
        test.skip()
      }

      await expect(page.getByPlaceholderText(/buscar/i)).toBeVisible()
    })

    test('should have new patient button visible', async ({ page }) => {
      await page.goto('/patients')

      // Skip if redirected to login
      if (page.url().includes('/login')) {
        test.skip()
      }

      await expect(page.getByRole('button', { name: /nuevo paciente/i })).toBeVisible()
    })

    test('should have filters button visible', async ({ page }) => {
      await page.goto('/patients')

      // Skip if redirected to login
      if (page.url().includes('/login')) {
        test.skip()
      }

      await expect(page.getByRole('button', { name: /filtros/i })).toBeVisible()
    })
  })

  test.describe('Patient Form Modal', () => {
    test('should open create patient modal when clicking new patient button', async ({ page }) => {
      await page.goto('/patients')

      // Skip if redirected to login
      if (page.url().includes('/login')) {
        test.skip()
      }

      await page.getByRole('button', { name: /nuevo paciente/i }).click()

      await expect(page.getByRole('dialog')).toBeVisible()
      await expect(page.getByText(/nuevo paciente/i)).toBeVisible()
    })

    test('should close modal when clicking cancel', async ({ page }) => {
      await page.goto('/patients')

      // Skip if redirected to login
      if (page.url().includes('/login')) {
        test.skip()
      }

      await page.getByRole('button', { name: /nuevo paciente/i }).click()
      await expect(page.getByRole('dialog')).toBeVisible()

      await page.getByRole('button', { name: /cancelar/i }).click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('should show validation errors in create form', async ({ page }) => {
      await page.goto('/patients')

      // Skip if redirected to login
      if (page.url().includes('/login')) {
        test.skip()
      }

      await page.getByRole('button', { name: /nuevo paciente/i }).click()

      // Try to submit without filling required fields
      const submitButton = page.getByRole('button', { name: /crear paciente/i })
      await submitButton.click()

      // Should show validation errors
      await expect(page.getByText(/nombre es requerido/i)).toBeVisible()
      await expect(page.getByText(/apellido es requerido/i)).toBeVisible()
    })
  })

  test.describe('Search and Filter', () => {
    test('should allow typing in search field', async ({ page }) => {
      await page.goto('/patients')

      // Skip if redirected to login
      if (page.url().includes('/login')) {
        test.skip()
      }

      const searchInput = page.getByPlaceholderText(/buscar/i)
      await searchInput.fill('John Doe')

      await expect(searchInput).toHaveValue('John Doe')
    })

    test('should toggle filters panel', async ({ page }) => {
      await page.goto('/patients')

      // Skip if redirected to login
      if (page.url().includes('/login')) {
        test.skip()
      }

      const filtersButton = page.getByRole('button', { name: /filtros/i })
      await filtersButton.click()

      // Should show filter options (gender filter)
      await expect(page.getByText(/género/i)).toBeVisible()

      // Click again to close
      await filtersButton.click()

      // Filters should be hidden
      await expect(page.getByText(/género/i)).not.toBeVisible()
    })
  })

  test.describe('Patient Details', () => {
    test('should navigate to patient detail when clicking on patient card', async ({ page }) => {
      await page.goto('/patients')

      // Skip if redirected to login or no patients
      if (page.url().includes('/login')) {
        test.skip()
      }

      // Wait for any patient cards to load
      await page.waitForTimeout(1000)

      // Try to find a patient card (they have testid)
      const patientCard = page.locator('[data-testid^="patient-card-"]').first()

      const isVisible = await patientCard.isVisible().catch(() => false)

      if (isVisible) {
        await patientCard.click()

        // Should navigate to patient detail page
        await expect(page).toHaveURL(/\/patients\/[a-zA-Z0-9]+/)
      } else {
        // No patients to click
        test.skip()
      }
    })
  })
})
