'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    } else if (formData.username.length > 20) {
      errors.username = 'Username must be at most 20 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores'
    }

    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email address'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Call signup API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          name: formData.name || undefined,
          email: formData.email || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'An error occurred during signup')
        setIsLoading(false)
        return
      }

      // Auto sign in after successful signup
      const signInResult = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      })

      if (signInResult?.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        // Signup successful but sign-in failed, redirect to login
        router.push('/login?message=Account created successfully. Please sign in.')
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 py-12">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900">
            Create an Account
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Sign up to start managing your prompts
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
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Username (required)"
              className="text-base"
            />
            {fieldErrors.username && (
              <p className="mt-1 text-xs text-semantic-error">{fieldErrors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Password (min 8 characters)"
              className="text-base"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-semantic-error">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="sr-only">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm Password"
              className="text-base"
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-semantic-error">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="sr-only">
              Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Name (optional)"
              className="text-base"
            />
          </div>

          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Email (optional)"
              className="text-base"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-semantic-error">{fieldErrors.email}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-neutral-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-neutral-500">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
