import * as z from 'zod';


export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
})

export const SignupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email(),
    password: z.string().min(5, "Password must be at least 5 characters"),
    confirmPassword: z.string().min(5, "Confirm Password must be at least 5 characters"),
})
