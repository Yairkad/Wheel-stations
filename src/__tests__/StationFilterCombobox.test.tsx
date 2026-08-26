import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StationFilterCombobox, { filterByStation } from '@/components/StationFilterCombobox'

/**
 * StationFilterCombobox / filterByStation
 *
 * This component replaced the old district-chips filter on both /search and
 * /operator with a single shared typeahead over ALL active stations (not just
 * ones present in current results).
 */

describe('filterByStation - סינון תוצאות לפי תחנה נבחרת', () => {
  const results = [
    { id: 1, station: { id: 'st-1' } },
    { id: 2, station: { id: 'st-2' } },
    { id: 3, station: { id: 'st-1' } },
  ]

  it('returns all results unchanged when no station is selected', () => {
    expect(filterByStation(results, '')).toEqual(results)
  })

  it('filters down to only results matching the selected station id', () => {
    const filtered = filterByStation(results, 'st-1')
    expect(filtered).toHaveLength(2)
    expect(filtered.every(r => r.station.id === 'st-1')).toBe(true)
  })

  it('returns an empty array when no result matches the selected station', () => {
    expect(filterByStation(results, 'st-999')).toEqual([])
  })
})

describe('StationFilterCombobox - typeahead בחירת תחנה', () => {
  const stations = [
    { id: 'st-1', name: 'תחנה צפון' },
    { id: 'st-2', name: 'תחנה דרום' },
    { id: 'st-3', name: 'מרכז השאלה' },
  ]

  it('shows every active station when opened, even ones with no current results', () => {
    render(<StationFilterCombobox stations={stations} selectedId="" onChange={() => {}} />)
    fireEvent.focus(screen.getByPlaceholderText('סנן לפי תחנה...'))
    expect(screen.getByText('תחנה צפון')).toBeInTheDocument()
    expect(screen.getByText('תחנה דרום')).toBeInTheDocument()
    expect(screen.getByText('מרכז השאלה')).toBeInTheDocument()
  })

  it('narrows the list as the user types', () => {
    render(<StationFilterCombobox stations={stations} selectedId="" onChange={() => {}} />)
    const input = screen.getByPlaceholderText('סנן לפי תחנה...')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'צפון' } })
    expect(screen.getByText('תחנה צפון')).toBeInTheDocument()
    expect(screen.queryByText('תחנה דרום')).not.toBeInTheDocument()
  })

  it('calls onChange with the station id when an option is clicked', () => {
    let picked = ''
    render(<StationFilterCombobox stations={stations} selectedId="" onChange={(id) => { picked = id }} />)
    fireEvent.focus(screen.getByPlaceholderText('סנן לפי תחנה...'))
    fireEvent.click(screen.getByText('תחנה דרום'))
    expect(picked).toBe('st-2')
  })

  it('shows the selected station name when not focused, and clears via the x button', () => {
    let picked: string | null = null
    const { rerender } = render(<StationFilterCombobox stations={stations} selectedId="st-1" onChange={(id) => { picked = id }} />)
    expect(screen.getByDisplayValue('תחנה צפון')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button'))
    expect(picked).toBe('')
    rerender(<StationFilterCombobox stations={stations} selectedId="" onChange={() => {}} />)
    expect(screen.queryByDisplayValue('תחנה צפון')).not.toBeInTheDocument()
  })

  it('shows an empty-state message when no station matches the query', () => {
    render(<StationFilterCombobox stations={stations} selectedId="" onChange={() => {}} />)
    const input = screen.getByPlaceholderText('סנן לפי תחנה...')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'לא קיים בכלל' } })
    expect(screen.getByText('לא נמצאה תחנה')).toBeInTheDocument()
  })
})
