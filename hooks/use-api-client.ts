"use client"

import { useMemo } from "react"
import { useSession } from "next-auth/react"
import ApiClient from "@/lib/apiCalling"

export function useApiClient() {
  const { data: session } = useSession()

  const apiClient = useMemo(() => {
    return new ApiClient({
      headers: {
        "Content-Type": "application/json",
        ...(session?.user.accessToken && {
          Authorization: `Bearer ₹{session.user.accessToken}`,
        }),
      },
    })
  }, [session?.user.accessToken])

  return apiClient
}
