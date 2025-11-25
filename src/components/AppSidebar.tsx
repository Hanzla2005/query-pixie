import { Database, BarChart3, MessageSquare, TrendingUp, Table, LogOut, HelpCircle } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/useOnboarding";
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
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "My Datasets", url: "/dashboard/datasets", icon: Database },
  { title: "Overview", url: "/dashboard/overview", icon: TrendingUp },
  { title: "Data Preview", url: "/dashboard/preview", icon: Table },
  { title: "AI Chat", url: "/dashboard/chat", icon: MessageSquare },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { restartOnboarding } = useOnboarding();

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/");
  const hasActiveItem = menuItems.some((item) => isActive(item.url));

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <Sidebar collapsible="icon" className={open ? "w-64" : "w-16"} aria-label="Main navigation">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-4">
          <img src="/logo.png" alt="DataMind logo" className="h-8 w-8" />
          {open && (
            <div className="flex flex-col">
              <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                DataMind
              </h2>
              <p className="text-xs text-muted-foreground">Intelligent Analytics</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu role="navigation" aria-label="Main menu">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-muted/50 transition-all duration-200"
                      activeClassName="bg-primary/10 text-primary font-medium border-l-2 border-primary"
                      aria-label={item.title}
                      aria-current={isActive(item.url) ? "page" : undefined}
                    >
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={restartOnboarding}
              aria-label="Restart onboarding tour"
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              {open && <span className="ml-2">Help Tour</span>}
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={handleSignOut}
              aria-label="Sign out of your account"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {open && <span className="ml-2">Sign Out</span>}
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
