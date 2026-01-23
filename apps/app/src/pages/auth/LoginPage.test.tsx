import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'

// Mock functions defined before vi.mock
const mockLogin = vi.fn()
const mockClearError = vi.fn()

// Mutable state for mocks
const mockAuthState = {
  isLoading: false,
  error: null as string | null,
  isAuthenticated: false,
}

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoading: mockAuthState.isLoading,
    error: mockAuthState.error,
    clearError: mockClearError,
  }),
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => ({
    isAuthenticated: mockAuthState.isAuthenticated,
  }),
}))

// Import after mocks
import { LoginPage } from './LoginPage'

function renderLoginPage(initialRoute = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/:clinicSlug/login" element={<LoginPage />} />
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/register" element={<div>Register Page</div>} />
        <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

// Helper to get password input by id
function getPasswordInput() {
  return document.getElementById('password') as HTMLInputElement
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthState.isLoading = false
    mockAuthState.error = null
    mockAuthState.isAuthenticated = false
  })

  describe('rendering', () => {
    it('should render the login form', () => {
      renderLoginPage()

      expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/identificador de clínica/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(getPasswordInput()).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
    })

    it('should render register link', () => {
      renderLoginPage()

      const registerLink = screen.getByRole('link', { name: /regístrate aquí/i })
      expect(registerLink).toBeInTheDocument()
      expect(registerLink).toHaveAttribute('href', '/register')
    })

    it('should render forgot password link', () => {
      renderLoginPage()

      const forgotLink = screen.getByRole('link', { name: /olvidaste tu contraseña/i })
      expect(forgotLink).toBeInTheDocument()
      expect(forgotLink).toHaveAttribute('href', '/forgot-password')
    })

    it('should pre-fill clinic slug from URL params', () => {
      render(
        <MemoryRouter initialEntries={['/my-clinic/login']}>
          <Routes>
            <Route path="/:clinicSlug/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      )

      const clinicSlugInput = screen.getByLabelText(/identificador de clínica/i)
      expect(clinicSlugInput).toHaveValue('my-clinic')
    })
  })

  describe('form validation', () => {
    it('should not call login when fields are empty', async () => {
      renderLoginPage()

      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled()
      })
    })

    it('should not call login with incomplete data', async () => {
      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled()
      })
    })
  })

  describe('form submission', () => {
    it('should call login with form data on valid submit', async () => {
      mockLogin.mockResolvedValue({})
      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/identificador de clínica/i), { target: { value: 'my-clinic' } })
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
      fireEvent.change(getPasswordInput(), { target: { value: 'password123' } })
      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled()
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          clinicSlug: 'my-clinic',
        })
      })
    })

    it('should handle login error', async () => {
      const error = new Error('Login failed')
      mockLogin.mockRejectedValue(error)
      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/identificador de clínica/i), { target: { value: 'my-clinic' } })
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
      fireEvent.change(getPasswordInput(), { target: { value: 'wrongpassword' } })
      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled()
      })
    })
  })

  describe('loading state', () => {
    it('should show loading spinner when submitting', () => {
      mockAuthState.isLoading = true
      renderLoginPage()

      expect(screen.getByText(/cargando/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cargando/i })).toBeDisabled()
    })

    it('should disable submit button when loading', () => {
      mockAuthState.isLoading = true
      renderLoginPage()

      const submitButton = screen.getByRole('button', { name: /cargando/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('error display', () => {
    it('should display error message from auth state', () => {
      mockAuthState.error = 'Credenciales inválidas'
      renderLoginPage()

      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument()
    })
  })

  describe('password visibility toggle', () => {
    it('should toggle password visibility', async () => {
      renderLoginPage()

      const passwordInput = getPasswordInput()
      expect(passwordInput).toHaveAttribute('type', 'password')

      const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i })
      fireEvent.click(toggleButton)

      expect(passwordInput).toHaveAttribute('type', 'text')

      fireEvent.click(screen.getByRole('button', { name: /ocultar contraseña/i }))
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('authenticated redirect', () => {
    it('should redirect to home if already authenticated', () => {
      mockAuthState.isAuthenticated = true
      renderLoginPage()

      expect(screen.getByText('Home Page')).toBeInTheDocument()
    })
  })
})
