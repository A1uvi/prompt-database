'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid username or password')
      } else if (result?.ok) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900">
            AI Prompt Database
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Sign in to manage your prompts
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-md bg-semantic-error-light p-3 text-sm text-semantic-error">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="text-base"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="text-base"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-neutral-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-neutral-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
