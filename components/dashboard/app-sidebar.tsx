"use client"

import * as React from "react"

import { SearchForm } from "@/components/dashboard/search-form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"
import Link from "next/link"
import { LogoutButton } from "../auth/logout-button"
import { usePathname } from "next/navigation"
// This is sample data.
const data = {
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Sales",
          url: "/dashboard/sales",
        },
        {
          title: "Sales Report",
          url: "/dashboard/sales-report",
        },
      ],
    },
    {
      title: "Products",
      url: "#",
      items: [
        {
          title: "Manage Products",
          url: "/dashboard/product",
        },
        {
          title: "Manage Categories",
          url: "/dashboard/category",
        }
      ],
    },
     {
      title: "Payments",
      url: "#",
      items: [
        {
          title: "Manage Payment Methods",
          url: "/dashboard/payment-method",
        }
      ],
    },
    {
      title: "Users",
      url: "#",
      items: [
        {
          title: "Manage Users",
          url: "/dashboard/user",
        },
        {
          title: "Manage Roles",
          url: "/dashboard/role",
        },
        
      ],
    },
    {
      title: "Settings",
      url: "#",
      items: [
        {
          title: "Update Profile",
          url: "/dashboard/profile",
        },
        {
          title: "Logout",
          url: "/logout",
        },
        
      ],
    },
    
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        
        <SearchForm />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* We create a collapsible SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                render={<CollapsibleTrigger />}
              >
                {item.title}{" "}
                <ChevronRightIcon className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        {item.title == "Logout" ? (
                          <LogoutButton />
                        ) : (
                          <SidebarMenuButton
                            isActive={item.url === pathname}
                            render={<Link href={item.url} />}
                          >
                            {item.url === pathname ? <b>{item.title}</b> : item.title}
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
