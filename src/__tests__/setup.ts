import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  },
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Map-backed localStorage mock — actually stores data so persistence logic is testable
const _storage = new Map<string, string>()
const localStorageMock = {
  getItem: vi.fn((key: string) => _storage.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => { _storage.set(key, value) }),
  removeItem: vi.fn((key: string) => { _storage.delete(key) }),
  clear: vi.fn(() => { _storage.clear() }),
  key: vi.fn((index: number) => [..._storage.keys()][index] ?? null),
  get length() { return _storage.size },
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock fetch with a sensible default response so tests don't get undefined
global.fetch = vi.fn(() => Promise.resolve(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })))

// Clear storage and mock call history between tests
afterEach(() => {
  _storage.clear()
  vi.clearAllMocks()
  // Restore fetch default after clearAllMocks resets it
  ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
    () => Promise.resolve(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }))
  )
})
