import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Package, 
  FileText, 
  Users, 
  Settings,
  LogOut,
  Palette,
  Layers,
  Box,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: BarChart3,
  },
  {
    title: 'Orçamentos',
    url: '/orcamentos',
    icon: FileText,
  },
];

const cadastroItems = [
  {
    title: 'Produtos',
    url: '/produtos',
    icon: Package,
  },
  {
    title: 'Materiais',
    url: '/materiais',
    icon: Box,
  },
  {
    title: 'Clientes',
    url: '/clientes',
    icon: Users,
  },
  {
    title: 'Tipos de Material',
    url: '/tipos-material',
    icon: Layers,
  },
  {
    title: 'Tipos de Arte',
    url: '/tipos-arte',
    icon: Palette,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { logout, user } = useAuth();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="min-w-16">
      <SidebarHeader className={cn("border-b p-4 flex", collapsed && "items-center")}>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="font-bold text-lg truncate">Tapioca Com Limao</h2>
              <p className="text-sm text-muted-foreground">MVP v1.0</p>
            </div>
          )}
        </div>
      </SidebarHeader>
        
      <TooltipProvider>
        <SidebarContent>
          <SidebarGroup>
              <SidebarGroupLabel>Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className={collapsed && 'flex items-center'}>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                              <NavLink
                                to={item.url}
                                end
                                className={({ isActive }) =>
                                  isActive
                                    ? 'flex items-center gap-2 px-3 py-2 rounded-lg text-accent-foreground'
                                    : 'flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground'
                                }
                              >
                              <item.icon className="h-4 w-4" />
                              {!collapsed && <span>{item.title}</span>}
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
          </SidebarGroup>
        
          <SidebarGroup>
            <SidebarGroupLabel>Cadastros</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className={collapsed && 'flex items-center'}>
                {cadastroItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                              <NavLink
                                to={item.url}
                                className={({ isActive }) =>
                                  isActive
                                    ? 'flex items-center gap-2 px-3 py-2 rounded-lg text-accent-foreground'
                                    : 'flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground'
                                }
                              >
                              <item.icon className="h-4 w-4" />
                              {!collapsed && <span>{item.title}</span>}
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </TooltipProvider>

      <SidebarFooter className="border-t p-4">
        {!collapsed && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Logado como
            </p>
            <p className="text-sm font-medium truncate">
              {user?.email}
            </p>
          </div>
        )}
        <Button
          onClick={logout}
          variant="outline"
          size={collapsed ? 'icon' : 'sm'}
          className="w-full"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}