'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { VERSION } from '@/lib/version'

export default function PublicHomePage() {
  const router = useRouter()

  return (
    <div style={styles.page}>
      <style>{`
        .nav-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 12px 40px rgba(37,99,235,0.13) !important;
          border-color: #bfdbfe !important;
        }
        .nav-card:hover .card-icon-wrap {
          transform: scale(1.05);
        }
        .login-btn:hover {
          background: #2563eb !important;
          color: #fff !important;
          border-color: #2563eb !important;
          box-shadow: 0 4px 14px rgba(37,99,235,0.25) !important;
        }
        @media (max-width: 480px) {
          .cards-container { flex-direction: column !important; align-items: center !important; }
          .nav-card { width: 100% !important; max-width: 300px !important; }
          .main-title { font-size: 1.6rem !important; }
        }
      `}</style>

      {/* Login button — top left */}
      <button className="login-btn" style={styles.loginBtnFixed} onClick={() => router.push('/login')}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        התחברות
      </button>

      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <Image src="/logo.wheels.png" alt="מערכת גלגלים" width={96} height={96} style={{ objectFit: 'cover', display: 'block' }} />
        </div>

        <h1 className="main-title" style={styles.title}>מערכת גלגלים</h1>
        <p style={styles.subtitle}>בחר שירות</p>

        {/* Cards */}
        <div className="cards-container" style={styles.cardsContainer}>
          <Link href="/reverse-search" style={styles.card} className="nav-card">
            <div style={styles.cardIconWrap} className="card-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <div style={styles.cardTitle}>חיפוש גלגל תואם</div>
            <div style={styles.cardDesc}>הזן פרטי רכב ומצא גלגל תואם</div>
          </Link>

          <Link href="/punctures" style={styles.card} className="nav-card">
            <div style={{ ...styles.cardIconWrap, background: '#f0fdf4', border: '1px solid #bbf7d0' }} className="card-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
                <line x1="12" y1="2" x2="12" y2="9"/>
                <line x1="12" y1="15" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="9" y2="12"/>
                <line x1="15" y1="12" x2="22" y2="12"/>
              </svg>
            </div>
            <div style={styles.cardTitle}>פנצ׳ריות לילה</div>
            <div style={styles.cardDesc}>פנצ׳ריות פתוחות עכשיו בסביבתך</div>
          </Link>
        </div>

      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLinks}>
          <Link href="/guide" style={styles.footerLink}>מדריך למשתמש</Link>
          <span style={styles.footerDot}>•</span>
          <Link href="/privacy" style={styles.footerLink}>מדיניות פרטיות</Link>
          <span style={styles.footerDot}>•</span>
          <Link href="/accessibility" style={styles.footerLink}>נגישות</Link>
        </div>
        <p style={styles.footerVersion}>גרסה {VERSION}</p>
      </footer>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #dbeafe 0%, #f0fdf4 50%, #faf5ff 100%)',
    direction: 'rtl',
    fontFamily: "'Segoe UI', Rubik, Arial, sans-serif",
    padding: '40px 20px 20px',
    position: 'relative',
  },
  container: {
    textAlign: 'center',
    width: '100%',
    maxWidth: '580px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: '96px',
    height: '96px',
    borderRadius: '24px',
    display: 'block',
    margin: '0 auto 24px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(37,99,235,0.12)',
  },
  title: {
    color: '#1e293b',
    fontSize: '2.2rem',
    fontWeight: '800',
    margin: '0 0 8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem',
    margin: '0 0 36px',
  },
  cardsContainer: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  card: {
    width: '210px',
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(226,232,240,0.9)',
    borderRadius: '20px',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
    textDecoration: 'none',
    boxShadow: '0 4px 20px rgba(37,99,235,0.07)',
  },
  cardIconWrap: {
    width: '68px',
    height: '68px',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease',
  },
  cardTitle: {
    color: '#1e293b',
    fontSize: '1rem',
    fontWeight: '700',
  },
  cardDesc: {
    color: '#64748b',
    fontSize: '0.8rem',
    lineHeight: '1.5',
  },
  loginBtnFixed: {
    position: 'fixed' as const,
    top: '18px',
    left: '18px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    background: 'rgba(255,255,255,0.80)',
    border: '1px solid rgba(226,232,240,0.85)',
    color: '#475569',
    fontSize: '13px',
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  footer: {
    marginTop: '40px',
    textAlign: 'center',
    paddingBottom: '8px',
  },
  footerLinks: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '6px',
  },
  footerLink: {
    color: '#64748b',
    fontSize: '12px',
    textDecoration: 'none',
    fontWeight: 500,
  },
  footerDot: {
    color: '#cbd5e1',
    fontSize: '12px',
  },
  footerVersion: {
    color: '#94a3b8',
    fontSize: '11px',
    margin: 0,
  },
}
