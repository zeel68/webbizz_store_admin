"use client"

import { FcGoogle } from "react-icons/fc"
import { FaFacebookF, FaTwitter } from "react-icons/fa"
import { Button } from "../ui/button"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/store/userStore"
import { ADMIN_ROLE_ID, CUSTOMER_ROLE_ID, OWNER_ROLE_ID } from "@/data/Consts"
import { useEffect } from "react"

interface SocialLoginProps {
    showGoogle?: boolean
    showFacebook?: boolean
    showTwitter?: boolean
}

export const SocialLogin = ({ showGoogle, showFacebook, showTwitter }: SocialLoginProps) => {
    const router = useRouter()
    const { data: session, status } = useSession()
    const setUser = useUserStore((state) => state.setUser)

    useEffect(() => {
        // Handle successful Google login
        if (status === "authenticated" && session?.user && session.user.accessToken) {
            // Store in Zustand
            setUser(
                {
                    id: session.user.id,
                    email: session.user.email || "",
                    name: session.user.name || "",
                    role: session.user.role,
                },
                session.user.accessToken,
            )

            // Redirect based on role
            switch (session.user.role) {
                case ADMIN_ROLE_ID:
                    router.push("/prod")
                    break
                case OWNER_ROLE_ID:
                    router.push("/OW")
                    break
                case CUSTOMER_ROLE_ID:
                default:
                    router.push("/")
                    break
            }
        }
    }, [session, status, setUser, router])

    const handleGoogleSignIn = async () => {
        try {
            await signIn("google", {
                callbackUrl: "/",
            })
        } catch (error) {
            console.error("Google sign in error:", error)
        }
    }

    const handleFacebookSignIn = () => {
        signIn("facebook")
    }

    const handleTwitterSignIn = () => {
        signIn("twitter")
    }

    return (
        <div className="flex items-center w-full gap-x-2">
            {showGoogle && (
                <Button
                    size="lg"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    className="flex-1 flex items-center justify-center gap-x-2 bg-transparent"
                    disabled={status === "loading"}
                >
                    <FcGoogle className="h-5 w-5" />
                    Google
                </Button>
            )}
            {showFacebook && (
                <Button
                    size="lg"
                    variant="outline"
                    onClick={handleFacebookSignIn}
                    className="flex-1 flex items-center justify-center gap-x-2 bg-transparent"
                >
                    <FaFacebookF className="h-5 w-5" />
                    Facebook
                </Button>
            )}
            {showTwitter && (
                <Button
                    size="lg"
                    variant="outline"
                    onClick={handleTwitterSignIn}
                    className="flex-1 flex items-center justify-center gap-x-2 bg-transparent"
                >
                    <FaTwitter className="h-5 w-5" />
                    Twitter
                </Button>
            )}
        </div>
    )
}
