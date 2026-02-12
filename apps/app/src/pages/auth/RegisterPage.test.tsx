import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'

// Mock functions defined before vi.mock
const mockRegister = vi.fn()
const mockClearError = vi.fn()

// Mutable state for mocks
const mockAuthState = {
  isLoading: false,
  error: null as string | null,
  isAuthenticated: false,
}

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
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

vi.mock('@/lib/constants', () => ({
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
}))

// Import after mocks
import { RegisterPage } from './RegisterPage'
import { generateSlug, sanitizeSlugInput } from '@/lib/slug'

function renderRegisterPage() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthState.isLoading = false
    mockAuthState.error = null
    mockAuthState.isAuthenticated = false
  })

  describe('rendering', () => {
    it('should render the registration form', () => {
      renderRegisterPage()

      expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/nombre de la clínica/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/identificador de clínica/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^nombre$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()
    })

    it('should render login link', () => {
      renderRegisterPage()

      const loginLink = screen.getByRole('link', { name: /inicia sesión/i })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/login')
    })

    it('should render terms and privacy links', () => {
      renderRegisterPage()

      expect(screen.getByText(/términos de servicio/i)).toBeInTheDocument()
      expect(screen.getByText(/política de privacidad/i)).toBeInTheDocument()
    })
  })

  describe('form validation', () => {
    it('should not call register when fields are empty', async () => {
      renderRegisterPage()

      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

      await waitFor(() => {
        expect(mockRegister).not.toHaveBeenCalled()
      })
    })

    it('should not call register with incomplete data', async () => {
      renderRegisterPage()

      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

      await waitFor(() => {
        expect(mockRegister).not.toHaveBeenCalled()
      })
    })
  })

  describe('form submission', () => {
    it('should call register with form data on valid submit', async () => {
      mockRegister.mockResolvedValue({})
      renderRegisterPage()

      fireEvent.change(screen.getByLabelText(/nombre de la clínica/i), { target: { value: 'My Dental Clinic' } })
      fireEvent.change(screen.getByLabelText(/identificador de clínica/i), { target: { value: 'my-clinic' } })
      fireEvent.change(screen.getByLabelText(/^nombre$/i), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: 'Password1!' } })
      fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: 'Password1!' } })
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled()
        expect(mockRegister).toHaveBeenCalledWith({
          clinicName: 'My Dental Clinic',
          clinicSlug: 'my-clinic',
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          password: 'Password1!',
        })
      })
    })

    it('should handle register error', async () => {
      const error = new Error('Registration failed')
      mockRegister.mockRejectedValue(error)
      renderRegisterPage()

      fireEvent.change(screen.getByLabelText(/nombre de la clínica/i), { target: { value: 'My Dental Clinic' } })
      fireEvent.change(screen.getByLabelText(/identificador de clínica/i), { target: { value: 'my-clinic' } })
      fireEvent.change(screen.getByLabelText(/^nombre$/i), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: 'Password1!' } })
      fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: 'Password1!' } })
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled()
      })
    })
  })

  describe('loading state', () => {
    it('should show loading spinner when submitting', () => {
      mockAuthState.isLoading = true
      renderRegisterPage()

      expect(screen.getByText(/creando cuenta/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /creando cuenta/i })).toBeDisabled()
    })
  })

  describe('error display', () => {
    it('should display error message from auth state', () => {
      mockAuthState.error = 'El email ya está registrado'
      renderRegisterPage()

      expect(screen.getByText('El email ya está registrado')).toBeInTheDocument()
    })
  })

  describe('password visibility toggle', () => {
    it('should toggle password visibility', async () => {
      renderRegisterPage()

      const passwordInput = screen.getByLabelText(/^contraseña$/i)
      expect(passwordInput).toHaveAttribute('type', 'password')

      const toggleButtons = screen.getAllByRole('button', { name: /mostrar contraseña/i })
      fireEvent.click(toggleButtons[0])

      expect(passwordInput).toHaveAttribute('type', 'text')
    })

    it('should toggle confirm password visibility', async () => {
      renderRegisterPage()

      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')

      const toggleButtons = screen.getAllByRole('button', { name: /mostrar contraseña/i })
      fireEvent.click(toggleButtons[1])

      expect(confirmPasswordInput).toHaveAttribute('type', 'text')
    })
  })

  describe('authenticated redirect', () => {
    it('should redirect to home if already authenticated', () => {
      mockAuthState.isAuthenticated = true
      renderRegisterPage()

      expect(screen.getByText('Home Page')).toBeInTheDocument()
    })
  })

  describe('generateSlug', () => {
    it('should convert to lowercase and replace spaces with hyphens', () => {
      expect(generateSlug('My Dental Clinic')).toBe('my-dental-clinic')
    })

    it('should normalize diacritics', () => {
      expect(generateSlug('Clínica Señor')).toBe('clinica-senor')
      expect(generateSlug('Ñandú Über')).toBe('nandu-uber')
    })

    it('should strip special characters', () => {
      expect(generateSlug('Clinic @#$ Test')).toBe('clinic-test')
      expect(generateSlug("Clinic's")).toBe('clinics')
    })

    it('should collapse multiple hyphens', () => {
      expect(generateSlug('Clinic   ---  Test')).toBe('clinic-test')
    })

    it('should strip leading and trailing hyphens', () => {
      expect(generateSlug('  -Clinic-  ')).toBe('clinic')
    })

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('')
    })
  })

  describe('sanitizeSlugInput', () => {
    it('should preserve trailing hyphens from spaces', () => {
      expect(sanitizeSlugInput('my ')).toBe('my-')
    })

    it('should strip leading hyphens', () => {
      expect(sanitizeSlugInput(' clinic')).toBe('clinic')
    })

    it('should normalize diacritics', () => {
      expect(sanitizeSlugInput('clínica')).toBe('clinica')
    })

    it('should lowercase input', () => {
      expect(sanitizeSlugInput('MyClinic')).toBe('myclinic')
    })
  })

  describe('slug auto-generation', () => {
    it('should auto-fill slug when typing clinic name', async () => {
      renderRegisterPage()

      const clinicNameInput = screen.getByLabelText(/nombre de la clínica/i)
      const slugInput = screen.getByLabelText(/identificador de clínica/i) as HTMLInputElement

      fireEvent.change(clinicNameInput, { target: { value: 'My Dental Clinic' } })

      await waitFor(() => {
        expect(slugInput.value).toBe('my-dental-clinic')
      })
    })

    it('should stop auto-generating when slug is manually edited', async () => {
      renderRegisterPage()

      const clinicNameInput = screen.getByLabelText(/nombre de la clínica/i)
      const slugInput = screen.getByLabelText(/identificador de clínica/i) as HTMLInputElement

      fireEvent.change(clinicNameInput, { target: { value: 'My Clinic' } })

      await waitFor(() => {
        expect(slugInput.value).toBe('my-clinic')
      })

      fireEvent.change(slugInput, { target: { value: 'custom-slug' } })

      fireEvent.change(clinicNameInput, { target: { value: 'Another Clinic' } })

      await waitFor(() => {
        expect(slugInput.value).toBe('custom-slug')
      })
    })

    it('should resume auto-generating when slug is cleared', async () => {
      renderRegisterPage()

      const clinicNameInput = screen.getByLabelText(/nombre de la clínica/i)
      const slugInput = screen.getByLabelText(/identificador de clínica/i) as HTMLInputElement

      fireEvent.change(clinicNameInput, { target: { value: 'My Clinic' } })

      await waitFor(() => {
        expect(slugInput.value).toBe('my-clinic')
      })

      // Manually edit slug
      fireEvent.change(slugInput, { target: { value: 'custom-slug' } })

      // Clear slug field
      fireEvent.change(slugInput, { target: { value: '' } })

      // Change clinic name again - should auto-generate
      fireEvent.change(clinicNameInput, { target: { value: 'New Clinic' } })

      await waitFor(() => {
        expect(slugInput.value).toBe('new-clinic')
      })
    })

    it('should normalize diacritics in auto-generated slug', async () => {
      renderRegisterPage()

      const clinicNameInput = screen.getByLabelText(/nombre de la clínica/i)
      const slugInput = screen.getByLabelText(/identificador de clínica/i) as HTMLInputElement

      fireEvent.change(clinicNameInput, { target: { value: 'Clínica Señor' } })

      await waitFor(() => {
        expect(slugInput.value).toBe('clinica-senor')
      })
    })
  })

  describe('slug input sanitization', () => {
    it('should convert manual slug input to lowercase', async () => {
      renderRegisterPage()

      const slugInput = screen.getByLabelText(/identificador de clínica/i) as HTMLInputElement

      fireEvent.change(slugInput, { target: { value: 'My-Clinic' } })

      await waitFor(() => {
        expect(slugInput.value).toBe('my-clinic')
      })
    })

    it('should replace spaces with hyphens in manual slug input', async () => {
      renderRegisterPage()

      const slugInput = screen.getByLabelText(/identificador de clínica/i) as HTMLInputElement

      fireEvent.change(slugInput, { target: { value: 'my clinic' } })

      await waitFor(() => {
        expect(slugInput.value).toBe('my-clinic')
      })
    })

    it('should preserve trailing hyphen when typing with spaces', async () => {
      renderRegisterPage()

      const slugInput = screen.getByLabelText(/identificador de clínica/i) as HTMLInputElement

      fireEvent.change(slugInput, { target: { value: 'my ' } })

      await waitFor(() => {
        expect(slugInput.value).toBe('my-')
      })
    })

    it('should strip special characters from manual slug input', async () => {
      renderRegisterPage()

      const slugInput = screen.getByLabelText(/identificador de clínica/i) as HTMLInputElement

      fireEvent.change(slugInput, { target: { value: 'my@clinic!' } })

      await waitFor(() => {
        expect(slugInput.value).toBe('myclinic')
      })
    })

    it('should not convert accent marks to hyphens', async () => {
      renderRegisterPage()

      const slugInput = screen.getByLabelText(/identificador de clínica/i) as HTMLInputElement

      fireEvent.change(slugInput, { target: { value: "mi'clinica" } })

      await waitFor(() => {
        expect(slugInput.value).toBe('miclinica')
      })
    })

    it('should normalize diacritics in manual slug input', async () => {
      renderRegisterPage()

      const slugInput = screen.getByLabelText(/identificador de clínica/i) as HTMLInputElement

      fireEvent.change(slugInput, { target: { value: 'clínica' } })

      await waitFor(() => {
        expect(slugInput.value).toBe('clinica')
      })
    })

    it('should show helper text with format instructions', () => {
      renderRegisterPage()

      expect(screen.getByText(/solo letras minúsculas, números y guiones/i)).toBeInTheDocument()
    })
  })
})
