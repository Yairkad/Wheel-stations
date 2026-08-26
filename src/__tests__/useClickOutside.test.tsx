import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { useRef } from 'react'
import { useClickOutside } from '@/hooks/useClickOutside'

function TestHarness({ onOutside, enabled }: { onOutside: () => void; enabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, onOutside, enabled)
  return (
    <div>
      <div data-testid="inside" ref={ref}>inside</div>
      <div data-testid="outside">outside</div>
    </div>
  )
}

describe('useClickOutside - סגירת תפריטים/מגירות בלחיצה מחוץ לרכיב', () => {
  it('calls onOutside when mousedown happens outside the ref element', () => {
    const onOutside = vi.fn()
    const { getByTestId } = render(<TestHarness onOutside={onOutside} />)
    getByTestId('outside').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(onOutside).toHaveBeenCalledTimes(1)
  })

  it('does not call onOutside when mousedown happens inside the ref element', () => {
    const onOutside = vi.fn()
    const { getByTestId } = render(<TestHarness onOutside={onOutside} />)
    getByTestId('inside').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(onOutside).not.toHaveBeenCalled()
  })

  it('does not attach a listener at all when enabled=false', () => {
    const onOutside = vi.fn()
    const { getByTestId } = render(<TestHarness onOutside={onOutside} enabled={false} />)
    getByTestId('outside').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(onOutside).not.toHaveBeenCalled()
  })

  it('stops listening after the component unmounts', () => {
    const onOutside = vi.fn()
    const { unmount } = render(<TestHarness onOutside={onOutside} />)
    unmount()
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(onOutside).not.toHaveBeenCalled()
  })
})
