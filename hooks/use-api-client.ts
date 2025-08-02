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
        ...(session?.accessToken && {
          Authorization: `Bearer ${session.accessToken}`,
        }),
      },
    })
  }, [session?.accessToken])

  return apiClient
}
