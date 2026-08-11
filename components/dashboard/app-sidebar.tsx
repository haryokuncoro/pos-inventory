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

// This is sample data.
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "POS",
          url: "#",
        },
        {
          title: "Sales",
          url: "#",
        },
      ],
    },
    {
      title: "Products",
      url: "#",
      items: [
        {
          title: "Manage Products",
          url: "#",
        },
        {
          title: "Manage Categories",
          url: "#",
          isActive: true,
        }
      ],
    },
     {
      title: "Payments",
      url: "#",
      items: [
        {
          title: "Manage Payment Methods",
          url: "#",
          isActive: true,
        }
      ],
    },
    {
      title: "Users",
      url: "#",
      items: [
        {
          title: "Manage Users",
          url: "#",
        },
        {
          title: "Manage Roles",
          url: "#",
        },
        
      ],
    },
    {
      title: "Settings",
      url: "#",
      items: [
        {
          title: "Update Profile",
          url: "#",
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
                            isActive={item.isActive}
                            render={<Link href={item.url} />}
                          >
                            {item.title}
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
