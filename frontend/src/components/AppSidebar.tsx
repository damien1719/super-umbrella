import * as React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  CreditCard,
  Crown,
  User,
  Library,
  LogOut,
  LayoutDashboard,
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
import { useUserProfileStore } from '../store/userProfile';
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
  {
    title: 'Mes Bilans',
    page: 'MesBilans',
    path: '/',
    icon: LayoutDashboard,
  },
  { title: 'Mes Patients', page: 'Patients', path: '/patients', icon: User },
  {
    title: 'Bibliothèque',
    page: 'Bibliotheque',
    path: '/bibliotheque',
    icon: Library,
  },
  {
    title: 'Abonnement',
    page: 'Abonnement',
    path: '/abonnement',
    icon: CreditCard,
  },
];

export function AppSidebar({ onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const signOut = useAuth((s) => s.signOut);
  const profile = useUserProfileStore((s) => s.profile);
  const initials = React.useMemo(() => {
    if (!profile) return '??';
    return `${profile.prenom.charAt(0)}${profile.nom.charAt(0)}`.toUpperCase();
  }, [profile]);
  return (
    <UISidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 py-2">
          <Home className="h-6 w-6 text-primary-600" />
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
            PlumePsychomot
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
                        <span className="font-normal text-base">
                          {item.title}
                        </span>
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
                      src="/placeholder.svg?height=32&width=32"
                      alt={profile ? `${profile.prenom} ${profile.nom}` : ''}
                    />
                    <AvatarFallback className="rounded-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {profile ? `${profile.prenom} ${profile.nom}` : ''}
                    </span>
                    <span className="truncate text-xs">
                      {profile?.email ?? ''}
                    </span>
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
                        src="/placeholder.svg?height=32&width=32"
                        alt={profile ? `${profile.prenom} ${profile.nom}` : ''}
                      />
                      <AvatarFallback className="rounded-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {profile ? `${profile.prenom} ${profile.nom}` : ''}
                      </span>
                      <span className="truncate text-xs">
                        {profile?.email ?? ''}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    navigate('/compte');
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Voir le profil
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
