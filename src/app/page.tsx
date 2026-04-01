'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

type Tab = 'compare' | 'punctures'

export default function PublicHomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('compare')
  const router = useRouter()

  return (
    <div style={styles.page}>
      <style>{`
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { opacity: 0.85; }
        .staff-btn:hover { border-color: #3b82f6 !important; color: #60a5fa !important; }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.12) !important; }
        @media (max-width: 600px) {
          .hero-title { font-size: 1.6rem !important; }
          .hero-sub { font-size: 0.9rem !important; }
          .feature-cards { flex-direction: column !important; align-items: center !important; }
          .feature-card { width: 100% !important; max-width: 320px !important; }
        }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLogo}>
          <Image src="/logo.wheels.png" alt="גלגלים" width={32} height={32} style={{ objectFit: 'contain', borderRadius: '6px' }} />
          <span style={styles.headerLogoText}>גלגלים</span>
        </div>
        <button
          className="staff-btn"
          style={styles.staffBtn}
          onClick={() => router.push('/login')}
        >
          התחברות
        </button>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <h1 className="hero-title" style={styles.heroTitle}>מצא את הגלגלים הנכונים</h1>
        <p className="hero-sub" style={styles.heroSub}>השוואת גלגלים בין רכבים ופנצ׳ריות זמינות בלילה</p>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            className="tab-btn"
            style={{ ...styles.tab, ...(activeTab === 'compare' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('compare')}
          >
            🔍 השוואת רכבים
          </button>
          <button
            className="tab-btn"
            style={{ ...styles.tab, ...(activeTab === 'punctures' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('punctures')}
          >
            🔧 פנצ׳ריות לילה
          </button>
        </div>
      </section>

      {/* Tab content */}
      <main style={styles.main}>
        {activeTab === 'compare' ? (
          <div style={styles.tabContent}>
            <div style={styles.tabIcon}>🔍</div>
            <h2 style={styles.tabTitle}>השוואת גלגלים בין רכבים</h2>
            <p style={styles.tabDesc}>
              הזן פרטי גלגל — מספר בולטים, מרווח ומידת גנט — ומצא את כל הרכבים שגלגליהם תואמים.
              מתאים לרכישת גלגלים יד שנייה.
            </p>
            <div className="feature-cards" style={styles.featureCards}>
              <div className="feature-card" style={styles.featureCard}>
                <div style={styles.featureIcon}>🔩</div>
                <div style={styles.featureText}>חיפוש לפי תבנית בולטים</div>
              </div>
              <div className="feature-card" style={styles.featureCard}>
                <div style={styles.featureIcon}>📐</div>
                <div style={styles.featureText}>התאמת קוטר גנט ומידה</div>
              </div>
              <div className="feature-card" style={styles.featureCard}>
                <div style={styles.featureIcon}>🚗</div>
                <div style={styles.featureText}>תוצאות לפי יצרן ודגם</div>
              </div>
            </div>
            <Link href="/reverse-search" style={styles.ctaBtn}>
              מעבר לחיפוש ←
            </Link>
          </div>
        ) : (
          <div style={styles.tabContent}>
            <div style={styles.tabIcon}>🔧</div>
            <h2 style={styles.tabTitle}>פנצ׳ריות פתוחות בלילה</h2>
            <p style={styles.tabDesc}>
              פנצ׳ר בשעות הלילה? מצא פנצ׳רייה פתוחה עכשיו בסביבתך — עם מספר טלפון וניווט.
            </p>
            <div className="feature-cards" style={styles.featureCards}>
              <div className="feature-card" style={styles.featureCard}>
                <div style={styles.featureIcon}>🗺️</div>
                <div style={styles.featureText}>מפה עם פנצ׳ריות פתוחות</div>
              </div>
              <div className="feature-card" style={styles.featureCard}>
                <div style={styles.featureIcon}>🌙</div>
                <div style={styles.featureText}>זמינות בזמן אמת</div>
              </div>
              <div className="feature-card" style={styles.featureCard}>
                <div style={styles.featureIcon}>📞</div>
                <div style={styles.featureText}>חיוג ישיר</div>
              </div>
            </div>
            <Link href="/punctures" style={styles.ctaBtn}>
              מעבר לפנצ׳ריות ←
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%)',
    direction: 'rtl',
    fontFamily: "'Segoe UI', Rubik, Arial, sans-serif",
  },
  header: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderBottom: '1px solid #334155',
    padding: '0 24px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  headerLogoText: {
    color: 'white',
    fontSize: '17px',
    fontWeight: '700',
  },
  staffBtn: {
    background: 'transparent',
    border: '1px solid #475569',
    color: '#94a3b8',
    fontSize: '12px',
    padding: '5px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  hero: {
    textAlign: 'center',
    padding: '48px 20px 32px',
  },
  heroTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 10px',
  },
  heroSub: {
    fontSize: '1rem',
    color: '#64748b',
    margin: '0 0 32px',
  },
  tabs: {
    display: 'inline-flex',
    gap: '4px',
    background: '#e2e8f0',
    borderRadius: '10px',
    padding: '4px',
  },
  tab: {
    padding: '9px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontFamily: 'inherit',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'transparent',
    color: '#64748b',
  },
  tabActive: {
    background: 'white',
    color: '#1e293b',
    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
  },
  main: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '0 20px 60px',
  },
  tabContent: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px 32px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
    textAlign: 'center',
  },
  tabIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  tabTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 12px',
  },
  tabDesc: {
    color: '#64748b',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    margin: '0 0 28px',
    maxWidth: '480px',
    marginInline: 'auto',
  },
  featureCards: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  featureCard: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px 16px',
    width: '150px',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  featureIcon: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  featureText: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#475569',
  },
  ctaBtn: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    padding: '12px 32px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '1rem',
    textDecoration: 'none',
    transition: 'opacity 0.2s',
  },
}
