import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Brain, Upload, MessageSquare, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">DataMind</h1>
          </div>
          <div className="flex gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Transform Data into Insights with AI
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              Upload your datasets, chat with an AI assistant, and unlock powerful analytics and visualizations instantly.
            </p>
            <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="text-lg">
                  Start Analyzing Free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg border-primary-foreground/20 hover:bg-primary-foreground/10">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Data Analysis</h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to explore, analyze, and visualize your data with AI assistance
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-card">
              <CardContent className="p-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Easy Upload</h4>
                <p className="text-muted-foreground">
                  Drag and drop CSV or XLSX files. We handle the rest, from parsing to schema detection.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-card">
              <CardContent className="p-6">
                <div className="rounded-full bg-accent/10 w-12 h-12 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-accent" />
                </div>
                <h4 className="text-xl font-semibold mb-2">AI Chat Assistant</h4>
                <p className="text-muted-foreground">
                  Ask questions in natural language. Get instant answers, insights, and recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-card">
              <CardContent className="p-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Smart Visualizations</h4>
                <p className="text-muted-foreground">
                  Generate charts and graphs automatically. Customize and export with one click.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-card">
              <CardContent className="p-6">
                <div className="rounded-full bg-accent/10 w-12 h-12 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Advanced Analytics</h4>
                <p className="text-muted-foreground">
                  Automatic statistical analysis, correlation detection, and trend identification.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-card">
              <CardContent className="p-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">AI-Powered Insights</h4>
                <p className="text-muted-foreground">
                  Discover hidden patterns and get actionable recommendations from your data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-card">
              <CardContent className="p-6">
                <div className="rounded-full bg-accent/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Secure & Private</h4>
                <p className="text-muted-foreground">
                  Your data is encrypted and stored securely. Only you have access to your datasets.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Unlock Your Data's Potential?</h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of analysts, researchers, and businesses using AI to make data-driven decisions.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg">
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-semibold">DataMind</span>
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
