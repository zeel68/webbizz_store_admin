import { CardWrapper } from '@/components/auth/card-wrapper'
import { LoginForm } from '@/components/auth/login-form'
import { SignupForm } from '@/components/auth/signup-form'
import React from 'react'

export default function SignupPage() {
    return (
        <div className='h-full flex  items-center justify-center'>
            <SignupForm />
        </div >
    )
}
