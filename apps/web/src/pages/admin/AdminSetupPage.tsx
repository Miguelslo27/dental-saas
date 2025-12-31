import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { adminSetupApi } from '@/lib/admin-api'
import { useAdminStore } from '@/stores/admin.store'
import { Shield, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { AxiosError } from 'axios'

const setupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,
      'Debe incluir mayúscula, minúscula, número y carácter especial'
    ),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  setupKey: z.string().min(1, 'La clave de configuración es requerida'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type SetupFormData = z.infer<typeof setupSchema>

export function AdminSetupPage() {
  const navigate = useNavigate()
  const { setAuth, isAuthenticated } = useAdminStore()
  const [setupAvailable, setSetupAvailable] = useState<boolean | null>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
  })

  useEffect(() => {
    // If already authenticated as admin, redirect to dashboard
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true })
      return
    }

    // Check if setup is available
    const checkSetupStatus = async () => {
      try {
        const status = await adminSetupApi.checkStatus()
        setSetupAvailable(status.setupAvailable)
      } catch (err) {
        console.error('Error checking setup status:', err)
        setError('Error al verificar el estado del sistema')
      } finally {
        setIsCheckingStatus(false)
      }
    }

    checkSetupStatus()
  }, [isAuthenticated, navigate])

  const onSubmit = async (data: SetupFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await adminSetupApi.createSuperAdmin({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        setupKey: data.setupKey,
      })

      // Store auth data
      setAuth(response.user, response.accessToken, response.refreshToken)
      setSuccess(true)

      // Redirect after success
      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true })
      }, 2000)
    } catch (err) {
      if (err instanceof AxiosError) {
        const message = err.response?.data?.error?.message || 'Error al crear el super admin'
        setError(message)
      } else {
        setError('Error inesperado')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isCheckingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="mt-4 text-gray-400">Verificando estado del sistema...</p>
        </div>
      </div>
    )
  }

  // Setup not available (super admin already exists)
  if (setupAvailable === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md w-full px-6 text-center">
          <Shield className="h-16 w-16 text-gray-600 mx-auto" />
          <h1 className="mt-6 text-2xl font-bold text-white">
            Configuración No Disponible
          </h1>
          <p className="mt-2 text-gray-400">
            El super administrador ya ha sido configurado. Por favor inicia sesión.
          </p>
          <a
            href="/admin/login"
            className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir a Iniciar Sesión
          </a>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md w-full px-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="mt-6 text-2xl font-bold text-white">
            ¡Super Admin Creado!
          </h1>
          <p className="mt-2 text-gray-400">
            Redirigiendo al panel de administración...
          </p>
        </div>
      </div>
    )
  }

  // Setup form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-blue-500 mx-auto" />
          <h1 className="mt-4 text-3xl font-bold text-white">
            Configuración Inicial
          </h1>
          <p className="mt-2 text-gray-400">
            Crea el primer Super Administrador de la plataforma
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 rounded-xl p-8 shadow-xl">
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Setup Key */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Clave de Configuración
              </label>
              <input
                {...register('setupKey')}
                type="password"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa la SETUP_KEY"
              />
              {errors.setupKey && (
                <p className="mt-1 text-sm text-red-400">{errors.setupKey.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mike"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Apellido
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Admin"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@dental-saas.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Contraseña
              </label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mínimo 12 caracteres"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirmar Contraseña
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Repite la contraseña"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creando Super Admin...
              </>
            ) : (
              'Crear Super Admin'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminSetupPage
