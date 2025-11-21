import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Brain, Upload, MessageSquare, TrendingUp, Shield, Sparkles, Zap, Database } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP: Floating particles animation
    if (particlesRef.current) {
      const particles = particlesRef.current.querySelectorAll('.particle');
      particles.forEach((particle, index) => {
        gsap.to(particle, {
          y: `random(-30, 30)`,
          x: `random(-20, 20)`,
          opacity: `random(0.3, 0.8)`,
          scale: `random(1, 1.2)`,
          rotation: 360,
          duration: `random(2, 4)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.2
        });
      });
    }

    // GSAP: Hero text animation
    gsap.from('.hero-title', {
      opacity: 0,
      y: 100,
      duration: 1.2,
      ease: 'power4.out'
    });

    gsap.from('.hero-subtitle', {
      opacity: 0,
      y: 80,
      duration: 1,
      delay: 0.3,
      ease: 'power4.out'
    });

    gsap.from('.hero-cta', {
      opacity: 0,
      scale: 0.8,
      duration: 0.8,
      delay: 0.6,
      ease: 'back.out(1.7)'
    });

    // GSAP: Feature cards scroll animation
    gsap.utils.toArray<HTMLElement>('.feature-card').forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top bottom-=100',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 100,
        rotation: -5,
        duration: 0.8,
        delay: index * 0.1,
        ease: 'power3.out'
      });
    });

    // GSAP: Stats counter animation
    if (statsRef.current) {
      const stats = statsRef.current.querySelectorAll('.stat-number');
      stats.forEach((stat) => {
        const target = parseInt(stat.getAttribute('data-target') || '0');
        gsap.from(stat, {
          scrollTrigger: {
            trigger: stat,
            start: 'top bottom-=100',
            once: true,
            onEnter: () => {
              gsap.to(stat, {
                innerHTML: target,
                duration: 2,
                snap: { innerHTML: 1 },
                ease: 'power2.out'
              });
            }
          }
        });
      });
    }

    // GSAP: Logo pulse animation
    gsap.to('.logo-pulse', {
      scale: 1.1,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });

    // GSAP: Nav animation on scroll
    gsap.to('nav', {
      scrollTrigger: {
        trigger: 'nav',
        start: 'top top',
        end: '+=100',
        scrub: true
      },
      backdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)'
    });

  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/60 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="DataMind" className="h-10 w-10 logo-pulse" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                DataMind
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">AI-Powered Analytics</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="hover:bg-primary/10 hover:scale-105 transition-all">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-primary to-primary/70 hover:shadow-glow hover:scale-105 transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background pt-20">
        {/* Animated particles background */}
        <div ref={particlesRef} className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                background: `radial-gradient(circle, hsl(var(--primary) / ${Math.random() * 0.3 + 0.1}) 0%, transparent 70%)`,
                borderRadius: '50%',
                pointerEvents: 'none'
              }}
            />
          ))}
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block mb-8">
              <img src={logo} alt="DataMind" className="h-24 w-24 mx-auto drop-shadow-2xl animate-float" />
            </div>
            
            <h2 className="hero-title text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
              Transform Data into
              <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
                Insights with AI
              </span>
            </h2>
            
            <p className="hero-subtitle text-xl md:text-3xl mb-12 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Upload datasets, chat with AI, and unlock powerful analytics with stunning 3D visualizations
            </p>
            
            <div className="hero-cta flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-primary to-primary/80 hover:shadow-glow hover:scale-110 transition-all group">
                  <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Start Analyzing Free
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 hover:bg-primary/10 hover:scale-110 transition-all">
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Stats Section */}
            <div ref={statsRef} className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="stat-number text-5xl font-bold text-primary mb-2" data-target="10000">0</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="stat-number text-5xl font-bold text-primary mb-2" data-target="50000">0</div>
                <div className="text-sm text-muted-foreground">Datasets Analyzed</div>
              </div>
              <div className="text-center">
                <div className="stat-number text-5xl font-bold text-primary mb-2" data-target="99">0</div>
                <div className="text-sm text-muted-foreground">Accuracy %</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-b from-background via-muted/20 to-background relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-24">
            <div className="inline-block mb-4 px-6 py-2 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm font-semibold text-primary flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Powerful Features
              </span>
            </div>
            <h3 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Everything You Need to Analyze Data
            </h3>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Advanced AI-powered tools for data exploration, visualization, and insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              { icon: Upload, title: "Easy Upload", desc: "Drag and drop CSV or XLSX files. Automatic parsing and schema detection.", color: "from-blue-500 to-cyan-500" },
              { icon: MessageSquare, title: "AI Chat Assistant", desc: "Ask questions in natural language. Get instant answers and insights.", color: "from-purple-500 to-pink-500" },
              { icon: BarChart3, title: "Smart Visualizations", desc: "Generate 2D and 3D charts automatically. Customize and export easily.", color: "from-green-500 to-emerald-500" },
              { icon: TrendingUp, title: "Advanced Analytics", desc: "Statistical analysis, correlation detection, and trend identification.", color: "from-orange-500 to-red-500" },
              { icon: Brain, title: "AI-Powered Insights", desc: "Discover hidden patterns and get actionable recommendations.", color: "from-indigo-500 to-purple-500" },
              { icon: Shield, title: "Secure & Private", desc: "Enterprise-grade encryption. Your data stays completely private.", color: "from-teal-500 to-cyan-500" }
            ].map((feature, index) => (
              <Card key={index} className="feature-card group relative border-primary/20 shadow-lg hover:shadow-glow transition-all duration-500 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden hover:scale-105 hover:-rotate-1">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{
                  background: `linear-gradient(135deg, var(--primary), transparent)`
                }} />
                <CardContent className="p-8 relative z-10">
                  <div className={`rounded-2xl bg-gradient-to-br ${feature.color} w-16 h-16 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{feature.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3D Visualization Showcase */}
      <section className="py-32 bg-gradient-to-br from-primary/5 via-background to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMy4zMTQtMi42ODYtNi02LTZzLTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2IDYtMi42ODYgNi02em0wIDI4YzAtMy4zMTQtMi42ODYtNi02LTZzLTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2IDYtMi42ODYgNi02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-block mb-6 px-6 py-2 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm font-semibold text-primary flex items-center gap-2">
                <Database className="h-4 w-4" />
                Advanced Capabilities
              </span>
            </div>
            <h3 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Stunning 3D Visualizations
            </h3>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Explore your data in three dimensions with interactive charts powered by cutting-edge AI
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mt-16">
              <div className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 hover:scale-105 transition-all duration-300 shadow-lg">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl mb-6 flex items-center justify-center">
                  <BarChart3 className="h-24 w-24 text-primary animate-pulse" />
                </div>
                <h4 className="text-2xl font-bold mb-3">3D Scatter Plots</h4>
                <p className="text-muted-foreground">Visualize multi-dimensional relationships in your data with interactive 3D scatter plots</p>
              </div>
              
              <div className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 hover:scale-105 transition-all duration-300 shadow-lg">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl mb-6 flex items-center justify-center">
                  <TrendingUp className="h-24 w-24 text-primary animate-pulse" />
                </div>
                <h4 className="text-2xl font-bold mb-3">Surface Plots</h4>
                <p className="text-muted-foreground">Analyze complex trends and patterns with beautiful 3D surface visualizations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-primary via-primary/90 to-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_50%)]" />
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
              Ready to Transform Your Data?
            </h3>
            <p className="text-xl md:text-2xl mb-12 opacity-90">
              Join thousands of analysts and researchers using AI to unlock insights from their data
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-12 py-8 shadow-2xl hover:scale-110 hover:shadow-glow transition-all group bg-background text-foreground">
                <Sparkles className="mr-2 h-6 w-6 group-hover:rotate-12 transition-transform" />
                Start Free Today
              </Button>
            </Link>
            
            <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span>Setup in 30 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                <span>AI-powered insights</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-16 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="DataMind" className="h-10 w-10" />
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  DataMind
                </span>
                <p className="text-xs text-muted-foreground">AI-Powered Analytics Platform</p>
              </div>
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
