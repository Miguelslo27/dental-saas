import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('foo', 'bar')
      expect(result).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'included', false && 'excluded')
      expect(result).toBe('base included')
    })

    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4')
      expect(result).toBe('py-1 px-4')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['foo', 'bar'], 'baz')
      expect(result).toBe('foo bar baz')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        'class-a': true,
        'class-b': false,
        'class-c': true,
      })
      expect(result).toBe('class-a class-c')
    })

    it('should handle undefined and null values', () => {
      const result = cn('foo', undefined, null, 'bar')
      expect(result).toBe('foo bar')
    })

    it('should return empty string for no inputs', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle complex Tailwind merging', () => {
      const result = cn(
        'text-red-500 bg-blue-500',
        'text-green-500',
        'hover:text-yellow-500'
      )
      expect(result).toBe('bg-blue-500 text-green-500 hover:text-yellow-500')
    })

    it('should merge padding and margin classes', () => {
      const result = cn('p-4 m-2', 'p-2', 'm-4')
      expect(result).toBe('p-2 m-4')
    })

    it('should handle mixed inputs', () => {
      const isActive = true
      const isDisabled = false
      const result = cn(
        'base-class',
        isActive && 'active',
        isDisabled && 'disabled',
        { 'conditional-class': true },
        ['array-class']
      )
      expect(result).toBe('base-class active conditional-class array-class')
    })
  })
})
