import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"],
});

interface HeaderProps {
    title: string;
}
export const Header = ({ title }: HeaderProps) => {
    return <div className="w-full flex flex-col gap-y-4 items-center justify-center ">
        <h1 className={cn("text-3xl font-semibold", font.className)}>Dhaneri</h1>
        <p className="text-muted-foreground text-md">{title}</p>
    </div>
}
