import { describe, it, expect } from 'vitest'
import { t, formatDate, formatTime, formatDateTime, translateStatus, translateGender } from './index.js'

describe('Translation Functions', () => {
  describe('t() - Basic translation', () => {
    it('should translate simple keys in Spanish', () => {
      expect(t('es', 'pdf.patient.title')).toBe('Historial Médico del Paciente')
      expect(t('es', 'pdf.appointment.receipt')).toBe('Recibo de Cita')
    })

    it('should translate simple keys in English', () => {
      expect(t('en', 'pdf.patient.title')).toBe('Patient Medical History')
      expect(t('en', 'pdf.appointment.receipt')).toBe('Appointment Receipt')
    })

    it('should translate simple keys in Arabic', () => {
      expect(t('ar', 'pdf.patient.title')).toBe('التاريخ الطبي للمريض')
      expect(t('ar', 'pdf.appointment.receipt')).toBe('إيصال الموعد')
    })

    it('should interpolate variables', () => {
      expect(t('es', 'email.welcome.greeting', { firstName: 'Juan' })).toBe('Hola Juan,')
      expect(t('en', 'email.welcome.greeting', { firstName: 'John' })).toBe('Hello John,')
      expect(t('ar', 'email.welcome.greeting', { firstName: 'أحمد' })).toBe('مرحباً أحمد،')
    })

    it('should interpolate with multiple variables', () => {
      const result = t('es', 'pdf.table.andMore', { count: 5 })
      expect(result).toBe('... y 5 citas más')
    })

    it('should return key if translation is missing', () => {
      expect(t('es', 'nonexistent.key')).toBe('nonexistent.key')
    })
  })

  describe('formatDate() - Date formatting', () => {
    const testDate = new Date('2024-01-15T10:30:00Z')

    it('should format dates with correct locale (long format)', () => {
      const esDate = formatDate(testDate, 'es', 'UTC', 'long')
      const enDate = formatDate(testDate, 'en', 'UTC', 'long')
      const arDate = formatDate(testDate, 'ar', 'UTC', 'long')

      expect(esDate).toContain('enero')
      expect(enDate).toContain('January')
      expect(arDate).toContain('يناير')
    })

    it('should format dates with correct locale (short format)', () => {
      const esDate = formatDate(testDate, 'es', 'UTC', 'short')
      const enDate = formatDate(testDate, 'en', 'UTC', 'short')

      // Short format should still contain the day and year
      expect(esDate).toContain('15')
      expect(esDate).toContain('2024')
      expect(enDate).toContain('15')
      expect(enDate).toContain('2024')
    })
  })

  describe('formatTime() - Time formatting', () => {
    const testDate = new Date('2024-01-15T10:30:00Z')

    it('should format time with correct locale', () => {
      const time = formatTime(testDate, 'es', 'UTC')
      expect(time).toBeTruthy()
      // Time format varies by locale, just ensure it returns something
    })
  })

  describe('formatDateTime() - Date and time formatting', () => {
    const testDate = new Date('2024-01-15T10:30:00Z')

    it('should format date and time together', () => {
      const esDateTime = formatDateTime(testDate, 'es', 'UTC')
      const enDateTime = formatDateTime(testDate, 'en', 'UTC')

      expect(esDateTime).toContain('enero')
      expect(enDateTime).toContain('January')
    })
  })

  describe('translateStatus() - Appointment status', () => {
    it('should translate status in Spanish', () => {
      expect(translateStatus('SCHEDULED', 'es')).toBe('Programada')
      expect(translateStatus('COMPLETED', 'es')).toBe('Completada')
      expect(translateStatus('CANCELLED', 'es')).toBe('Cancelada')
    })

    it('should translate status in English', () => {
      expect(translateStatus('SCHEDULED', 'en')).toBe('Scheduled')
      expect(translateStatus('COMPLETED', 'en')).toBe('Completed')
      expect(translateStatus('CANCELLED', 'en')).toBe('Cancelled')
    })

    it('should translate status in Arabic', () => {
      expect(translateStatus('SCHEDULED', 'ar')).toBe('مجدولة')
      expect(translateStatus('COMPLETED', 'ar')).toBe('مكتملة')
      expect(translateStatus('CANCELLED', 'ar')).toBe('ملغاة')
    })
  })

  describe('translateGender() - Gender translation', () => {
    it('should translate gender in Spanish', () => {
      expect(translateGender('MALE', 'es')).toBe('Masculino')
      expect(translateGender('FEMALE', 'es')).toBe('Femenino')
      expect(translateGender('OTHER', 'es')).toBe('Otro')
    })

    it('should translate gender in English', () => {
      expect(translateGender('MALE', 'en')).toBe('Male')
      expect(translateGender('FEMALE', 'en')).toBe('Female')
      expect(translateGender('OTHER', 'en')).toBe('Other')
    })

    it('should translate gender in Arabic', () => {
      expect(translateGender('MALE', 'ar')).toBe('ذكر')
      expect(translateGender('FEMALE', 'ar')).toBe('أنثى')
      expect(translateGender('OTHER', 'ar')).toBe('آخر')
    })
  })
})
