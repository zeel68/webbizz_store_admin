"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signIn, getSession } from "next-auth/react";

import type * as z from "zod";
import { LoginSchema } from "@/models/schemas";
import { useUserStore } from "@/store/userStore";
import { ADMIN_ROLE_ID, CUSTOMER_ROLE_ID, OWNER_ROLE_ID } from "@/data/Consts";

import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form/form-error";
import { FormSuccess } from "../form/from-success";
import { CardWrapper } from "./card-wrapper";

export const LoginForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const setUser = useUserStore((state) => state.setUser);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          console.error("Sign-in error:", result.error);
          setError("Invalid credentials or server error.");
          return;
        }

        if (result?.ok) {
          const session = await getSession();

          if (session?.user) {
            const { id, email, name, role, accessToken } = session.user;

            if (!accessToken) {
              setError("No access token returned from session.");
              return;
            }

            // Store user in Zustand
            setUser(
              {
                id,
                email: email ?? "",
                name: name ?? "",
                role,
              },
              accessToken
            );

            setSuccess("Logged in successfully!");

            // Redirect based on role
            switch (role) {
              case ADMIN_ROLE_ID:
                router.push("/prod");
                break;
              case OWNER_ROLE_ID:
                router.push("/");
                break;
              case CUSTOMER_ROLE_ID:
              default:
                router.push("/");
                break;
            }
          } else {
            setError("Failed to retrieve session after login.");
          }
        }
      } catch (err) {
        console.error("Login error:", err);
        setError("Login failed. Please try again.");
      }
    });
  };

  return (
    <CardWrapper
      headerLable="Admin Login"
      backbuttonLabel="Don't have an account? Sign up"
      backbutton
      backbuttonHref="/signup"
      showSocialLogin
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      type="password"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormError error={error} />
          <FormSuccess msg={success} />

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Signing in..." : "Login"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
