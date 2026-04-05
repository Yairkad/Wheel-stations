'use client'

import { AdminSidebar } from './AdminSidebar'

interface AdminShellProps {
  children: React.ReactNode
  onLogout: () => void
}

export function AdminShell({ children, onLogout }: AdminShellProps) {
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .admin-shell-content { padding-top: 50px !important; }
        }
      `}</style>
      <div style={{
        display: 'flex',
        direction: 'ltr',
        minHeight: '100vh',
        background: '#f8fafc',
      }}>
        <main
          className="admin-shell-content"
          style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}
        >
          {children}
        </main>
        <AdminSidebar onLogout={onLogout} />
      </div>
    </>
  )
}
