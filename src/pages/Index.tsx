import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Brain, Upload, MessageSquare, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="DataMind" className="h-10 w-10" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                DataMind
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Intelligent Analytics</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="hover:bg-primary/10">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="container mx-auto px-4 py-28 md:py-40 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 animate-in fade-in duration-1000">
              <img src={logo} alt="DataMind" className="h-20 w-20 mx-auto drop-shadow-2xl" />
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
              Transform Data into <span className="text-primary-foreground/90">Insights</span> with AI
            </h2>
            <p className="text-xl md:text-2xl mb-10 opacity-90 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              Upload your datasets, chat with an AI assistant, and unlock powerful analytics and visualizations instantly.
            </p>
            <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="text-lg shadow-xl hover:shadow-2xl transition-all">
                  Start Analyzing Free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg border-primary-foreground/30 hover:bg-primary-foreground/10 backdrop-blur-sm">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Powerful Features for Data Analysis
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to explore, analyze, and visualize your data with AI assistance
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-primary/20 shadow-lg hover:shadow-glow transition-all duration-300 bg-gradient-card hover:scale-105">
              <CardContent className="p-8">
                <div className="rounded-2xl bg-primary/10 w-14 h-14 flex items-center justify-center mb-6 shadow-inner">
                  <Upload className="h-7 w-7 text-primary" />
                </div>
                <h4 className="text-2xl font-semibold mb-3">Easy Upload</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Drag and drop CSV or XLSX files. We handle the rest, from parsing to schema detection.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg hover:shadow-glow transition-all duration-300 bg-gradient-card hover:scale-105">
              <CardContent className="p-8">
                <div className="rounded-2xl bg-primary/10 w-14 h-14 flex items-center justify-center mb-6 shadow-inner">
                  <MessageSquare className="h-7 w-7 text-primary" />
                </div>
                <h4 className="text-2xl font-semibold mb-3">AI Chat Assistant</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Ask questions in natural language. Get instant answers, insights, and recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg hover:shadow-glow transition-all duration-300 bg-gradient-card hover:scale-105">
              <CardContent className="p-8">
                <div className="rounded-2xl bg-primary/10 w-14 h-14 flex items-center justify-center mb-6 shadow-inner">
                  <BarChart3 className="h-7 w-7 text-primary" />
                </div>
                <h4 className="text-2xl font-semibold mb-3">Smart Visualizations</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Generate charts and graphs automatically. Customize and export with one click.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg hover:shadow-glow transition-all duration-300 bg-gradient-card hover:scale-105">
              <CardContent className="p-8">
                <div className="rounded-2xl bg-primary/10 w-14 h-14 flex items-center justify-center mb-6 shadow-inner">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <h4 className="text-2xl font-semibold mb-3">Advanced Analytics</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Automatic statistical analysis, correlation detection, and trend identification.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg hover:shadow-glow transition-all duration-300 bg-gradient-card hover:scale-105">
              <CardContent className="p-8">
                <div className="rounded-2xl bg-primary/10 w-14 h-14 flex items-center justify-center mb-6 shadow-inner">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
                <h4 className="text-2xl font-semibold mb-3">AI-Powered Insights</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Discover hidden patterns and get actionable recommendations from your data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg hover:shadow-glow transition-all duration-300 bg-gradient-card hover:scale-105">
              <CardContent className="p-8">
                <div className="rounded-2xl bg-primary/10 w-14 h-14 flex items-center justify-center mb-6 shadow-inner">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h4 className="text-2xl font-semibold mb-3">Secure & Private</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Your data is encrypted and stored securely. Only you have access to your datasets.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 bg-gradient-hero text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h3 className="text-4xl md:text-5xl font-bold mb-6">Ready to Unlock Your Data's Potential?</h3>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Join thousands of analysts, researchers, and businesses using AI to make data-driven decisions.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg shadow-2xl hover:scale-105 transition-all">
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="DataMind" className="h-8 w-8" />
              <span className="font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                DataMind
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 DataMind. Transform your data with AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
