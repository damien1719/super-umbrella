'use client';

import type * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { Page } from '../../store/pageContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '../ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Home,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  User,
  Crown,
} from 'lucide-react';

const menuItems: { title: string; icon: LucideIcon; id: Page }[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    id: 'Dashboard',
  },
  {
    title: 'Mes Biens',
    icon: Home,
    id: 'MesBiens',
  },
  {
    title: 'Mon Agenda',
    icon: Calendar,
    id: 'Agenda',
  },
  {
    title: 'Abonnement',
    icon: CreditCard,
    id: 'Abonnement',
  },
  {
    title: 'Résultats',
    icon: CreditCard,
    id: 'Resultats',
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onProfileEdit: () => void;
}

export default function AppSidebar({
  activeSection,
  onSectionChange,
  onProfileEdit,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 py-2">
          <Home className="h-6 w-6 text-blue-600" />
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
            Gestion Locative
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => onSectionChange(item.id)}
                    className="w-full"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.id === 'Abonnement' && (
                      <Crown className="h-3 w-3 ml-auto text-yellow-500" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32&text=JD"
                      alt="John Doe"
                    />
                    <AvatarFallback className="rounded-lg">JD</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">John Doe</span>
                    <span className="truncate text-xs">john@example.com</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src="/placeholder.svg?height=32&width=32&text=JD"
                        alt="John Doe"
                      />
                      <AvatarFallback className="rounded-lg">JD</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">John Doe</span>
                      <span className="truncate text-xs">john@example.com</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onProfileEdit}>
                  <User className="h-4 w-4 mr-2" />
                  Éditer le profil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
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
