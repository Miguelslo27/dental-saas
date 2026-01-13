import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

interface ToothNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (note: string) => void
  onDelete?: () => void
  toothNumber: string
  currentNote?: string
  isLoading?: boolean
}

// ============================================================================
// Helper Functions
// ============================================================================

const TOOTH_NAMES: Record<string, string> = {
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

function getToothDisplayName(toothNumber: string): string {
  const quadrant = toothNumber[0]
  const position = toothNumber[1]
  const quadrantName = QUADRANT_NAMES[quadrant] || ''
  const toothName = TOOTH_NAMES[position] || ''
  return `${quadrantName} - ${toothName}`
}

// ============================================================================
// Component
// ============================================================================

export default function ToothNoteModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  toothNumber,
  currentNote = '',
  isLoading = false,
}: ToothNoteModalProps) {
  const [note, setNote] = useState(currentNote)

  useEffect(() => {
    setNote(currentNote)
  }, [currentNote, toothNumber])

  if (!isOpen) return null

  const handleSave = () => {
    onSave(note.trim())
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Diente #{toothNumber}
            </h2>
            <p className="text-sm text-gray-500">
              {getToothDisplayName(toothNumber)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <label htmlFor="tooth-note" className="block text-sm font-medium text-gray-700 mb-2">
            Notas clínicas
          </label>
          <textarea
            id="tooth-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Escriba observaciones sobre este diente..."
            rows={5}
            maxLength={1000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            autoFocus
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {note.length}/1000
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div>
            {currentNote && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                Eliminar nota
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || (!note.trim() && !currentNote)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
