import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { InventoryProvider } from "@/contexts/InventoryContext";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <InventoryProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center border-b border-border px-4">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-lg font-semibold">Sistema de Inventário</h1>
            </header>
            
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </InventoryProvider>
  );
}