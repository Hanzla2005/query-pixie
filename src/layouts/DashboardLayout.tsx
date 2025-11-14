import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Brain, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const DashboardLayout = () => {
  const [userEmail, setUserEmail] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserEmail(session.user.email || "");
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/auth");
      } else if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col w-full">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40 flex items-center px-4">
            <SidebarTrigger className="mr-4" />
            <Link to="/dashboard" className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">DataMind</h1>
            </Link>
            <div className="ml-auto flex gap-4 items-center">
              <span className="text-sm text-muted-foreground hidden md:inline">{userEmail}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
