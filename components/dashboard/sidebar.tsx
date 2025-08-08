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
  DropdownMenuSeparator,
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
  ChevronDown,
  LogOut,
  User,
  Bell,
  HelpCircle,
  Menu,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useUserStore } from "@/store/userStore";
import { Collapsible } from "@radix-ui/react-collapsible";
import {
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Category",
    href: "/categories",
    icon: Menu,
  },
  {
    name: "Products",
    href: "/products",
    icon: Package,
    children: [
      { name: "All Products", href: "/products" },
      { name: "Add Product", href: "/products/add" },
    ],
  },

  {
    name: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    badge: "New",
  },
  {
    name: "Marketing",
    href: "/marketing",
    icon: Gift,
    children: [
      { name: "Coupons", href: "/marketing/coupons" },
      // { name: "Campaigns", href: "/marketing/campaigns" },
      // { name: "Email Templates", href: "/marketing/email" },
    ],
  },
  {
    name: "Reviews",
    href: "/reviews",
    icon: Star,
  },
  // {
  //   name: "Reports",
  //   href: "/reports",
  //   icon: FileText,
  //   children: [
  //     { name: "Sales Report", href: "/reports/sales" },
  //     { name: "Product Report", href: "/reports/products" },
  //     { name: "Customer Report", href: "/reports/customers" },
  //     { name: "Inventory Report", href: "/reports/inventory" },
  //   ],
  // },
  {
    name: "HomePage",
    href: "/homepage",
    icon: Settings,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function StoreAdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const clearUser = useUserStore((state) => state.clearUser);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [isHovering, setIsHovering] = useState(false);

  const isActive = (href: string) => pathname === href;

  const isParentActive = (href: string, children?: any[]) => {
    if (children) {
      return children.some(child => pathname.startsWith(child.href));
    }
    return pathname.startsWith(href) && pathname !== "/" && href !== "/";
  };

  useEffect(() => {
    const parentsToOpen = navigation
      .filter((item) =>
        item.children?.some(
          (child) => pathname.startsWith(child.href),
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
    <Sidebar
      className="border-r bg-white dark:bg-gray-900 transition-all duration-300"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <SidebarHeader className="border-b border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-md">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div className="overflow-hidden transition-all duration-300" >
            <h1 className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">Store Admin</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Manage your store</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarMenu className="space-y-1">
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
                        "w-full justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                        "group hover:bg-gray-50 dark:hover:bg-gray-800",
                        isParentActive(item.href, item.children)
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          isParentActive(item.href, item.children)
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-800/50"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        )}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <Badge className="ml-2 text-xs px-1.5 py-0.5">
                            {item}
                          </Badge>
                        )}
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform text-gray-400 group-hover:text-gray-600",
                          "dark:text-gray-500 dark:group-hover:text-gray-300",
                          openItems.includes(item.name) && "rotate-180"
                        )}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden transition-all duration-300">
                    <SidebarMenuSub className="mt-1 ml-1 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-3 py-1">
                      {item.children.map((child) => (
                        <SidebarMenuSubItem key={child.name}>
                          <SidebarMenuSubButton
                            asChild
                            className={cn(
                              "w-full px-3 py-2 text-sm rounded-lg transition-colors",
                              "group hover:bg-gray-50 dark:hover:bg-gray-800",
                              isActive(child.href)
                                ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-300"
                                : "text-gray-600 dark:text-gray-400"
                            )}
                          >
                            <Link href={child.href} className="flex items-center">
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full mr-3 transition-colors",
                                isActive(child.href)
                                  ? "bg-blue-500"
                                  : "bg-gray-300 group-hover:bg-gray-500 dark:bg-gray-600"
                              )} />
                              <span className="truncate">{child.name}</span>
                            </Link>
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
                    "w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    "group hover:bg-gray-50 dark:hover:bg-gray-800",
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  <Link href={item.href} className="flex items-center space-x-3">
                    <div className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isActive(item.href)
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-800/50"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    )}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <Badge variant={'default'} className="ml-auto text-xs px-1.5 py-0.5">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 dark:border-gray-800 p-3 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center w-full p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
              <Avatar className="w-9 h-9">
                <AvatarImage src={session?.user.image} alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-medium">
                  {session?.user?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 text-left overflow-hidden transition-all duration-300" >
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session?.user?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session?.user?.email || "admin@store.com"}
                </p>
              </div>
              <div className="ml-auto flex">
                <Badge variant={'default'} className="h-5 text-xs">Pro</Badge>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            side="top"
            align="end"
            sideOffset={8}
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{session?.user?.name || "Admin"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session?.user?.email || "admin@store.com"}</p>
            </div>

            <div className="p-2">
              <DropdownMenuItem className="px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                <User className="w-4 h-4 mr-3 text-gray-500" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                <Bell className="w-4 h-4 mr-3 text-gray-500" />
                <span>Notifications</span>
                <Badge variant={'secondary'} className="ml-auto">3</Badge>
              </DropdownMenuItem>
              <DropdownMenuItem className="px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                <Settings className="w-4 h-4 mr-3 text-gray-500" />
                <span>Settings</span>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-700" />

            <div className="p-2">
              <DropdownMenuItem className="px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                <HelpCircle className="w-4 h-4 mr-3 text-gray-500" />
                <span>Help Center</span>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-700" />

            <div className="p-2">
              <DropdownMenuItem
                onClick={handleLogout}
                className="px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-3" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}