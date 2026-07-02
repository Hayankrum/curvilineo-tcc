import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { prisma } from './prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false

      const existingUser = await prisma.usuario.findUnique({
        where: { email: user.email },
      })

      if (!existingUser) {
        await prisma.usuario.create({
          data: {
            nome: user.name || user.email.split('@')[0],
            email: user.email,
            senha: '',
          },
        })
      }

      return true
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.id = token.sub as string
      }
      return session
    },
  },
  pages: {
    signIn: '/usuarios/login',
  },
})
