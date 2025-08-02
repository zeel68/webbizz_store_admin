"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Tag,
  Users,
  Star,
  Gift,
  FileText,
  ChevronRight,
  ChevronUp,
  LogOut,
  User,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useUserStore } from "@/store/userStore";
import { Collapsible } from "@radix-ui/react-collapsible";
import { CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Products",
    href: "/store-admin/products",
    icon: Package,
  },
  {
    name: "Categories",
    href: "/categories",
    icon: Tag,
  },
  {
    name: "Orders",
    href: "/store-admin/orders",
    icon: ShoppingCart,
  },
  {
    name: "Customers",
    href: "/store-admin/customers",
    icon: Users,
  },
  {
    name: "Inventory",
    href: "/store-admin/inventory",
    icon: Package,
  },
  {
    name: "Analytics",
    href: "/store-admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Reviews",
    href: "/store-admin/reviews",
    icon: Star,
  },
  {
    name: "Coupons",
    href: "/store-admin/coupons",
    icon: Gift,
  },
  {
    name: "Reports",
    href: "/store-admin/reports",
    icon: FileText,
    children: [
      { name: "Sales Report", href: "/store-admin/reports/sales" },
      { name: "Product Report", href: "/store-admin/reports/products" },
      { name: "Customer Report", href: "/store-admin/reports/customers" },
    ],
  },
  {
    name: "Settings",
    href: "/store-admin/settings",
    icon: Settings,
  },
];

export function StoreAdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const clearUser = useUserStore((state) => state.clearUser);
  const [openItems, setOpenItems] = useState<string[]>([]);

  const isActive = (href: string) => pathname === href;
  const isParentActive = (href: string) => pathname.startsWith(href);

  useEffect(() => {
    const parentsToOpen = navigation
      .filter((item) =>
        item.children?.some(
          (child) => isActive(child.href) || isParentActive(child.href),
        ),
      )
      .map((item) => item.name);
    setOpenItems(parentsToOpen);
  }, [pathname]);

  const toggleItem = (name: string) => {
    setOpenItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name],
    );
  };

  const handleLogout = async () => {
    clearUser();
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold">Store Admin</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.name}>
              {item.children ? (
                <Collapsible
                  open={openItems.includes(item.name)}
                  onOpenChange={() => toggleItem(item.name)}
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        "w-full justify-between",
                        isParentActive(item.href) &&
                          "bg-accent text-accent-foreground",
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          openItems.includes(item.name) && "rotate-90",
                        )}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children.map((child) => (
                        <SidebarMenuSubItem key={child.name}>
                          <SidebarMenuSubButton
                            asChild
                            className={cn(
                              isActive(child.href) &&
                                "bg-muted text-foreground font-medium",
                            )}
                          >
                            <Link href={child.href}>{child.name}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuButton
                  asChild
                  className={cn(
                    isActive(item.href) &&
                      "bg-accent  p-1 text-accent-foreground",
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="/placeholder.svg" alt="Store Admin" />
                    <AvatarFallback className="rounded-lg">SA</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {session?.user?.name || "Admin"}
                    </span>
                    <span className="truncate text-xs">
                      {session?.user?.email || "admin@example.com"}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
