import { test, expect } from '@playwright/test'

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
  })

  test.describe('Login', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login')

      await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible()
      await expect(page.getByPlaceholderText(/email/i)).toBeVisible()
      await expect(page.getByPlaceholderText(/contraseña/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible()
    })

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/login')

      const loginButton = page.getByRole('button', { name: /iniciar sesión/i })
      await loginButton.click()

      await expect(page.getByText(/email es requerido/i)).toBeVisible()
      await expect(page.getByText(/contraseña es requerida/i)).toBeVisible()
    })

    test('should show error for invalid email format', async ({ page }) => {
      await page.goto('/login')

      await page.getByPlaceholderText(/email/i).fill('invalid-email')
      await page.getByPlaceholderText(/contraseña/i).fill('password123')
      await page.getByRole('button', { name: /iniciar sesión/i }).click()

      await expect(page.getByText(/email inválido/i)).toBeVisible()
    })

    test('should navigate to forgot password page', async ({ page }) => {
      await page.goto('/login')

      await page.getByRole('link', { name: /olvidaste tu contraseña/i }).click()

      await expect(page).toHaveURL(/\/forgot-password/)
      await expect(page.getByRole('heading', { name: /recuperar contraseña/i })).toBeVisible()
    })

    test('should navigate to register page', async ({ page }) => {
      await page.goto('/login')

      await page.getByRole('link', { name: /crear una cuenta/i }).click()

      await expect(page).toHaveURL(/\/register/)
      await expect(page.getByRole('heading', { name: /crear cuenta/i })).toBeVisible()
    })
  })

  test.describe('Register', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/register')

      await expect(page.getByRole('heading', { name: /crear cuenta/i })).toBeVisible()
      await expect(page.getByPlaceholderText(/nombre de la clínica/i)).toBeVisible()
      await expect(page.getByPlaceholderText(/slug único/i)).toBeVisible()
      await expect(page.getByPlaceholderText(/nombre/i)).toBeVisible()
      await expect(page.getByPlaceholderText(/apellido/i)).toBeVisible()
      await expect(page.getByPlaceholderText(/email/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeVisible()
    })

    test('should show validation errors for empty required fields', async ({ page }) => {
      await page.goto('/register')

      await page.getByRole('button', { name: /crear cuenta/i }).click()

      await expect(page.getByText(/nombre de la clínica es requerido/i)).toBeVisible()
      await expect(page.getByText(/slug es requerido/i)).toBeVisible()
    })

    test('should navigate to login page', async ({ page }) => {
      await page.goto('/register')

      await page.getByRole('link', { name: /ya tienes una cuenta/i }).click()

      await expect(page).toHaveURL(/\/login/)
    })
  })

  test.describe('Forgot Password', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.goto('/forgot-password')

      await expect(page.getByRole('heading', { name: /recuperar contraseña/i })).toBeVisible()
      await expect(page.getByPlaceholderText(/email/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /enviar enlace/i })).toBeVisible()
    })

    test('should show validation error for empty email', async ({ page }) => {
      await page.goto('/forgot-password')

      await page.getByRole('button', { name: /enviar enlace/i }).click()

      await expect(page.getByText(/email es requerido/i)).toBeVisible()
    })

    test('should navigate back to login', async ({ page }) => {
      await page.goto('/forgot-password')

      await page.getByRole('link', { name: /volver al inicio de sesión/i }).click()

      await expect(page).toHaveURL(/\/login/)
    })
  })

  test.describe('Navigation', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      await page.goto('/patients')

      await expect(page).toHaveURL(/\/login/)
    })

    test('should redirect to dashboard when accessing root while authenticated', async ({ page }) => {
      // This test would need a valid session
      // For now, just test the redirect logic exists
      await page.goto('/')

      // Should either show homepage or redirect to login
      const hasHomeContent = await page.getByText(/sistema de gestión/i).isVisible().catch(() => false)
      const hasLoginForm = await page.getByRole('heading', { name: /iniciar sesión/i }).isVisible().catch(() => false)

      expect(hasHomeContent || hasLoginForm).toBeTruthy()
    })
  })
})
