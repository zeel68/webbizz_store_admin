import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import ApiClient from "./lib/apiCalling"


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
          const response: ApiResponse<iLoginResponseData> = await client.post("/auth/login", {
            email: credentials.email,
            password: credentials.password,
          })

          console.log("Login API Response:", response.data)

          const nestedData = response.data?.data
          const user = nestedData?.user

          if (response.success && user && nestedData?.accessToken) {
            return {
              id: user._id,
              email: user.email,
              name: user.name,
              role: user.role,
              storeId: user.store_id,
              phoneNumber: user.phone_number,
              accessToken: nestedData.accessToken,
              refreshToken: nestedData.refreshToken,
            }
          } else {
            console.warn("Login failed, response:", response)
          }

          return null
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

          const response: ApiResponse<iLoginResponseData> = await client.post("/users/login", {
            email: user.email,
            name: user.name,
            isGoogleLogin: true,
            profile_url: user.image,
          })

          console.log("Google login response", response)

          if (response.success && response.data) {
            const apiUser: iUser = response.data.user || response.data.data?.user
            console.log("Api USER", apiUser)

            user.id = apiUser.id || apiUser._id
            user.role = apiUser.role_id
            user.storeId = apiUser.store_id
            user.phoneNumber = apiUser.phone_number
            user.accessToken = response.data.accessToken || response.data.data?.accessToken
            user.refreshToken = response.data.refreshToken || response.data.data?.refreshToken
            return true
          }
          return true
        } catch (error) {
          console.error("Google login API error:", error)
          return false
        }
      }

      if (account?.provider === "credentials") {
        return true
      }

      return false
    },
    async jwt({ token, user, account }) {
      if (user && account) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.role = user.role
        token.storeId = user.storeId
        token.phoneNumber = user.phoneNumber
        token.user = {
          id: user.id,
          email: user.email || "",
          name: user.name || "",
          role: user.role,
          storeId: user.storeId,
          phoneNumber: user.phoneNumber,
        }
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.user = {
        ...session.user,
        id: token.user?.id as string,
        role: token.user?.role as string,
        storeId: token.user?.storeId as string,
        phoneNumber: token.user?.phoneNumber as string,
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
