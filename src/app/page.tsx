'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function PublicHomePage() {
  const router = useRouter()

  return (
    <div style={styles.page}>
      <style>{`
        .staff-btn:hover { border-color: #3b82f6 !important; color: #60a5fa !important; }
        .nav-card:hover {
          transform: translateY(-10px) !important;
          box-shadow: 0 25px 50px rgba(0,0,0,0.15) !important;
        }
        .nav-card:hover .card-icon {
          background: rgba(255,255,255,0.3) !important;
          transform: scale(1.1);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @media (max-width: 480px) {
          .cards-container { flex-direction: column !important; align-items: center !important; }
          .nav-card { width: 100% !important; max-width: 280px !important; }
          .main-title { font-size: 1.5rem !important; }
          .main-sub { font-size: 0.9rem !important; }
        }
      `}</style>

      {/* Hidden login button top-left */}
      <Link href="/admin" style={styles.adminBtn} className="admin-btn">⚙️</Link>

      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logo}>
          <Image src="/logo.wheels.png" alt="גלגלים" width={80} height={80} style={{ objectFit: 'contain' }} />
        </div>

        <h1 className="main-title" style={styles.title}>מערכת גלגלים</h1>
        <p className="main-sub" style={styles.subtitle}>בחר שירות</p>

        {/* Cards */}
        <div className="cards-container" style={styles.cardsContainer}>
          <Link href="/reverse-search" style={styles.card} className="nav-card">
            <div style={styles.cardIcon} className="card-icon">🔍</div>
            <div style={styles.cardTitle}>חיפוש גלגל תואם</div>
            <div style={styles.cardDesc}>הזן פרטי רכב ומצא גלגל תואם</div>
          </Link>

          <Link href="/punctures" style={styles.card} className="nav-card">
            <div style={styles.cardIcon} className="card-icon">🔧</div>
            <div style={styles.cardTitle}>פנצ׳ריות לילה</div>
            <div style={styles.cardDesc}>פנצ׳ריות פתוחות עכשיו בסביבתך</div>
          </Link>
        </div>

        {/* Staff login link */}
        <button
          className="staff-btn"
          style={styles.staffBtn}
          onClick={() => router.push('/login')}
        >
          התחברות
        </button>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)',
    direction: 'rtl',
    fontFamily: "'Segoe UI', Rubik, Arial, sans-serif",
    padding: '20px',
    position: 'relative',
  },
  adminBtn: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    width: '40px',
    height: '40px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    cursor: 'pointer',
    opacity: 0,
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    zIndex: 10,
  },
  container: {
    textAlign: 'center',
    width: '100%',
    maxWidth: '550px',
  },
  logo: {
    width: '100px',
    height: '100px',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    animation: 'float 3s ease-in-out infinite',
    overflow: 'hidden',
  },
  title: {
    color: '#fff',
    fontSize: '2rem',
    fontWeight: '800',
    margin: '0 0 8px',
  },
  subtitle: {
    color: '#94a3b8',
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
    width: '200px',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '20px',
    padding: '32px 22px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    textDecoration: 'none',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  },
  cardIcon: {
    width: '70px',
    height: '70px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    transition: 'all 0.3s ease',
  },
  cardTitle: {
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: '700',
  },
  cardDesc: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    lineHeight: '1.4',
  },
  staffBtn: {
    background: 'transparent',
    border: '1px solid #334155',
    color: '#475569',
    fontSize: '13px',
    padding: '7px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
}
