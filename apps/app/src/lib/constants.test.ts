import { describe, it, expect } from 'vitest'
import { ROLE_HIERARCHY, PASSWORD_REGEX } from './constants'

describe('constants', () => {
  describe('ROLE_HIERARCHY', () => {
    it('should have correct hierarchy order', () => {
      expect(ROLE_HIERARCHY.OWNER).toBeGreaterThan(ROLE_HIERARCHY.ADMIN)
      expect(ROLE_HIERARCHY.ADMIN).toBeGreaterThan(ROLE_HIERARCHY.CLINIC_ADMIN)
      expect(ROLE_HIERARCHY.CLINIC_ADMIN).toBeGreaterThan(ROLE_HIERARCHY.DOCTOR)
      expect(ROLE_HIERARCHY.DOCTOR).toBeGreaterThan(ROLE_HIERARCHY.STAFF)
    })

    it('should have all roles defined', () => {
      expect(ROLE_HIERARCHY).toHaveProperty('OWNER')
      expect(ROLE_HIERARCHY).toHaveProperty('ADMIN')
      expect(ROLE_HIERARCHY).toHaveProperty('CLINIC_ADMIN')
      expect(ROLE_HIERARCHY).toHaveProperty('DOCTOR')
      expect(ROLE_HIERARCHY).toHaveProperty('STAFF')
    })

    it('should have correct values', () => {
      expect(ROLE_HIERARCHY.OWNER).toBe(5)
      expect(ROLE_HIERARCHY.ADMIN).toBe(4)
      expect(ROLE_HIERARCHY.CLINIC_ADMIN).toBe(3)
      expect(ROLE_HIERARCHY.DOCTOR).toBe(2)
      expect(ROLE_HIERARCHY.STAFF).toBe(1)
    })
  })

  describe('PASSWORD_REGEX', () => {
    it('should accept valid passwords', () => {
      expect(PASSWORD_REGEX.test('Password1!')).toBe(true)
      expect(PASSWORD_REGEX.test('MySecure@Pass99')).toBe(true)
      expect(PASSWORD_REGEX.test('Test$1234')).toBe(true)
      expect(PASSWORD_REGEX.test('Abcd!234')).toBe(true)
    })

    it('should reject passwords without lowercase', () => {
      expect(PASSWORD_REGEX.test('PASSWORD1!')).toBe(false)
    })

    it('should reject passwords without uppercase', () => {
      expect(PASSWORD_REGEX.test('password1!')).toBe(false)
    })

    it('should reject passwords without digit', () => {
      expect(PASSWORD_REGEX.test('Password!')).toBe(false)
    })

    it('should reject passwords without special character', () => {
      expect(PASSWORD_REGEX.test('Password1')).toBe(false)
    })

    it('should reject passwords shorter than 8 characters', () => {
      expect(PASSWORD_REGEX.test('Pass1!')).toBe(false)
      expect(PASSWORD_REGEX.test('Ab1!')).toBe(false)
    })

    it('should accept passwords with exactly 8 characters', () => {
      expect(PASSWORD_REGEX.test('Abcde1!a')).toBe(true)
    })

    it('should accept all allowed special characters', () => {
      expect(PASSWORD_REGEX.test('Password@1')).toBe(true)
      expect(PASSWORD_REGEX.test('Password$1')).toBe(true)
      expect(PASSWORD_REGEX.test('Password!1')).toBe(true)
      expect(PASSWORD_REGEX.test('Password%1')).toBe(true)
      expect(PASSWORD_REGEX.test('Password*1')).toBe(true)
      expect(PASSWORD_REGEX.test('Password?1')).toBe(true)
      expect(PASSWORD_REGEX.test('Password&1')).toBe(true)
    })
  })
})
