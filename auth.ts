// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import ApiClient from "./lib/apiCalling"

// --- helper to refresh tokens ---
async function refreshAccessToken(token: any) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    })

    if (!res.ok) throw new Error("Failed to refresh access token")
    const data = await res.json()

    return {
      ...token,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? token.refreshToken,
      accessTokenExpires: Date.now() + (data.expiresIn || 3600) * 1000, // default 1h
    }
  } catch (err) {
    console.error("Refresh token error:", err)
    return { ...token, error: "RefreshAccessTokenError" }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          console.warn("Missing credentials")
          return null
        }

        try {
          const client = new ApiClient()
          const apiResponse = await client.post("/auth/login", {
            email: credentials.email,
            password: credentials.password,
          })

          const { success } = apiResponse
          const data = apiResponse.data as ApiResponse<iLoginResponseData>

          if (!success || !data?.data) {
            console.warn("Login failed", apiResponse)
            return null
          }

          const loginData: iLoginResponseData = data.data
          const user = loginData.user

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role_id,
            storeId: user.store_id ?? "",
            image: user.profile_url,
            phoneNumber: user.phone_number ?? "",
            accessToken: loginData.accessToken,
            refreshToken: loginData.refreshToken,
          }
        } catch (error) {
          console.error("Credentials login error:", error)
          return null
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const client = new ApiClient({
            headers: { "Content-Type": "application/json" },
          })

          const apiResponse = await client.post("/users/login", {
            email: user.email,
            name: user.name,
            isGoogleLogin: true,
            profile_url: user.image,
          })

          const { success } = apiResponse
          const data = apiResponse.data as ApiResponse<iLoginResponseData>
          if (!success || !data?.data) return false

          const loginData: iLoginResponseData = data.data
          const apiUser: iUser = loginData.user

          user.id = apiUser.id
          user.role = apiUser.role_id
          user.storeId = apiUser.store_id ?? ""
          user.phoneNumber = apiUser.phone_number ?? ""
          user.accessToken = loginData.accessToken
          user.refreshToken = loginData.refreshToken

          return true
        } catch (error) {
          console.error("Google login API error:", error)
          return false
        }
      }

      return account?.provider === "credentials"
    },

    async jwt({ token, user }) {
      // Initial login
      if (user) {
        return {
          ...token,
          id: user.id,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          role: user.role,
          storeId: user.storeId,
          phoneNumber: user.phoneNumber,
          email: user.email ?? "",
          name: user.name ?? "",
          accessTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // assume 1 day if API doesn’t return
        }
      }

      // Still valid → return existing token
      if (Date.now() < (token.accessTokenExpires ?? 0)) {
        return token
      }

      // Expired → refresh it
      return await refreshAccessToken(token)
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        role: token.role,
        storeId: token.storeId,
        phoneNumber: token.phoneNumber,
        email: token.email ?? "",
        name: token.name ?? "",
      }
      session.error = token.error
      return session
    },
  },

  pages: {
    signIn: "/login",
  },
})
