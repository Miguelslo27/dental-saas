import { useTranslation } from 'react-i18next'
import { PanelLeftClose } from 'lucide-react'
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
        w-full space-y-6
        lg:shrink-0 lg:overflow-hidden lg:transition-[width] lg:duration-200 lg:ease-in-out lg:space-y-0
        order-2 lg:order-1
        ${isCollapsed ? 'lg:w-0' : 'lg:w-[380px]'}
      `}
    >
      <div className="lg:w-[380px] space-y-6">
        {/* Images Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('attachments.title')}</h2>
            <button
              onClick={onToggle}
              className="hidden lg:inline-flex p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={t('patients.collapseSidebar')}
            >
              <PanelLeftClose className="h-4 w-4 rtl:scale-x-[-1]" />
            </button>
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

        {/* Payments Card */}
        {can(Permission.PAYMENTS_VIEW) && (
          <PaymentSection patientId={patientId} />
        )}
      </div>
    </aside>
  )
}
