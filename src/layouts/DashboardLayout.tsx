import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Brain, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import OnboardingTour from "@/components/OnboardingTour";
import { OnboardingProvider } from "@/hooks/useOnboarding";

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
    <OnboardingProvider>
      <SidebarProvider>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
          Skip to main content
        </a>
        
        {/* Global Background Effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
        </div>
        
        <div className="min-h-screen w-full flex bg-background relative z-10">
          <AppSidebar />
          
          <div className="flex-1 flex flex-col w-full">
            {/* Header */}
            <header className="h-16 border-b border-border/30 backdrop-blur-glass sticky top-0 z-40 flex items-center px-4" role="banner">
              <SidebarTrigger className="mr-4 text-foreground/70 hover:text-foreground transition-colors" aria-label="Toggle sidebar menu" />
              <Link to="/dashboard" className="flex items-center gap-3" aria-label="DataMind home">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-lg blur-md" />
                  <Brain className="h-6 w-6 text-primary relative z-10" aria-hidden="true" />
                </div>
                <h1 className="text-xl font-bold gradient-text">DataMind</h1>
              </Link>
              <div className="ml-auto flex gap-4 items-center">
                <span className="text-sm text-muted-foreground hidden md:inline" aria-label="Logged in as">{userEmail}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-foreground/70 hover:text-foreground hover:bg-white/5"
                  aria-label="Sign out of your account"
                >
                  <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                  Sign Out
                </Button>
              </div>
            </header>

            {/* Main Content */}
            <main id="main-content" className="flex-1 overflow-auto" role="main" tabIndex={-1}>
              <Outlet />
            </main>
          </div>
        </div>
        <OnboardingTour />
      </SidebarProvider>
    </OnboardingProvider>
  );
};

export default DashboardLayout;