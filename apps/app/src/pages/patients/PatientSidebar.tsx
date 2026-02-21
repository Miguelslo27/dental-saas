import { useTranslation } from 'react-i18next'
import { PanelLeftClose, PanelLeftOpen, Image, DollarSign } from 'lucide-react'
import { AttachmentModule, Permission } from '@dental/shared'
import { usePermissions } from '@/hooks/usePermissions'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { PaymentSection } from '@/components/payments/PaymentSection'

interface PatientSidebarProps {
  patientId: string
  isCollapsed: boolean
  onToggle: () => void
  imageRefreshKey: number
  onImageUploadComplete: () => void
}

export function PatientSidebar({
  patientId,
  isCollapsed,
  onToggle,
  imageRefreshKey,
  onImageUploadComplete,
}: PatientSidebarProps) {
  const { t } = useTranslation()
  const { can } = usePermissions()

  return (
    <aside
      className={`
        order-2 lg:order-1 lg:shrink-0
        lg:transition-[width] lg:duration-200 lg:ease-in-out
        ${isCollapsed ? 'lg:w-12' : 'lg:w-95'}
      `}
    >
      {/* Collapsed icon strip — desktop only */}
      {isCollapsed && (
        <div className="hidden lg:flex flex-col items-center gap-2 py-3 bg-white rounded-xl shadow-sm border border-gray-100">
          <button
            onClick={onToggle}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('patients.expandSidebar')}
          >
            <PanelLeftOpen className="h-5 w-5 rtl:scale-x-[-1]" />
          </button>
          <div className="w-6 border-t border-gray-200" />
          {can(Permission.PAYMENTS_VIEW) && (
            <button
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={t('payments.title')}
            >
              <DollarSign className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={onToggle}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('attachments.title')}
          >
            <Image className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Expanded sidebar content */}
      {!isCollapsed && (
        <div className="space-y-6 lg:w-95">
          {/* Payments Card */}
          {can(Permission.PAYMENTS_VIEW) && (
            <PaymentSection patientId={patientId} onCollapse={onToggle} />
          )}

          {/* Images Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('attachments.title')}</h2>
              {!can(Permission.PAYMENTS_VIEW) && (
                <button
                  onClick={onToggle}
                  className="hidden lg:inline-flex p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title={t('patients.collapseSidebar')}
                >
                  <PanelLeftClose className="h-4 w-4 rtl:scale-x-[-1]" />
                </button>
              )}
            </div>
            <ImageUpload
              module={AttachmentModule.PATIENTS}
              entityId={patientId}
              onUploadComplete={onImageUploadComplete}
            />
            <div className="mt-4">
              <ImageGallery
                module={AttachmentModule.PATIENTS}
                entityId={patientId}
                refreshKey={imageRefreshKey}
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
