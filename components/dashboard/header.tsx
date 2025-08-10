"use client"

import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationCenter } from "@/components/ui/notification-center"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useSession, signOut } from "next-auth/react"
import { Sun, Moon, Monitor, Search, Command, Settings, User, LogOut, HelpCircle, Keyboard, Zap } from "lucide-react"
import { useEffect } from "react"

import { getInitials } from "@/lib/utils"
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts"


export function StoreAdminHeader() {
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    const { data: session } = useSession()
    const [mounted, setMounted] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    // Global search keyboard shortcut
    useKeyboardShortcuts([
        {
            key: "k",
            ctrlKey: true,
            action: () => setSearchOpen(true),
            description: "Open global search",
        },
        {
            key: "/",
            action: () => setSearchOpen(true),
            description: "Open global search",
        },
    ])

    const getBreadcrumbs = () => {
        const segments = pathname.split("/").filter(Boolean)
        const breadcrumbs = []

        if (segments.length > 0) {
            breadcrumbs.push({ label: "Dashboard", href: "/" })

            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i]
                const href = "/" + segments.slice(0, i + 1).join("/")
                const label = segment
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
                breadcrumbs.push({ label, href })
            }
        }

        return breadcrumbs
    }

    const breadcrumbs = getBreadcrumbs()

    const getThemeIcon = () => {
        if (!mounted) return Monitor // Fallback during SSR

        switch (theme) {
            case "light":
                return Sun
            case "dark":
                return Moon
            default:
                return Monitor
        }
    }

    const ThemeIcon = getThemeIcon()

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/login" })
    }

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-border backdrop-blur-sm px-4 bg-background/95">
            <SidebarTrigger className="-ml-1 text-foreground hover:bg-accent" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-border" />

            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <Breadcrumb className="hidden md:flex flex-1">
                    <BreadcrumbList>
                        {breadcrumbs.map((breadcrumb, index) => (
                            <div key={breadcrumb.href} className="flex items-center">
                                {index > 0 && <BreadcrumbSeparator className="text-muted-foreground" />}
                                <BreadcrumbItem>
                                    {index === breadcrumbs.length - 1 ? (
                                        <BreadcrumbPage className="text-foreground font-medium">{breadcrumb.label}</BreadcrumbPage>
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

            <div className="flex items-center gap-2 ml-auto">
                {/* Global Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search products, orders, customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 pl-9 pr-12"
                        onFocus={() => setSearchOpen(true)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Badge variant="outline" className="text-xs px-1 py-0">
                            <Command className="h-3 w-3 mr-1" />K
                        </Badge>
                    </div>
                </div>

                {/* Mobile Search Button */}
                <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSearchOpen(true)}>
                    <Search className="h-4 w-4" />
                </Button>

                {/* Notifications */}
                <NotificationCenter />

                {/* Quick Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <Zap className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => window.open("/products/add", "_blank")}>Add Product</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open("/orders", "_blank")}>View Orders</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open("/customers", "_blank")}>Manage Customers</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Keyboard className="mr-2 h-4 w-4" />
                            Keyboard Shortcuts
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme Switcher */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            <ThemeIcon className="h-4 w-4" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
                        <DropdownMenuItem
                            onClick={() => setTheme("light")}
                            className="hover:bg-accent hover:text-accent-foreground"
                        >
                            <Sun className="mr-2 h-4 w-4" />
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")} className="hover:bg-accent hover:text-accent-foreground">
                            <Moon className="mr-2 h-4 w-4" />
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setTheme("system")}
                            className="hover:bg-accent hover:text-accent-foreground"
                        >
                            <Monitor className="mr-2 h-4 w-4" />
                            System
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={session?.user?.image || "/placeholder.svg"} alt="User" />
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                    {getInitials(session?.user?.name || "Admin")}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{session?.user?.name || "Admin"}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {session?.user?.email || "admin@store.com"}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <HelpCircle className="mr-2 h-4 w-4" />
                            <span>Help & Support</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
