import { cn } from '@/lib/utils'
import {
  UPPER_RIGHT_PERMANENT,
  UPPER_LEFT_PERMANENT,
  LOWER_LEFT_PERMANENT,
  LOWER_RIGHT_PERMANENT,
  UPPER_RIGHT_PRIMARY,
  UPPER_LEFT_PRIMARY,
  LOWER_LEFT_PRIMARY,
  LOWER_RIGHT_PRIMARY,
  getToothName,
} from './constants'

// ============================================================================
// Types
// ============================================================================

export interface DentalChartProps {
  teeth: Record<string, string>
  onToothSelect?: (toothNumber: string) => void
  selectedTooth?: string | null
  showPrimary?: boolean
  readOnly?: boolean
  className?: string
}

// ============================================================================
// Tooth Component
// ============================================================================

interface ToothProps {
  number: string
  hasNote: boolean
  isSelected: boolean
  onClick: () => void
  readOnly?: boolean
}

function Tooth({ number, hasNote, isSelected, onClick, readOnly }: ToothProps) {
  return (
    <button
      onClick={onClick}
      disabled={readOnly}
      title={getToothName(number)}
      className={cn(
        'w-8 h-10 rounded-sm border-2 text-xs font-medium transition-all duration-150',
        'flex items-center justify-center',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        hasNote && !isSelected && 'bg-amber-100 border-amber-400 text-amber-700',
        !hasNote && !isSelected && 'bg-white border-gray-300 text-gray-600 hover:border-gray-400',
        isSelected && 'bg-blue-500 border-blue-600 text-white ring-2 ring-blue-300',
        readOnly && 'cursor-default',
        !readOnly && 'cursor-pointer hover:scale-105'
      )}
    >
      {number}
    </button>
  )
}

// ============================================================================
// Tooth Row Component
// ============================================================================

interface ToothRowProps {
  teeth: string[]
  teethData: Record<string, string>
  selectedTooth: string | null
  onToothSelect: (tooth: string) => void
  readOnly?: boolean
  label?: string
}

function ToothRow({ teeth, teethData, selectedTooth, onToothSelect, readOnly, label }: ToothRowProps) {
  return (
    <div className="flex items-center gap-1">
      {label && <span className="w-6 text-xs text-gray-400 text-right mr-1">{label}</span>}
      {teeth.map((tooth) => (
        <Tooth
          key={tooth}
          number={tooth}
          hasNote={!!teethData[tooth]}
          isSelected={selectedTooth === tooth}
          onClick={() => onToothSelect(tooth)}
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export default function DentalChart({
  teeth,
  onToothSelect,
  selectedTooth = null,
  showPrimary = false,
  readOnly = false,
  className,
}: DentalChartProps) {
  const handleToothSelect = (tooth: string) => {
    if (!readOnly && onToothSelect) {
      onToothSelect(tooth)
    }
  }

  return (
    <div className={cn('bg-white rounded-lg p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Odontograma</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-100 border border-amber-400 rounded-sm" />
            <span className="text-gray-500">Con notas</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 border border-blue-600 rounded-sm" />
            <span className="text-gray-500">Seleccionado</span>
          </div>
        </div>
      </div>

      {/* Dental Chart */}
      <div className="space-y-2">
        {/* Upper Jaw Label */}
        <div className="text-center text-xs text-gray-400 uppercase tracking-wide">
          Maxilar Superior
        </div>

        {/* Primary Upper (optional) */}
        {showPrimary && (
          <div className="flex justify-center gap-8">
            <ToothRow
              teeth={UPPER_RIGHT_PRIMARY}
              teethData={teeth}
              selectedTooth={selectedTooth}
              onToothSelect={handleToothSelect}
              readOnly={readOnly}
            />
            <div className="w-px bg-gray-200" />
            <ToothRow
              teeth={UPPER_LEFT_PRIMARY}
              teethData={teeth}
              selectedTooth={selectedTooth}
              onToothSelect={handleToothSelect}
              readOnly={readOnly}
            />
          </div>
        )}

        {/* Permanent Upper */}
        <div className="flex justify-center gap-4">
          <ToothRow
            teeth={UPPER_RIGHT_PERMANENT}
            teethData={teeth}
            selectedTooth={selectedTooth}
            onToothSelect={handleToothSelect}
            readOnly={readOnly}
          />
          <div className="w-px bg-gray-300 mx-2" />
          <ToothRow
            teeth={UPPER_LEFT_PERMANENT}
            teethData={teeth}
            selectedTooth={selectedTooth}
            onToothSelect={handleToothSelect}
            readOnly={readOnly}
          />
        </div>

        {/* Center Divider */}
        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-xs text-gray-400 px-2">Línea Media</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Permanent Lower */}
        <div className="flex justify-center gap-4">
          <ToothRow
            teeth={LOWER_RIGHT_PERMANENT}
            teethData={teeth}
            selectedTooth={selectedTooth}
            onToothSelect={handleToothSelect}
            readOnly={readOnly}
          />
          <div className="w-px bg-gray-300 mx-2" />
          <ToothRow
            teeth={LOWER_LEFT_PERMANENT}
            teethData={teeth}
            selectedTooth={selectedTooth}
            onToothSelect={handleToothSelect}
            readOnly={readOnly}
          />
        </div>

        {/* Primary Lower (optional) */}
        {showPrimary && (
          <div className="flex justify-center gap-8">
            <ToothRow
              teeth={LOWER_RIGHT_PRIMARY}
              teethData={teeth}
              selectedTooth={selectedTooth}
              onToothSelect={handleToothSelect}
              readOnly={readOnly}
            />
            <div className="w-px bg-gray-200" />
            <ToothRow
              teeth={LOWER_LEFT_PRIMARY}
              teethData={teeth}
              selectedTooth={selectedTooth}
              onToothSelect={handleToothSelect}
              readOnly={readOnly}
            />
          </div>
        )}

        {/* Lower Jaw Label */}
        <div className="text-center text-xs text-gray-400 uppercase tracking-wide">
          Maxilar Inferior
        </div>
      </div>

      {/* Selected Tooth Info */}
      {selectedTooth && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-800">
            {getToothName(selectedTooth)}
          </p>
          {teeth[selectedTooth] && (
            <p className="text-sm text-blue-600 mt-1">
              Nota: {teeth[selectedTooth]}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
