import NextAuth from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import type { AuthOptions } from "next-auth"

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user repo"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }: any) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken as string
      return session
    }
  },
  session: {
    strategy: "jwt" as const
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
