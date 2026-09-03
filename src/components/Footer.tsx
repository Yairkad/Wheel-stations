import Link from 'next/link'
import { VERSION } from '@/lib/version'

interface FooterProps {
  // Some pages link to a role-specific tab of the guide instead of the default.
  guideHref?: string
  // Stations/search/operator/call-center show a short tagline + "report a
  // problem" link above the legal links — optional since most pages don't.
  showFeedback?: boolean
}

export default function Footer({ guideHref = '/guide', showFeedback = false }: FooterProps) {
  return (
    <footer style={styles.footer}>
      {showFeedback && (
        <p style={styles.feedbackText}>
          מערכת גלגלים ידידים •{' '}
          <Link href="/feedback" style={styles.feedbackLink}>דווח על בעיה או הצע שיפור</Link>
        </p>
      )}
      <p style={styles.links}>
        <Link href={guideHref} style={styles.link}>מדריך למשתמש</Link>
        <span style={styles.dot} aria-hidden="true" />
        <Link href="/privacy" style={styles.link}>מדיניות פרטיות</Link>
        <span style={styles.dot} aria-hidden="true" />
        <Link href="/accessibility" style={styles.link}>הצהרת נגישות</Link>
      </p>
      <p style={styles.version}>גרסה {VERSION}</p>
    </footer>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    padding: '20px',
    textAlign: 'center',
    borderTop: '1px solid #e2e8f0',
    marginTop: '20px',
  },
  feedbackText: {
    color: '#94a3b8',
    fontSize: '12px',
    margin: '0 0 6px',
  },
  feedbackLink: {
    color: '#94a3b8',
    textDecoration: 'underline',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    flexWrap: 'wrap',
    margin: '0 0 6px',
    fontSize: '12px',
  },
  link: {
    color: '#64748b',
    textDecoration: 'none',
    fontWeight: 500,
  },
  dot: {
    width: '3px',
    height: '3px',
    borderRadius: '50%',
    background: '#94a3b8',
    flexShrink: 0,
  },
  version: {
    color: '#94a3b8',
    fontSize: '11px',
    margin: 0,
  },
}
