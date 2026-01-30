import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNav } from '@/components/layout/TopNav'
import { TRPCProvider } from '@/lib/trpc/react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <TRPCProvider>
      <div className="flex h-screen overflow-hidden bg-neutral-50">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNav user={session.user} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </TRPCProvider>
  )
}
