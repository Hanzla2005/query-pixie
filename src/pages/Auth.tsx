import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.session) {
        toast.success("Successfully signed in!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.session) {
        toast.success("Account created successfully!");
        navigate("/dashboard");
      } else if (data.user) {
        toast.success("Account created! You can now sign in.");
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[100px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[80px] animate-glow-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[60px] animate-glow-pulse delay-2000" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), 
                             linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-slide-in-up">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 rounded-xl blur-lg animate-pulse-glow" />
              <Brain className="h-12 w-12 text-primary relative z-10" />
            </div>
            <span className="text-4xl font-bold gradient-text">DataMind</span>
          </Link>
          <p className="text-muted-foreground">Welcome back! Sign in to continue.</p>
        </div>

        <div className="glass-card p-1 rounded-3xl animate-slide-in-up delay-100">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl gradient-text flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Authentication
              </CardTitle>
              <CardDescription>Sign in or create a new account to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1 rounded-xl">
                  <TabsTrigger value="signin" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-6">
                  <form onSubmit={handleSignIn} className="space-y-5" aria-label="Sign in form">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-foreground/80">Email</Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        className="bg-muted/30 border-border/50 focus:border-primary/50 rounded-xl h-12"
                        aria-describedby="email-hint"
                      />
                      <span id="email-hint" className="sr-only">Enter your registered email address</span>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-foreground/80">Password</Label>
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        className="bg-muted/30 border-border/50 focus:border-primary/50 rounded-xl h-12"
                        aria-describedby="password-hint"
                      />
                      <span id="password-hint" className="sr-only">Enter your password</span>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full crystal-button text-primary-foreground h-12 rounded-xl text-base" 
                      disabled={isLoading} 
                      aria-busy={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-6">
                  <form onSubmit={handleSignUp} className="space-y-5" aria-label="Sign up form">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-foreground/80">Email</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        className="bg-muted/30 border-border/50 focus:border-primary/50 rounded-xl h-12"
                        aria-describedby="signup-email-hint"
                      />
                      <span id="signup-email-hint" className="sr-only">Enter a valid email address for your account</span>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-foreground/80">Password</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="bg-muted/30 border-border/50 focus:border-primary/50 rounded-xl h-12"
                        aria-describedby="signup-password-hint"
                      />
                      <p id="signup-password-hint" className="text-xs text-muted-foreground">
                        Must be at least 6 characters long
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm" className="text-foreground/80">Confirm Password</Label>
                      <Input
                        id="signup-confirm"
                        name="confirm"
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="bg-muted/30 border-border/50 focus:border-primary/50 rounded-xl h-12"
                        aria-describedby="signup-confirm-hint"
                      />
                      <span id="signup-confirm-hint" className="sr-only">Re-enter your password to confirm</span>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full crystal-button text-primary-foreground h-12 rounded-xl text-base" 
                      disabled={isLoading} 
                      aria-busy={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center pt-2 pb-6">
              <p className="text-sm text-muted-foreground">
                By continuing, you agree to our Terms of Service
              </p>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center mt-8 animate-slide-in-up delay-200">
          <Link to="/" className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;