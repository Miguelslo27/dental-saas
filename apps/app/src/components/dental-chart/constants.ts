// ============================================================================
// Dental Chart Constants - ISO 3950 (FDI) Notation
// ============================================================================

// Permanent teeth (32 total)
export const UPPER_RIGHT_PERMANENT = ['18', '17', '16', '15', '14', '13', '12', '11']
export const UPPER_LEFT_PERMANENT = ['21', '22', '23', '24', '25', '26', '27', '28']
export const LOWER_LEFT_PERMANENT = ['31', '32', '33', '34', '35', '36', '37', '38']
export const LOWER_RIGHT_PERMANENT = ['48', '47', '46', '45', '44', '43', '42', '41']

// Primary teeth (20 total)
export const UPPER_RIGHT_PRIMARY = ['55', '54', '53', '52', '51']
export const UPPER_LEFT_PRIMARY = ['61', '62', '63', '64', '65']
export const LOWER_LEFT_PRIMARY = ['71', '72', '73', '74', '75']
export const LOWER_RIGHT_PRIMARY = ['85', '84', '83', '82', '81']

// Tooth names for display (position 1-8)
export const TOOTH_NAMES: Record<string, string> = {
  '1': 'Incisivo Central',
  '2': 'Incisivo Lateral',
  '3': 'Canino',
  '4': 'Primer Premolar',
  '5': 'Segundo Premolar',
  '6': 'Primer Molar',
  '7': 'Segundo Molar',
  '8': 'Tercer Molar',
}

// Quadrant names
export const QUADRANT_NAMES: Record<string, string> = {
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

/**
 * Get full tooth name including quadrant and tooth type
 * @example getToothName('11') => '11 - Superior Derecho Incisivo Central'
 */
export function getToothName(toothNumber: string): string {
  const quadrant = toothNumber[0]
  const position = toothNumber[1]
  const quadrantName = QUADRANT_NAMES[quadrant] || ''
  const toothName = TOOTH_NAMES[position] || ''
  return `${toothNumber} - ${quadrantName} ${toothName}`
}

/**
 * Get display name for tooth (quadrant - tooth type)
 * @example getToothDisplayName('11') => 'Superior Derecho - Incisivo Central'
 */
export function getToothDisplayName(toothNumber: string): string {
  const quadrant = toothNumber[0]
  const position = toothNumber[1]
  const quadrantName = QUADRANT_NAMES[quadrant] || ''
  const toothName = TOOTH_NAMES[position] || ''
  return `${quadrantName} - ${toothName}`
}
