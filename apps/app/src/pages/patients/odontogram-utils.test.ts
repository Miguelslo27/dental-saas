import { describe, it, expect } from 'vitest'
import { remapPrimaryFdi } from './odontogram-utils'

describe('remapPrimaryFdi', () => {
  it('maps quadrant 1 to 5 (upper right)', () => {
    expect(remapPrimaryFdi('11')).toBe('51')
    expect(remapPrimaryFdi('12')).toBe('52')
    expect(remapPrimaryFdi('15')).toBe('55')
  })

  it('maps quadrant 2 to 6 (upper left)', () => {
    expect(remapPrimaryFdi('21')).toBe('61')
    expect(remapPrimaryFdi('25')).toBe('65')
  })

  it('maps quadrant 3 to 7 (lower left)', () => {
    expect(remapPrimaryFdi('31')).toBe('71')
    expect(remapPrimaryFdi('35')).toBe('75')
  })

  it('maps quadrant 4 to 8 (lower right)', () => {
    expect(remapPrimaryFdi('41')).toBe('81')
    expect(remapPrimaryFdi('45')).toBe('85')
  })

  it('leaves already-primary FDIs untouched', () => {
    expect(remapPrimaryFdi('51')).toBe('51')
    expect(remapPrimaryFdi('85')).toBe('85')
  })

  it('returns input unchanged for malformed strings', () => {
    expect(remapPrimaryFdi('')).toBe('')
    expect(remapPrimaryFdi('1')).toBe('1')
    expect(remapPrimaryFdi('111')).toBe('111')
    expect(remapPrimaryFdi('ab')).toBe('ab')
  })
})
