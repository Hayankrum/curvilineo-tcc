import { describe, it, expect } from 'vitest'
import { primeiroNome } from '@/lib/utils'

describe('primeiroNome', () => {
  it('should return first name from full name', () => {
    expect(primeiroNome('João Silva')).toBe('João')
  })

  it('should return single name when no space', () => {
    expect(primeiroNome('Maria')).toBe('Maria')
  })

  it('should return first word when multiple spaces', () => {
    expect(primeiroNome('João da Silva')).toBe('João')
  })

  it('should handle empty string', () => {
    expect(primeiroNome('')).toBe('')
  })

  it('should handle name with leading space', () => {
    expect(primeiroNome('  João')).toBe('')
  })
})
