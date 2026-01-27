import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should not render when closed', () => {
      render(
        <ConfirmDialog
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
        />
      )

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    it('should render when open', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
        />
      )

      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it('should render default button texts', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
        />
      )

      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument()
    })

    it('should render custom button texts', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
          confirmText="Custom Confirm"
          cancelText="Custom Cancel"
        />
      )

      expect(screen.getByRole('button', { name: 'Custom Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Custom Confirm' })).toBeInTheDocument()
    })

    it('should render alert icon', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
        />
      )

      const icon = document.querySelector('.lucide-triangle-alert')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('variants', () => {
    it('should apply danger variant styles by default', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
        />
      )

      const iconContainer = document.querySelector('.bg-red-100')
      expect(iconContainer).toBeInTheDocument()
    })

    it('should apply warning variant styles', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
          variant="warning"
        />
      )

      const iconContainer = document.querySelector('.bg-yellow-100')
      expect(iconContainer).toBeInTheDocument()
    })

    it('should apply info variant styles', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
          variant="info"
        />
      )

      const iconContainer = document.querySelector('.bg-blue-100')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onClose when clicking cancel button', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
        />
      )

      const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
      expect(mockOnConfirm).not.toHaveBeenCalled()
    })

    it('should call onConfirm when clicking confirm button', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
        />
      )

      const confirmButton = screen.getByRole('button', { name: 'Confirmar' })
      fireEvent.click(confirmButton)

      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should call onClose when clicking backdrop', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
        />
      )

      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50')
      fireEvent.click(backdrop!)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should not close when clicking dialog content', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
        />
      )

      const dialog = screen.getByRole('alertdialog')
      fireEvent.click(dialog)

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should call onClose when pressing Escape key', async () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
        />
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
          isLoading={true}
        />
      )

      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should disable buttons when isLoading is true', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
          isLoading={true}
        />
      )

      const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
      const confirmButton = screen.getByRole('button', { name: 'Confirmar' })

      expect(cancelButton).toBeDisabled()
      expect(confirmButton).toBeDisabled()
    })

    it('should not close on Escape when loading', async () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
          isLoading={true}
        />
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(mockOnClose).not.toHaveBeenCalled()
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
        />
      )

      const dialog = screen.getByRole('alertdialog')

      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title')
      expect(dialog).toHaveAttribute('aria-describedby', 'confirm-dialog-description')
    })

    it('should have proper title and description ids', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test message"
        />
      )

      const title = document.getElementById('confirm-dialog-title')
      const description = document.getElementById('confirm-dialog-description')

      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Test Title')
      expect(description).toBeInTheDocument()
      expect(description).toHaveTextContent('Test message')
    })
  })
})
