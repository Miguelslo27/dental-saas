import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageSelector } from './LanguageSelector'

// Mock i18next
const mockChangeLanguage = vi.fn()
const mockT = vi.fn((key: string) => key)

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'es',
      changeLanguage: mockChangeLanguage,
    },
    t: mockT,
  }),
}))

// Mock languages from i18n config
vi.mock('@/i18n', () => ({
  languages: [
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  ],
}))

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('dropdown variant', () => {
    it('should render dropdown by default', () => {
      render(<LanguageSelector />)

      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })

    it('should render all language options', () => {
      render(<LanguageSelector />)

      expect(screen.getByText('Español')).toBeInTheDocument()
      expect(screen.getByText('English')).toBeInTheDocument()
      expect(screen.getByText('العربية')).toBeInTheDocument()
    })

    it('should show current language as selected', () => {
      render(<LanguageSelector />)

      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select.value).toBe('es')
    })

    it('should change language when selecting option', () => {
      render(<LanguageSelector />)

      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'en' } })

      expect(mockChangeLanguage).toHaveBeenCalledWith('en')
    })

    it('should render globe icon', () => {
      render(<LanguageSelector />)

      const icon = document.querySelector('.lucide-globe')
      expect(icon).toBeInTheDocument()
    })

    it('should not render label by default', () => {
      render(<LanguageSelector />)

      expect(screen.queryByText('settings.language')).not.toBeInTheDocument()
    })

    it('should render label when showLabel is true', () => {
      render(<LanguageSelector showLabel={true} />)

      expect(mockT).toHaveBeenCalledWith('settings.language')
    })

    it('should apply custom className', () => {
      const { container } = render(<LanguageSelector className="custom-class" />)

      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('custom-class')
    })
  })

  describe('buttons variant', () => {
    it('should render buttons variant', () => {
      render(<LanguageSelector variant="buttons" />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(3)
    })

    it('should render language codes in buttons', () => {
      render(<LanguageSelector variant="buttons" />)

      expect(screen.getByRole('button', { name: /ES/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /EN/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /AR/i })).toBeInTheDocument()
    })

    it('should highlight current language button', () => {
      render(<LanguageSelector variant="buttons" />)

      const esButton = screen.getByRole('button', { name: /ES/i })
      expect(esButton).toHaveClass('bg-blue-600')
      expect(esButton).toHaveClass('text-white')

      const enButton = screen.getByRole('button', { name: /EN/i })
      expect(enButton).toHaveClass('bg-gray-100')
    })

    it('should change language when clicking button', () => {
      render(<LanguageSelector variant="buttons" />)

      const enButton = screen.getByRole('button', { name: /EN/i })
      fireEvent.click(enButton)

      expect(mockChangeLanguage).toHaveBeenCalledWith('en')
    })

    it('should render label when showLabel is true', () => {
      render(<LanguageSelector variant="buttons" showLabel={true} />)

      expect(mockT).toHaveBeenCalledWith('settings.language')
    })

    it('should apply custom className', () => {
      const { container } = render(<LanguageSelector variant="buttons" className="custom-class" />)

      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('custom-class')
    })

    it('should have title attribute with language name', () => {
      render(<LanguageSelector variant="buttons" />)

      const esButton = screen.getByRole('button', { name: /ES/i })
      expect(esButton).toHaveAttribute('title', 'Spanish')
    })
  })

  describe('interactions', () => {
    it('should call changeLanguage with correct code from dropdown', () => {
      render(<LanguageSelector />)

      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'ar' } })

      expect(mockChangeLanguage).toHaveBeenCalledWith('ar')
      expect(mockChangeLanguage).toHaveBeenCalledTimes(1)
    })

    it('should call changeLanguage with correct code from buttons', () => {
      render(<LanguageSelector variant="buttons" />)

      const arButton = screen.getByRole('button', { name: /AR/i })
      fireEvent.click(arButton)

      expect(mockChangeLanguage).toHaveBeenCalledWith('ar')
      expect(mockChangeLanguage).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple language changes in dropdown', () => {
      render(<LanguageSelector />)

      const select = screen.getByRole('combobox')

      fireEvent.change(select, { target: { value: 'en' } })
      fireEvent.change(select, { target: { value: 'ar' } })
      fireEvent.change(select, { target: { value: 'es' } })

      expect(mockChangeLanguage).toHaveBeenCalledTimes(3)
      expect(mockChangeLanguage).toHaveBeenNthCalledWith(1, 'en')
      expect(mockChangeLanguage).toHaveBeenNthCalledWith(2, 'ar')
      expect(mockChangeLanguage).toHaveBeenNthCalledWith(3, 'es')
    })

    it('should handle multiple language changes in buttons', () => {
      render(<LanguageSelector variant="buttons" />)

      const enButton = screen.getByRole('button', { name: /EN/i })
      const arButton = screen.getByRole('button', { name: /AR/i })

      fireEvent.click(enButton)
      fireEvent.click(arButton)

      expect(mockChangeLanguage).toHaveBeenCalledTimes(2)
      expect(mockChangeLanguage).toHaveBeenNthCalledWith(1, 'en')
      expect(mockChangeLanguage).toHaveBeenNthCalledWith(2, 'ar')
    })
  })
})
