import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AccessibilityWidget from '@/components/AccessibilityWidget'

/**
 * AccessibilityWidget
 *
 * New, globally-mounted (layout.tsx) widget. It scales the whole app via
 * data-a11y-* attributes on <html>, consumed by globals.css. Because it's
 * global, a regression here silently affects every single page in the app.
 */

describe('AccessibilityWidget - נגישות', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-a11y-fontsize')
    document.documentElement.removeAttribute('data-a11y-contrast')
    document.documentElement.removeAttribute('data-a11y-grayscale')
    document.documentElement.removeAttribute('data-a11y-links')
    document.documentElement.removeAttribute('data-a11y-readable')
    document.documentElement.removeAttribute('data-a11y-motion')
  })

  it('applies default attributes to <html> on mount without opening the panel', async () => {
    render(<AccessibilityWidget />)
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-a11y-fontsize')).toBe('0')
    })
    expect(document.documentElement.getAttribute('data-a11y-contrast')).toBe('normal')
    expect(document.documentElement.getAttribute('data-a11y-motion')).toBe('normal')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the panel when the floating button is clicked, and closes on its own close button', () => {
    render(<AccessibilityWidget />)
    fireEvent.click(screen.getByLabelText('פתח תפריט נגישות'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('סגור תפריט נגישות'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the panel on Escape and returns focus to the toggle button', () => {
    render(<AccessibilityWidget />)
    const toggleBtn = screen.getByLabelText('פתח תפריט נגישות')
    fireEvent.click(toggleBtn)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(toggleBtn)
  })

  it('increases font size up to a max of 3 steps (137.5%) and disables the + button there', async () => {
    render(<AccessibilityWidget />)
    fireEvent.click(screen.getByLabelText('פתח תפריט נגישות'))
    const increase = screen.getByLabelText('הגדל טקסט')

    fireEvent.click(increase)
    fireEvent.click(increase)
    fireEvent.click(increase)
    expect(screen.getByText('137.5%')).toBeInTheDocument()
    expect(increase).toBeDisabled()

    // one more click past the max must not overshoot
    fireEvent.click(increase)
    expect(screen.getByText('137.5%')).toBeInTheDocument()
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-a11y-fontsize')).toBe('3')
    })
  })

  it('decreasing font size stops at 0 (100%) and disables the - button there', () => {
    render(<AccessibilityWidget />)
    fireEvent.click(screen.getByLabelText('פתח תפריט נגישות'))
    const decrease = screen.getByLabelText('הקטן טקסט')
    expect(decrease).toBeDisabled()
    fireEvent.click(decrease)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('selecting a contrast option marks it pressed and sets data-a11y-contrast', async () => {
    render(<AccessibilityWidget />)
    fireEvent.click(screen.getByLabelText('פתח תפריט נגישות'))
    fireEvent.click(screen.getByText('היפוך צבעים'))

    expect(screen.getByText('היפוך צבעים')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('רגיל')).toHaveAttribute('aria-pressed', 'false')
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-a11y-contrast')).toBe('invert')
    })
  })

  it('toggles grayscale/links/readable/stopMotion independently', async () => {
    render(<AccessibilityWidget />)
    fireEvent.click(screen.getByLabelText('פתח תפריט נגישות'))

    fireEvent.click(screen.getByText('גווני אפור'))
    fireEvent.click(screen.getByText('עצירת אנימציות'))

    expect(screen.getByText('גווני אפור')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('עצירת אנימציות')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('הדגשת קישורים')).toHaveAttribute('aria-pressed', 'false')

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-a11y-grayscale')).toBe('true')
      expect(document.documentElement.getAttribute('data-a11y-motion')).toBe('stop')
      expect(document.documentElement.getAttribute('data-a11y-links')).toBe('false')
    })
  })

  it('persists preferences to localStorage and reloads them on the next mount', async () => {
    const { unmount } = render(<AccessibilityWidget />)
    fireEvent.click(screen.getByLabelText('פתח תפריט נגישות'))
    fireEvent.click(screen.getByLabelText('הגדל טקסט'))
    fireEvent.click(screen.getByText('ניגודיות גבוהה'))

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('wheels_a11y_prefs_v1')!).fontStep).toBe(1)
    })
    unmount()

    render(<AccessibilityWidget />)
    fireEvent.click(screen.getByLabelText('פתח תפריט נגישות'))
    expect(screen.getByText('112.5%')).toBeInTheDocument()
    expect(screen.getByText('ניגודיות גבוהה')).toHaveAttribute('aria-pressed', 'true')
  })

  it('resets every preference back to defaults via "איפוס הכל"', async () => {
    render(<AccessibilityWidget />)
    fireEvent.click(screen.getByLabelText('פתח תפריט נגישות'))
    fireEvent.click(screen.getByLabelText('הגדל טקסט'))
    fireEvent.click(screen.getByText('גווני אפור'))
    fireEvent.click(screen.getByText('היפוך צבעים'))

    fireEvent.click(screen.getByText('איפוס הכל'))

    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('רגיל')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('גווני אפור')).toHaveAttribute('aria-pressed', 'false')
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-a11y-fontsize')).toBe('0')
      expect(document.documentElement.getAttribute('data-a11y-contrast')).toBe('normal')
      expect(document.documentElement.getAttribute('data-a11y-grayscale')).toBe('false')
    })
  })

  it('recovers gracefully from corrupted localStorage instead of crashing', () => {
    localStorage.setItem('wheels_a11y_prefs_v1', '{not valid json')
    expect(() => render(<AccessibilityWidget />)).not.toThrow()
    fireEvent.click(screen.getByLabelText('פתח תפריט נגישות'))
    expect(screen.getByText('100%')).toBeInTheDocument()
  })
})
