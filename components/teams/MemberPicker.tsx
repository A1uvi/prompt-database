'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'

interface Member {
  id: string
  name: string | null
  email: string | null
}

interface MemberPickerProps {
  onAddMember: (email: string) => void
  members?: Member[]
  onRemoveMember?: (memberId: string) => void
}

export function MemberPicker({
  onAddMember,
  members,
  onRemoveMember,
}: MemberPickerProps) {
  const [email, setEmail] = useState('')

  const handleAdd = () => {
    if (email.trim()) {
      onAddMember(email.trim())
      setEmail('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="memberEmail">Add Member by Email</Label>
        <div className="flex gap-2">
          <Input
            id="memberEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAdd()
              }
            }}
            placeholder="member@example.com"
          />
          <Button type="button" onClick={handleAdd}>
            Add
          </Button>
        </div>
      </div>

      {members && members.length > 0 && (
        <div className="space-y-2">
          <Label>Members</Label>
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                    {member.name?.charAt(0) ?? member.email?.charAt(0) ?? 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {member.name ?? member.email}
                    </p>
                    {member.name && (
                      <p className="text-xs text-neutral-500">{member.email}</p>
                    )}
                  </div>
                </div>
                {onRemoveMember && (
                  <button
                    type="button"
                    onClick={() => onRemoveMember(member.id)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
