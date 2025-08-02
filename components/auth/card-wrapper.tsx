"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Header } from "./header";
import { SocialLogin } from "./social";


interface CardWrapperProps {
    children: React.ReactNode;
    headerLable: string;
    backbuttonLabel?: string;
    backbutton?: boolean;
    backbuttonHref?: string;
    showSocialLogin?: boolean;
}


export const CardWrapper = ({
    children,
    headerLable,
    backbuttonLabel,
    backbutton,
    backbuttonHref,
    showSocialLogin
}: CardWrapperProps) => {
    return (
        <Card className="w-[400px] shadow-md ">
            <Header title={headerLable} />
            <CardContent>
                {children}
            </CardContent>
            {showSocialLogin && (
                <CardContent >
                    <SocialLogin showGoogle showFacebook />
                </CardContent>
            )}
            <CardFooter>
                {backbutton && backbuttonHref && (
                    <Link href={backbuttonHref} className="w-full text-sm text-black-500 hover:underline text-center">
                        {backbuttonLabel}
                    </Link>
                )}
            </CardFooter>
        </Card>
    );
}
