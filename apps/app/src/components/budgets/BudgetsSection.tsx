import { useEffect, useState } from 'react'
import { FileText, Plus, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Permission } from '@dental/shared'
import type { Budget, CreateBudgetData } from '@/lib/budget-api'
import { useBudgetsStore } from '@/stores/budgets.store'
import { usePermissions } from '@/hooks/usePermissions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { BudgetCard } from './BudgetCard'
import { BudgetFormModal } from './BudgetFormModal'

interface BudgetsSectionProps {
  patientId: string
}

export function BudgetsSection({ patientId }: BudgetsSectionProps) {
  const { t } = useTranslation()
  const { can } = usePermissions()
  const {
    budgets,
    loading,
    error,
    fetchBudgetsByPatient,
    createBudget,
    deleteBudget,
    clearError,
  } = useBudgetsStore()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchBudgetsByPatient(patientId)
  }, [patientId, fetchBudgetsByPatient])

  const handleOpenForm = () => {
    setFormError(null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    if (isSubmitting) return
    setIsFormOpen(false)
    setFormError(null)
  }

  const handleCreate = async (data: CreateBudgetData) => {
    setIsSubmitting(true)
    setFormError(null)
    try {
      await createBudget(patientId, data)
      setIsFormOpen(false)
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : t('budgets.errors.createFailed')
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!budgetToDelete) return
    setIsDeleting(true)
    try {
      await deleteBudget(budgetToDelete.id)
      setBudgetToDelete(null)
    } catch {
      // error is stored in the store; keep dialog open so user can retry or close
    } finally {
      setIsDeleting(false)
    }
  }

  const canCreate = can(Permission.BUDGETS_CREATE)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            {t('budgets.sectionTitle')}
          </h2>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={handleOpenForm}
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            {t('budgets.newBudget')}
          </button>
        )}
      </div>

      {error && !isFormOpen && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {loading && budgets.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          {t('common.loading')}
        </div>
      ) : budgets.length === 0 ? (
        <div className="py-10 text-center">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">{t('budgets.noBudgets')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              patientId={patientId}
              onDelete={setBudgetToDelete}
            />
          ))}
        </div>
      )}

      <BudgetFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleCreate}
        isLoading={isSubmitting}
        error={formError}
      />

      <ConfirmDialog
        isOpen={!!budgetToDelete}
        onClose={() => !isDeleting && setBudgetToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t('budgets.deleteBudget')}
        message={t('budgets.deleteConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
