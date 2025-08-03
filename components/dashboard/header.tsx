"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { useEffect, useState } from "react"

export function StoreAdminHeader() {
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    const getBreadcrumbs = () => {
        const segments = pathname.split("/").filter(Boolean)
        const breadcrumbs = []

        if (segments.length > 1) {
            breadcrumbs.push({ label: "Store Admin", href: "/store-admin" })

            for (let i = 2; i < segments.length; i++) {
                const segment = segments[i]
                const href = "/" + segments.slice(0, i + 1).join("/")
                const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ")
                breadcrumbs.push({ label, href })
            }
        }

        return breadcrumbs
    }

    const breadcrumbs = getBreadcrumbs()

    const getThemeIcon = () => {
        if (!mounted) return Monitor // Fallback during SSR

        switch (theme) {
            case 'light':
                return Sun
            case 'dark':
                return Moon
            default:
                return Monitor
        }
    }

    const ThemeIcon = getThemeIcon()

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border backdrop-blur-sm px-4 bg-background">
            <SidebarTrigger className="-ml-1 text-foreground hover:bg-accent" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-border" />

            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <Breadcrumb className="flex-1">
                    <BreadcrumbList>
                        {breadcrumbs.map((breadcrumb, index) => (
                            <div key={breadcrumb.href} className="flex items-center">
                                {index > 0 && <BreadcrumbSeparator className="text-muted-foreground" />}
                                <BreadcrumbItem>
                                    {index === breadcrumbs.length - 1 ? (
                                        <BreadcrumbPage className="text-foreground font-medium">
                                            {breadcrumb.label}
                                        </BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink
                                            href={breadcrumb.href}
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {breadcrumb.label}
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </div>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            )}

            {/* Theme Switcher */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="ml-auto bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                        <ThemeIcon className="h-4 w-4" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="bg-popover text-popover-foreground border-border"
                >
                    <DropdownMenuItem
                        onClick={() => setTheme('light')}
                        className="hover:bg-accent hover:text-accent-foreground"
                    >
                        <Sun className="mr-2 h-4 w-4" />
                        Light
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setTheme('dark')}
                        className="hover:bg-accent hover:text-accent-foreground"
                    >
                        <Moon className="mr-2 h-4 w-4" />
                        Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setTheme('system')}
                        className="hover:bg-accent hover:text-accent-foreground"
                    >
                        <Monitor className="mr-2 h-4 w-4" />
                        System
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}
