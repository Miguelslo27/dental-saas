import { useEffect, useRef, useState } from 'react'

/**
 * Hook to automatically position dropdowns based on available viewport space.
 * Returns a ref to attach to the trigger button and a boolean indicating if the dropdown should open upward.
 */
export function useDropdownPosition(isOpen: boolean) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [openUpward, setOpenUpward] = useState(false)

  useEffect(() => {
    if (!isOpen || !buttonRef.current) {
      return
    }

    const button = buttonRef.current
    const rect = button.getBoundingClientRect()
    const viewportHeight = window.innerHeight

    // If button is in the lower 40% of the viewport, open upward
    const shouldOpenUpward = rect.bottom > viewportHeight * 0.6

    setOpenUpward(shouldOpenUpward)
  }, [isOpen])

  return { buttonRef, openUpward }
}
