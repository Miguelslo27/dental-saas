import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { adminApiClient } from '@/lib/admin-api'
import { Shield, Loader2, AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { AxiosError } from 'axios'

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,
        'Debe incluir mayúscula, minúscula, número y carácter especial'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export function AdminResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Check if token is present
  useEffect(() => {
    if (!token) {
      setError('Enlace de restablecimiento inválido. Por favor solicita uno nuevo.')
    }
  }, [token])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return

    setIsSubmitting(true)
    setError(null)

    try {
      await adminApiClient.post('/auth/reset-password', {
        token,
        password: data.password,
      })

      setIsSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/admin/login', { replace: true })
      }, 3000)
    } catch (err) {
      if (err instanceof AxiosError) {
        const code = err.response?.data?.error?.code
        let message = 'Error al restablecer la contraseña'

        switch (code) {
          case 'INVALID_TOKEN':
            message = 'El enlace de restablecimiento es inválido'
            break
          case 'TOKEN_EXPIRED':
            message = 'El enlace de restablecimiento ha expirado. Por favor solicita uno nuevo.'
            break
          case 'TOKEN_USED':
            message = 'Este enlace ya fue utilizado. Por favor solicita uno nuevo.'
            break
          case 'ACCOUNT_INACTIVE':
            message = 'La cuenta está desactivada'
            break
          default:
            message = err.response?.data?.error?.message || message
        }

        setError(message)
      } else {
        setError('Error inesperado')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Nueva Contraseña</h1>
          <p className="text-gray-400 mt-2">Panel de Super Administrador</p>
        </div>

        {/* Card */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
          {isSuccess ? (
            /* Success State */
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                ¡Contraseña actualizada!
              </h2>
              <p className="text-gray-400 mb-6">
                Tu contraseña ha sido restablecida exitosamente.
                Serás redirigido al inicio de sesión...
              </p>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span className="text-purple-400 text-sm">Redirigiendo...</span>
              </div>
            </div>
          ) : (
            /* Form */
            <>
              {!token ? (
                /* No token error */
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/20 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Enlace inválido
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Este enlace de restablecimiento no es válido o ha expirado.
                  </p>
                  <Link
                    to="/admin/forgot-password"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Solicitar nuevo enlace
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-gray-400 text-sm mb-6">
                    Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres e incluir
                    mayúsculas, minúsculas, números y caracteres especiales.
                  </p>

                  {error && (
                    <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-red-200 text-sm">
                        <p>{error}</p>
                        {(error.includes('expirado') || error.includes('utilizado')) && (
                          <Link
                            to="/admin/forgot-password"
                            className="text-red-300 underline hover:text-red-200 mt-2 inline-block"
                          >
                            Solicitar nuevo enlace
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Nueva contraseña
                      </label>
                      <div className="relative">
                        <input
                          {...register('password')}
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          autoComplete="new-password"
                          className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Confirmar contraseña
                      </label>
                      <div className="relative">
                        <input
                          {...register('confirmPassword')}
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          autoComplete="new-password"
                          className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Restableciendo...
                        </>
                      ) : (
                        'Restablecer contraseña'
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <Link
                      to="/admin/login"
                      className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Volver al inicio de sesión
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © {new Date().getFullYear()} Dental SaaS. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
