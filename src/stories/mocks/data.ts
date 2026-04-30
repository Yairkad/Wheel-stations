export const STATION_ID = 'demo-station-001'
export const OTHER_STATION_ID = 'demo-station-visitor-ref'

// Minimal session for a different station — prevents redirect-to-login while keeping isManager=false
export const VISITOR_SESSION = {
  'station_session_demo-station-visitor-ref': {
    manager: { id: 'visitor-ref', full_name: 'מבקר', phone: '' },
    stationId: OTHER_STATION_ID,
    timestamp: Date.now(),
    version: 4,
  },
}

export const mockStation = {
  station: {
    id: STATION_ID,
    name: 'תחנת גלגלים תל אביב מרכז',
    address: 'רוטשילד 22, תל אביב',
    district: 'tel_aviv',
    deposit_amount: 200,
    payment_methods: {
      cash: true,
      bit: { enabled: true, phone: '0501234567' },
      paybox: { enabled: false, phone: '' },
    },
    notification_emails: [],
    max_managers: 3,
    totalWheels: 6,
    availableWheels: 4,
    wheel_station_managers: [
      { id: 'mgr-1', full_name: 'יוסי כהן', phone: '0501234567', role: 'מנהל תחנה', is_primary: true },
      { id: 'mgr-2', full_name: 'מיכל לוי', phone: '0507654321', role: 'מנהל תחנה', is_primary: false },
    ],
    wheels: [
      { id: 'w1', wheel_number: '101', rim_size: '16', bolt_count: 5, bolt_spacing: 114.3, category: 'שיגרתי', is_donut: false, notes: null, is_available: true, custom_deposit: null, temporarily_unavailable: false },
      { id: 'w2', wheel_number: '102', rim_size: '17', bolt_count: 5, bolt_spacing: 114.3, category: 'ספורט', is_donut: false, notes: 'מצב מצוין', is_available: true, custom_deposit: null, temporarily_unavailable: false },
      { id: 'w3', wheel_number: '103', rim_size: '15', bolt_count: 4, bolt_spacing: 100, category: 'שיגרתי', is_donut: false, notes: null, is_available: true, custom_deposit: null, temporarily_unavailable: false },
      { id: 'w4', wheel_number: '104', rim_size: '16', bolt_count: 4, bolt_spacing: 108, category: null, is_donut: true, notes: 'דוגנאט', is_available: true, custom_deposit: 100, temporarily_unavailable: false },
      { id: 'w5', wheel_number: '105', rim_size: '18', bolt_count: 5, bolt_spacing: 120, category: 'שיגרתי', is_donut: false, notes: null, is_available: false, custom_deposit: null, temporarily_unavailable: false,
        current_borrow: { id: 'b1', borrower_name: 'אבי דוד', borrower_phone: '0521111111', vehicle_model: 'Toyota Corolla', borrow_date: '2026-04-20', expected_return_date: '2026-05-01', deposit_type: 'cash', deposit_details: '200₪', is_signed: true } },
      { id: 'w6', wheel_number: '106', rim_size: '17', bolt_count: 5, bolt_spacing: 112, category: 'שיגרתי', is_donut: false, notes: null, is_available: false, custom_deposit: null, temporarily_unavailable: false,
        current_borrow: { id: 'b2', borrower_name: 'רחל גרין', borrower_phone: '0532222222', vehicle_model: 'Hyundai i30', borrow_date: '2026-04-25', expected_return_date: null, deposit_type: 'bit', deposit_details: null, is_signed: false } },
    ],
  }
}

export const mockDeletedWheels = { deletedWheels: [] }

export const mockDistricts = { districts: [] }

export const mockBorrows = {
  borrows: [
    { id: 'b1', wheel_id: 'w5', borrower_name: 'אבי דוד', borrower_phone: '0521111111', vehicle_model: 'Toyota Corolla', borrow_date: '2026-04-20', expected_return_date: '2026-05-01', actual_return_date: null, deposit_type: 'cash', deposit_details: '200₪', status: 'borrowed', is_signed: true, created_at: '2026-04-20T10:00:00', wheels: { wheel_number: '105', rim_size: '18', bolt_count: 5, bolt_spacing: 120 } },
    { id: 'b2', wheel_id: 'w6', borrower_name: 'רחל גרין', borrower_phone: '0532222222', vehicle_model: 'Hyundai i30', borrow_date: '2026-04-25', expected_return_date: null, actual_return_date: null, deposit_type: 'bit', deposit_details: null, status: 'borrowed', is_signed: false, created_at: '2026-04-25T14:00:00', wheels: { wheel_number: '106', rim_size: '17', bolt_count: 5, bolt_spacing: 112 } },
    { id: 'b3', wheel_id: 'w3', borrower_name: 'משה שפירא', borrower_phone: '0543333333', vehicle_model: 'Mazda 3', borrow_date: '2026-03-10', expected_return_date: '2026-03-20', actual_return_date: '2026-03-18', deposit_type: 'cash', deposit_details: '200₪', status: 'returned', is_signed: true, created_at: '2026-03-10T09:00:00', wheels: { wheel_number: '103', rim_size: '15', bolt_count: 4, bolt_spacing: 100 } },
  ]
}

export const mockStations = {
  stations: [
    { id: STATION_ID, name: 'תחנת גלגלים תל אביב מרכז', address: 'רוטשילד 22, תל אביב', district: 'tel_aviv', availableWheels: 4, totalWheels: 6, wheel_station_managers: [{ full_name: 'יוסי כהן', phone: '0501234567', is_primary: true }] },
    { id: 'demo-station-002', name: 'תחנת גלגלים רמת גן', address: 'ביאליק 5, רמת גן', district: 'tel_aviv', availableWheels: 2, totalWheels: 4, wheel_station_managers: [{ full_name: 'דנה מזרחי', phone: '0509876543', is_primary: true }] },
    { id: 'demo-station-003', name: 'תחנת גלגלים ירושלים', address: 'יפו 10, ירושלים', district: 'jerusalem', availableWheels: 0, totalWheels: 3, wheel_station_managers: [{ full_name: 'אורן שמש', phone: '0508765432', is_primary: true }] },
  ]
}

export const OPERATOR_SESSION = {
  user: { id: 'op-mgr-1', full_name: 'שרה לוינשטיין', phone: '0501112233', title: 'מנהל מוקד', is_primary: true },
  role: 'manager',
  callCenterId: 'cc-001',
  callCenterName: 'מוקד ראשי',
  timestamp: Date.now(),
  version: 4
}

export const mockOperators = {
  operators: [
    { id: 'op-1', full_name: 'נועם אברהם', phone: '0541234567', code: 'NOA1', is_active: true, created_at: '2026-01-10T00:00:00' },
    { id: 'op-2', full_name: 'תמר כץ', phone: '0552345678', code: 'TAM2', is_active: true, created_at: '2026-02-15T00:00:00' },
    { id: 'op-3', full_name: 'גיל בר', phone: '0563456789', code: 'GIL3', is_active: false, created_at: '2026-03-01T00:00:00' },
  ]
}

export const mockCallCenterManagers = {
  managers: [
    { id: 'op-mgr-1', full_name: 'שרה לוינשטיין', phone: '0501112233', title: 'מנהל מוקד', is_primary: true, is_active: true },
    { id: 'op-mgr-2', full_name: 'בני פרידמן', phone: '0502223344', title: 'מנהל מוקד משנה', is_primary: false, is_active: true },
  ]
}

export const mockHistory = {
  history: [
    { id: 'h1', created_at: '2026-04-28T10:30:00', operator_name: 'נועם אברהם', station_name: 'תחנת גלגלים תל אביב מרכז', borrower_name: 'אבי דוד', borrower_phone: '0521111111' },
    { id: 'h2', created_at: '2026-04-27T14:00:00', operator_name: 'תמר כץ', station_name: 'תחנת גלגלים רמת גן', borrower_name: 'רחל גרין', borrower_phone: '0532222222' },
    { id: 'h3', created_at: '2026-04-26T09:15:00', operator_name: 'נועם אברהם', station_name: 'תחנת גלגלים ירושלים', borrower_name: null, borrower_phone: null },
  ]
}

export const STATION_MANAGER_SESSION = {
  manager: { id: 'mgr-1', full_name: 'יוסי כהן', phone: '0501234567', type: 'wheel_station' },
  stationId: STATION_ID,
  stationName: 'תחנת גלגלים תל אביב מרכז',
  password: 'demo1234',
  timestamp: Date.now(),
  version: 4
}
