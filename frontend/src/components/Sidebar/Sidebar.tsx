"use client"

import React from "react"
import { Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarRail } from "../ui/sidebar"
import { LayoutDashboard, Home, Calendar, FileText, CreditCard, User } from "lucide-react"
import { usePageStore } from "../../store/pageContext"

const menuItems = [
  { label: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { label: "Mes biens", page: "MesBiens", icon: Home },
  { label: "Mon agenda", page: "Agenda", icon: Calendar },
  { label: "Déclaration fiscale", page: "Resultats", icon: FileText },
  { label: "Abonnement", page: "Abonnement", icon: CreditCard },
]

export default function AppSidebar() {
  const current = usePageStore((s) => s.currentPage)
  const setCurrentPage = usePageStore((s) => s.setCurrentPage)

  return (
    <Sidebar collapsible="icon" className="h-full">
      {/* Header */}
      <SidebarHeader>
        <div className="px-4 py-3">
          <h2 className="text-lg font-semibold">Menu</h2>
        </div>
      </SidebarHeader>

      {/* Main nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.page}>
                  <SidebarMenuButton
                    isActive={current === item.page}
                    onClick={() => setCurrentPage(item.page)}
                    className="w-full"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="truncate">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with “Mon compte” */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem key="MonCompte">
            <SidebarMenuButton
              isActive={current === "MonCompte"}
              onClick={() => setCurrentPage("MonCompte")}
              className="w-full"
            >
              <User className="h-5 w-5" />
              <span className="truncate">Mon compte</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* The little rail that shows when collapsed */}
      <SidebarRail />
    </Sidebar>
  )
}
