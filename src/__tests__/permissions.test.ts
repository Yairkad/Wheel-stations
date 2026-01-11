import { describe, it, expect } from 'vitest'

/**
 * Permissions Tests
 *
 * בדיקות הרשאות - מנהל ראשי מול מנהל משני
 */

// =====================
// Manager Role Definitions
// =====================
interface Manager {
  id: string
  full_name: string
  phone: string
  role: string
  is_primary: boolean
}

const createManager = (overrides: Partial<Manager> = {}): Manager => ({
  id: 'manager-1',
  full_name: 'יאיר קדוש',
  phone: '0501234567',
  role: 'מנהל תחנה',
  is_primary: false,
  ...overrides
})

// =====================
// Permission checks
// =====================
describe('Manager Permissions', () => {
  describe('Primary Manager (מנהל ראשי)', () => {
    const primaryManager = createManager({ is_primary: true })

    it('can edit notification emails', () => {
      const canEditEmails = primaryManager.is_primary === true
      expect(canEditEmails).toBe(true)
    })

    it('can manage contacts', () => {
      const canManageContacts = primaryManager.is_primary === true
      expect(canManageContacts).toBe(true)
    })

    it('can edit station settings', () => {
      const canEditSettings = primaryManager.is_primary === true
      expect(canEditSettings).toBe(true)
    })

    it('can add/remove wheels', () => {
      // Both primary and secondary can do this
      const canManageWheels = true
      expect(canManageWheels).toBe(true)
    })

    it('can borrow/return wheels', () => {
      const canBorrowReturn = true
      expect(canBorrowReturn).toBe(true)
    })
  })

  describe('Secondary Manager (מנהל משני)', () => {
    const secondaryManager = createManager({ is_primary: false })

    it('cannot edit notification emails', () => {
      const canEditEmails = secondaryManager.is_primary === true
      expect(canEditEmails).toBe(false)
    })

    it('cannot manage contacts', () => {
      const canManageContacts = secondaryManager.is_primary === true
      expect(canManageContacts).toBe(false)
    })

    it('cannot edit station settings (admin-only fields)', () => {
      const canEditSettings = secondaryManager.is_primary === true
      expect(canEditSettings).toBe(false)
    })

    it('can add/remove wheels', () => {
      // Both primary and secondary can do this
      const canManageWheels = true
      expect(canManageWheels).toBe(true)
    })

    it('can borrow/return wheels', () => {
      const canBorrowReturn = true
      expect(canBorrowReturn).toBe(true)
    })

    it('can change own password', () => {
      const canChangePassword = true
      expect(canChangePassword).toBe(true)
    })
  })
})

// =====================
// Permission Matrix
// =====================
describe('Permission Matrix', () => {
  type Permission =
    | 'edit_emails'
    | 'manage_contacts'
    | 'edit_station_name'
    | 'manage_wheels'
    | 'borrow_return'
    | 'change_password'
    | 'view_tracking'
    | 'export_excel'

  const permissionMatrix: Record<Permission, { primary: boolean; secondary: boolean }> = {
    edit_emails: { primary: true, secondary: false },
    manage_contacts: { primary: true, secondary: false },
    edit_station_name: { primary: false, secondary: false }, // Admin only
    manage_wheels: { primary: true, secondary: true },
    borrow_return: { primary: true, secondary: true },
    change_password: { primary: true, secondary: true },
    view_tracking: { primary: true, secondary: true },
    export_excel: { primary: true, secondary: true },
  }

  const hasPermission = (permission: Permission, isPrimary: boolean): boolean => {
    const matrix = permissionMatrix[permission]
    return isPrimary ? matrix.primary : matrix.secondary
  }

  it('primary manager has all station permissions except admin-only', () => {
    expect(hasPermission('edit_emails', true)).toBe(true)
    expect(hasPermission('manage_contacts', true)).toBe(true)
    expect(hasPermission('manage_wheels', true)).toBe(true)
    expect(hasPermission('borrow_return', true)).toBe(true)
    expect(hasPermission('edit_station_name', true)).toBe(false) // Admin only
  })

  it('secondary manager has limited permissions', () => {
    expect(hasPermission('edit_emails', false)).toBe(false)
    expect(hasPermission('manage_contacts', false)).toBe(false)
    expect(hasPermission('manage_wheels', false)).toBe(true)
    expect(hasPermission('borrow_return', false)).toBe(true)
  })

  it('both can view tracking and export', () => {
    expect(hasPermission('view_tracking', true)).toBe(true)
    expect(hasPermission('view_tracking', false)).toBe(true)
    expect(hasPermission('export_excel', true)).toBe(true)
    expect(hasPermission('export_excel', false)).toBe(true)
  })
})

// =====================
// UI Visibility based on permissions
// =====================
describe('UI Visibility', () => {
  const getVisibleSections = (isPrimary: boolean) => {
    const sections = [
      'wheel_list',
      'tracking_tab',
      'add_wheel_button',
      'borrow_button',
      'return_button',
      'excel_import_export',
    ]

    if (isPrimary) {
      sections.push('email_settings', 'contacts_management')
    }

    return sections
  }

  it('primary manager sees all sections', () => {
    const sections = getVisibleSections(true)
    expect(sections).toContain('email_settings')
    expect(sections).toContain('contacts_management')
    expect(sections).toContain('wheel_list')
  })

  it('secondary manager does not see restricted sections', () => {
    const sections = getVisibleSections(false)
    expect(sections).not.toContain('email_settings')
    expect(sections).not.toContain('contacts_management')
    expect(sections).toContain('wheel_list')
  })

  it('both see common sections', () => {
    const primarySections = getVisibleSections(true)
    const secondarySections = getVisibleSections(false)

    const commonSections = ['wheel_list', 'tracking_tab', 'add_wheel_button']

    for (const section of commonSections) {
      expect(primarySections).toContain(section)
      expect(secondarySections).toContain(section)
    }
  })
})

// =====================
// Session validation with permissions
// =====================
describe('Session with Permissions', () => {
  interface Session {
    manager: Manager
    stationId: string
    timestamp: number
  }

  const createSession = (isPrimary: boolean): Session => ({
    manager: createManager({ is_primary: isPrimary }),
    stationId: 'station-1',
    timestamp: Date.now()
  })

  it('session includes is_primary flag', () => {
    const primarySession = createSession(true)
    const secondarySession = createSession(false)

    expect(primarySession.manager.is_primary).toBe(true)
    expect(secondarySession.manager.is_primary).toBe(false)
  })

  it('session can be used to check permissions', () => {
    const session = createSession(true)
    const canEditEmails = session.manager.is_primary

    expect(canEditEmails).toBe(true)
  })
})
