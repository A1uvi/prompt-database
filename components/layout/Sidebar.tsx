'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FolderOpen, Users, Settings, Activity } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { FolderTree } from '@/components/folders/FolderTree'

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Activity', href: '/dashboard/activity', icon: Activity },
  { name: 'Folders', href: '/dashboard/folders', icon: FolderOpen },
  { name: 'Teams', href: '/dashboard/teams', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col border-r border-neutral-200 bg-white md:flex">
      <div className="flex h-16 items-center border-b border-neutral-200 px-6">
        <h1 className="text-xl font-bold text-neutral-900">Prompt DB</h1>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-700 hover:bg-neutral-100'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}

        <FolderTree />
      </nav>

      <div className="border-t border-neutral-200 p-4">
        <Link href="/dashboard/prompts/new">
          <button className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700">
            New Prompt
          </button>
        </Link>
      </div>
    </aside>
  )
}
