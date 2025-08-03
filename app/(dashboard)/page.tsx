"use client"
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation';
import React from 'react'

export default function Page() {
    const session = useSession();

    console.log(session?.data?.expires == Date.now().toString())

    return (
        <div>Page</div>
    )
}
