import { NavLink, useLocation } from "react-router-dom";
import { 
  Box, 
  Archive, 
  Database, 
  File,
  Circle,
  Network
} from "lucide-react";
import logoBringel from "@/assets/logo-bringel.png";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: Database },
  { title: "Localidades", url: "/localidades", icon: Circle },
  { title: "Unidades", url: "/unidades", icon: Archive },
  { title: "Itens", url: "/itens", icon: Box },
  { title: "Visualização", url: "/visualizacao", icon: Network },
  { title: "Relatórios", url: "/relatorios", icon: File },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium shadow-lg border-l-4 border-accent" 
      : "hover:bg-gradient-to-r hover:from-secondary/60 hover:to-accent/20 hover:border-l-2 hover:border-accent/50 transition-all duration-300";

  return (
    <Sidebar collapsible="icon" className="bg-gradient-to-b from-card to-secondary/50 border-r border-border/50">
      <SidebarContent>
        <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center gap-3">
            <img 
              src={logoBringel} 
              alt="Bringel Logo" 
              className="w-8 h-8 rounded-lg object-contain bg-white p-1"
            />
            {state === 'expanded' && (
              <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Inventário
              </h2>
            )}
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/80 font-medium tracking-wide">Sistema</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                      {state === 'expanded' && <span className="transition-all duration-200">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}