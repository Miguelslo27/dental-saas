import { cn } from '@/lib/utils'

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
// Constants - ISO 3950 (FDI) Notation
// ============================================================================

// Permanent teeth (32 total)
const UPPER_RIGHT_PERMANENT = ['18', '17', '16', '15', '14', '13', '12', '11']
const UPPER_LEFT_PERMANENT = ['21', '22', '23', '24', '25', '26', '27', '28']
const LOWER_LEFT_PERMANENT = ['31', '32', '33', '34', '35', '36', '37', '38']
const LOWER_RIGHT_PERMANENT = ['48', '47', '46', '45', '44', '43', '42', '41']

// Primary teeth (20 total)
const UPPER_RIGHT_PRIMARY = ['55', '54', '53', '52', '51']
const UPPER_LEFT_PRIMARY = ['61', '62', '63', '64', '65']
const LOWER_LEFT_PRIMARY = ['71', '72', '73', '74', '75']
const LOWER_RIGHT_PRIMARY = ['85', '84', '83', '82', '81']

// Tooth names for display
const TOOTH_NAMES: Record<string, string> = {
  // Permanent teeth - names based on position (1-8)
  '1': 'Incisivo Central',
  '2': 'Incisivo Lateral',
  '3': 'Canino',
  '4': 'Primer Premolar',
  '5': 'Segundo Premolar',
  '6': 'Primer Molar',
  '7': 'Segundo Molar',
  '8': 'Tercer Molar',
}

const QUADRANT_NAMES: Record<string, string> = {
  '1': 'Superior Derecho',
  '2': 'Superior Izquierdo',
  '3': 'Inferior Izquierdo',
  '4': 'Inferior Derecho',
  '5': 'Superior Derecho (Temporal)',
  '6': 'Superior Izquierdo (Temporal)',
  '7': 'Inferior Izquierdo (Temporal)',
  '8': 'Inferior Derecho (Temporal)',
}

// ============================================================================
// Helper Functions
// ============================================================================

function getToothName(toothNumber: string): string {
  const quadrant = toothNumber[0]
  const position = toothNumber[1]
  const quadrantName = QUADRANT_NAMES[quadrant] || ''
  const toothName = TOOTH_NAMES[position] || ''
  return `${toothNumber} - ${quadrantName} ${toothName}`
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
