import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import HomePage from './HomePage'

describe('HomePage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should render the title', () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } }),
    } as Response)

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    expect(screen.getByText('🦷 Alveo System')).toBeInTheDocument()
    expect(screen.getByText('Sistema de gestión para clínicas dentales')).toBeInTheDocument()
  })

  it('should show loading state initially', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => { }))

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('should display health data when API responds', async () => {
    const mockHealth = {
      success: true,
      data: { status: 'ok', timestamp: '2025-12-29T00:00:00.000Z' },
    }

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHealth),
    } as Response)

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/"status": "ok"/)).toBeInTheDocument()
    })
  })

  it('should show error when API fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/)).toBeInTheDocument()
    })
  })
})
