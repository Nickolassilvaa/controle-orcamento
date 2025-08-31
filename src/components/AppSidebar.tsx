import { NavLink, useLocation } from 'react-router-dom';
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
import { TooltipContent, TooltipProvider, TooltipTrigger, Tooltip } from './ui/tooltip';
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
    title: 'Itens/Materiais',
    url: '/itens',
    icon: Box,
  },
  {
    title: 'Clientes',
    url: '/clientes',
    icon: Users,
  },
];

export function AppSidebar() {
  const { state, isMobile } = useSidebar();
  const { logout, user } = useAuth();
  const location = useLocation();
  const collapsed = state === 'collapsed' && !isMobile;

  return (
    <Sidebar collapsible="icon" className="min-w-16">
      <SidebarHeader className={cn("border-b p-4 flex", collapsed && "items-center")}>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="font-bold text-lg truncate">OrçaSystem</h2>
              <p className="text-sm text-muted-foreground truncate">{user?.empresa || 'MVP v1.0'}</p>
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
                {navigationItems.map((item) => {
                  const isActive = (item.url === '/' && location.pathname === '/') || 
                                  (item.url !== '/' && location.pathname === item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild isActive={isActive}>
                              <NavLink
                                to={item.url}
                                end
                                className="flex items-center gap-2"
                              >
                                <item.icon className={`h-4 w-4 ${collapsed ? 'mx-auto' : ''}`} />
                                {!collapsed && <span>{item.title}</span>}
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                    </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Cadastros</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className={collapsed && 'flex items-center'}>
                {cadastroItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild isActive={isActive}>
                              <NavLink
                                to={item.url}
                                className="flex items-center gap-2"
                              >
                                <item.icon className={`h-4 w-4 ${collapsed ? 'mx-auto' : ''}`} />
                                {!collapsed && <span>{item.title}</span>}
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
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