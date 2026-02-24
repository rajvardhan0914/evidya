import Credentials from "next-auth/providers/credentials"
import type { NextAuthOptions } from "next-auth"
import { prisma } from "@/lib/prisma"
import { compare, hash } from "bcryptjs"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "evidya-secret-key-change-in-production",
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.hashedPassword) {
            return null
          }

          const isPasswordValid = await compare(credentials.password, user.hashedPassword)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isVerified: user.isVerified,
            bio: user.bio,
            location: user.location,
            skills: user.skills,
            image: user.image && user.image.length > 500 ? null : user.image,
            coverImage: user.coverImage && user.coverImage.length > 500 ? null : user.coverImage,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = user.role
        token.isVerified = user.isVerified
        token.bio = user.bio
        token.location = user.location
        token.skills = user.skills
        token.image = user.image
        token.coverImage = user.coverImage
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        ; (session.user as any).id = token.id
          ; (session.user as any).email = token.email
          ; (session.user as any).role = token.role
          ; (session.user as any).isVerified = token.isVerified
          ; (session.user as any).bio = token.bio
          ; (session.user as any).location = token.location
          ; (session.user as any).skills = token.skills
          ; (session.user as any).image = token.image
          ; (session.user as any).coverImage = token.coverImage
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    async signIn({ user }: any) {
      console.log("User signed in:", user?.email)
    },
  },
}

// Helper for server-side auth in API routes / server components
export async function getAuthSession() {
  const { getServerSession } = await import("next-auth/next")
  return getServerSession(authOptions)
}

// Export user creation function (DB-backed)
export async function createUser(userData: {
  email: string
  name: string
  password: string
  college: string
  areaOfInterest: string
  shortGoal: string
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email }
  })

  if (existingUser) {
    throw new Error("User already exists")
  }

  const hashedPassword = await hash(userData.password, 12)

  const user = await prisma.user.create({
    data: {
      email: userData.email,
      name: userData.name,
      hashedPassword,
      institution: userData.college, // Mapping legacy field
      interestDomain: userData.areaOfInterest, // Mapping legacy field
      shortGoal: userData.shortGoal,
    }
  })

  return user
}