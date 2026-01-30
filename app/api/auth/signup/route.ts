import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Validation schema for signup
const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = signupSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { username, password, name, email } = validationResult.data

    // Check if username already exists
    const existingUsername = await db.user.findUnique({
      where: { username },
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      )
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await db.user.findUnique({
        where: { email },
      })

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        name: name || null,
        email: email || null,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An error occurred during signup. Please try again.' },
      { status: 500 }
    )
  }
}
