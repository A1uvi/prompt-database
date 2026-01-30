'use client'

import { Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from 'next-auth/react'
import { SearchBar } from '@/components/search/SearchBar'

interface TopNavProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function TopNav({ user }: TopNavProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <button className="md:hidden">
          <Menu className="h-6 w-6 text-neutral-600" />
        </button>

        <SearchBar />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-neutral-100">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name ?? 'User'}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
              {user.name?.charAt(0) ?? user.email?.charAt(0) ?? 'U'}
            </div>
          )}
          <div className="text-left">
            <div className="text-sm font-medium text-neutral-900">
              {user.name ?? 'User'}
            </div>
            <div className="text-xs text-neutral-500">{user.email}</div>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-semantic-error"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
