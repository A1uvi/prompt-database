'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/useDebounce'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery) {
      router.push(`/dashboard/search?q=${encodeURIComponent(debouncedQuery)}`)
    }
  }, [debouncedQuery, router])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query)}`)
    }
    // Global keyboard shortcut (Cmd+K)
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      e.currentTarget.focus()
    }
  }

  return (
    <div className="relative w-96">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search prompts... (Cmd+K)"
        className="w-full rounded-md border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      />
    </div>
  )
}
