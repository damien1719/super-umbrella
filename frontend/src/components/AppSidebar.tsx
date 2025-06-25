import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Calendar,
  CreditCard,
  FileText,
  Crown,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from './ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth } from '../store/auth';
import type { Page } from '../store/pageContext';

interface SidebarProps {
  onNavigate: (page: Page) => void;
}

const items: {
  title: string;
  page: Page;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { title: 'Mon Compte', page: 'MonCompte', path: '/compte', icon: Calendar },
  { title: 'Dashboard', page: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Mes Biens', page: 'MesBiens', path: '/biens', icon: Home },
  { title: 'Mon Agenda', page: 'Agenda', path: '/agenda', icon: Calendar },
  {
    title: 'Abonnement',
    page: 'Abonnement',
    path: '/abonnement',
    icon: CreditCard,
  },
  {
    title: 'Déclaration Fiscale',
    page: 'Resultats',
    path: '/resultats',
    icon: FileText,
  },
];

export function AppSidebar({ onNavigate }: SidebarProps) {
  const signOut = useAuth((s) => s.signOut);
  return (
    <UISidebar collapsible="icon">
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
              {items.map((item) => (
                <SidebarMenuItem key={item.page}>
                  <NavLink to={item.path} end={item.path === '/'}>
                    {({ isActive }) => (
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => onNavigate(item.page)}
                        className="w-full"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.page === 'Abonnement' && (
                          <Crown className="h-3 w-3 ml-auto text-yellow-500" />
                        )}
                      </SidebarMenuButton>
                    )}
                  </NavLink>
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
                  className="data-[state=open]:bg-blue-50 data-[state=open]:text-blue-700"
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
                <DropdownMenuItem onClick={() => onNavigate('MonCompte')}>
                  <User className="h-4 w-4 mr-2" />
                  Éditer le profil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </UISidebar>
  );
}
