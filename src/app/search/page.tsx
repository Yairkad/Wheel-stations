'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function SearchRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Preserve query params when redirecting
    const params = searchParams.toString()
    router.replace(params ? `/?${params}` : '/')
  }, [router, searchParams])

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      טוען...
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>טוען...</div>}>
      <SearchRedirect />
    </Suspense>
  )
}
