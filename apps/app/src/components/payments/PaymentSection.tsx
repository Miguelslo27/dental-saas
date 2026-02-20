import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Loader2, DollarSign, AlertCircle } from 'lucide-react'
import { Permission } from '@dental/shared'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuthStore } from '@/stores/auth.store'
import { formatCurrency } from '@/lib/format'
import {
  getPatientBalance,
  getPatientPayments,
  createPayment,
  deletePayment,
  type Payment,
  type PatientBalance,
  type CreatePaymentData,
} from '@/lib/payment-api'
import { PaymentFormModal } from './PaymentFormModal'

// ============================================================================
// Main Component
// ============================================================================

interface PaymentSectionProps {
  patientId: string
}

export function PaymentSection({ patientId }: PaymentSectionProps) {
  const { t, i18n } = useTranslation()
  const { can } = usePermissions()
  const currency = useAuthStore((s) => s.user?.tenant?.currency) || 'USD'

  const [balance, setBalance] = useState<PatientBalance | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fmtCurrency = useCallback(
    (amount: number) => formatCurrency(amount, currency),
    [currency]
  )

  const fetchData = useCallback(async () => {
    setError(null)
    try {
      const [balanceData, paymentsData] = await Promise.all([
        getPatientBalance(patientId),
        getPatientPayments(patientId, { limit: 50 }),
      ])
      setBalance(balanceData)
      setPayments(paymentsData.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading payments')
    } finally {
      setIsLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreatePayment = async (data: CreatePaymentData) => {
    setIsSaving(true)
    try {
      await createPayment(patientId, data)
      setIsFormOpen(false)
      await fetchData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error creating payment')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm(t('payments.deleteConfirm'))) return

    setDeletingId(paymentId)
    try {
      await deletePayment(patientId, paymentId)
      await fetchData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error deleting payment')
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{t('payments.title')}</h2>
        {can(Permission.PAYMENTS_CREATE) && balance && balance.outstanding > 0 && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t('payments.newPayment')}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Balance Summary */}
      {balance && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">{t('payments.totalDebt')}</p>
            <p className="text-xl font-bold text-gray-900">{fmtCurrency(balance.totalDebt)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">{t('payments.totalPaid')}</p>
            <p className="text-xl font-bold text-green-600">{fmtCurrency(balance.totalPaid)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">{t('payments.outstanding')}</p>
            <p className={`text-xl font-bold ${balance.outstanding > 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {fmtCurrency(balance.outstanding)}
            </p>
          </div>
        </div>
      )}

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>{t('payments.noPayments')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{fmtCurrency(payment.amount)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.date).toLocaleDateString(i18n.language, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  {payment.note && (
                    <p className="text-sm text-gray-400 mt-0.5">{payment.note}</p>
                  )}
                </div>
              </div>
              {can(Permission.PAYMENTS_DELETE) && (
                <button
                  onClick={() => handleDeletePayment(payment.id)}
                  disabled={deletingId === payment.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title={t('common.delete')}
                >
                  {deletingId === payment.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Payment Form Modal */}
      {balance && (
        <PaymentFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreatePayment}
          maxAmount={balance.outstanding}
          formatCurrency={fmtCurrency}
          isLoading={isSaving}
        />
      )}
    </div>
  )
}
