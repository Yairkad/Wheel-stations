interface LoadingSpinProps {
  text: string
  size?: number
}

// Shared "spinner + label" for button loading states — uses the project's existing
// .spinning-wheel CSS animation (globals.css) rather than a plain text-only fallback.
export default function LoadingSpin({ text, size = 14 }: LoadingSpinProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <svg className="spinning-wheel" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
      {text}
    </span>
  )
}
