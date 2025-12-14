import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, Brain, Upload, MessageSquare, TrendingUp, Shield, Sparkles, Zap, Database, BrainCircuit, ArrowRight, Play, X } from "lucide-react";
import { Link } from "react-router-dom";
import datamindLogo from "@/assets/datamind-logo.png";
import heroBackground from "@/assets/hero-background.png";
import featureOverview from "@/assets/feature-overview.png";
import featureAiChat from "@/assets/feature-ai-chat.png";
import featureVisualizations from "@/assets/feature-visualizations.png";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // GSAP: Floating particles animation
    if (particlesRef.current) {
      const particles = particlesRef.current.querySelectorAll('.particle');
      particles.forEach((particle, index) => {
        gsap.to(particle, {
          y: `random(-50, 50)`,
          x: `random(-30, 30)`,
          opacity: `random(0.2, 0.8)`,
          scale: `random(0.8, 1.3)`,
          duration: `random(4, 8)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.3
        });
      });
    }

    // GSAP: Hero text animation
    gsap.from('.hero-title', {
      opacity: 0,
      y: 80,
      duration: 1,
      ease: 'power3.out'
    });

    gsap.from('.hero-subtitle', {
      opacity: 0,
      y: 60,
      duration: 0.8,
      delay: 0.2,
      ease: 'power3.out'
    });

    gsap.from('.hero-cta', {
      opacity: 0,
      y: 40,
      duration: 0.6,
      delay: 0.4,
      ease: 'power3.out'
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
        y: 60,
        duration: 0.6,
        delay: index * 0.1,
        ease: 'power2.out'
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
    gsap.to('.logo-glow', {
      scale: 1.1,
      opacity: 0.8,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });

    // Animate glass cards on scroll
    gsap.utils.toArray<HTMLElement>('.glass-animate').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top bottom-=50',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power2.out'
      });
    });

  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Background Image */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.5
          }}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] animate-glow-pulse delay-1000" />
      </div>

      {/* Floating Particles */}
      <div ref={particlesRef} className="particles-container fixed inset-0 pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-glass border-b border-border/30">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-xl blur-lg logo-glow" />
              <img src={datamindLogo} alt="DataMind" className="h-12 w-12 relative z-10 rounded-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">DataMind</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">AI-Powered Analytics</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="text-foreground/80 hover:text-foreground hover:bg-white/5 transition-all">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="crystal-button text-primary-foreground">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-24 pb-12">
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 hero-cta">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground/80">Built for Analysts, Researchers & Businesses</span>
              </div>

              <h1 className="hero-title text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="gradient-text-glow">Transform Data</span>
                <br />
                <span className="text-foreground">Into AI Insights</span>
              </h1>

              <p className="hero-subtitle text-lg sm:text-xl text-muted-foreground max-w-xl mb-10 mx-auto lg:mx-0">
                Upload datasets, chat with AI, and unlock powerful analytics with stunning visualizations & intelligent insights.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start hero-cta">
                <Link to="/auth">
                  <Button size="lg" className="crystal-button text-primary-foreground px-8 py-6 text-lg w-full sm:w-auto">
                    <BrainCircuit className="mr-2 h-5 w-5" />
                    Start Analyzing Free
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-6 text-lg border-primary/30 bg-primary/5 hover:bg-primary/10 backdrop-blur-sm text-foreground"
                  onClick={() => setShowVideo(true)}
                >
                  <Play className="mr-2 h-5 w-5 text-primary" />
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div ref={statsRef} className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="stat-number text-3xl sm:text-4xl font-bold text-primary text-glow" data-target="10000">0</div>
                  <p className="text-muted-foreground text-sm mt-1">Active Users</p>
                </div>
                <div className="text-center lg:text-left">
                  <div className="stat-number text-3xl sm:text-4xl font-bold text-primary text-glow" data-target="50000">0</div>
                  <p className="text-muted-foreground text-sm mt-1">Datasets Analyzed</p>
                </div>
                <div className="text-center lg:text-left">
                  <div className="stat-number text-3xl sm:text-4xl font-bold text-primary text-glow" data-target="99">0</div>
                  <p className="text-muted-foreground text-sm mt-1">Accuracy %</p>
                </div>
              </div>
            </div>

            {/* Right - 3D Visual */}
            <div className="lg:w-1/2 relative">
              <div className="relative">
                {/* Glow Effect Behind Image */}
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-[60px] animate-glow-pulse" />
                
                {/* Glass Container */}
                <div className="relative glass-card p-2 rounded-3xl">
                  <img
                    className="w-full max-w-lg mx-auto drop-shadow-2xl rounded-2xl"
                    src="/3d-visual.png"
                    alt="3D Data Visualization"
                  />
                  
                  {/* Floating Cards */}
                  <div className="absolute -top-6 -right-6 glass-card px-4 py-3 rounded-xl float-animation">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">+127% Growth</span>
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-4 -left-4 glass-card px-4 py-3 rounded-xl float-animation delay-500">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-accent" />
                      <span className="text-sm font-medium">AI Insights Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 lg:py-32">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16 glass-animate">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground/80">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to <span className="gradient-text">Analyze Data</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AI-powered tools to simplify your workflow from upload to insights
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Upload, title: "Easy Upload", desc: "Drag & drop CSVs or spreadsheets with instant schema detection.", color: "primary" },
              { icon: MessageSquare, title: "AI Chat Assistant", desc: "Ask questions in natural language and get quick insights.", color: "accent" },
              { icon: BarChart3, title: "Smart Visualizations", desc: "Auto-generate interactive 2D/3D charts in seconds.", color: "secondary" },
              { icon: TrendingUp, title: "Advanced Analytics", desc: "Correlation detection, trends, and statistical breakdowns.", color: "primary" },
              { icon: Brain, title: "AI-Powered Insights", desc: "Reveal patterns and receive actionable recommendations.", color: "accent" },
              { icon: Shield, title: "Secure & Private", desc: "Enterprise-level encryption keeps your data protected.", color: "secondary" },
            ].map((feature, index) => (
              <div
                key={index}
                className="feature-card glass-card p-6 rounded-2xl group hover:scale-[1.02] transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-5 group-hover:shadow-glow transition-all duration-300`}>
                  <feature.icon className={`h-7 w-7 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={() => setShowVideo(false)} />
          <div className="relative w-full max-w-5xl glass-card rounded-3xl overflow-hidden">
            <button 
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="aspect-video">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="DataMind Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Visualization Showcase */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 glass-animate">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground/80">Core Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful <span className="gradient-text">Analytics Tools</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to understand your data with AI-powered insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Dataset Overview */}
            <div className="glass-card p-6 rounded-3xl group hover:scale-[1.02] transition-all duration-500 glass-animate">
              <div className="h-48 rounded-2xl overflow-hidden relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
                <img 
                  src={featureOverview} 
                  alt="Dataset Overview & Analysis" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Dataset Overview</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Get comprehensive summaries, key findings, and statistical breakdowns of your entire dataset powered by AI analysis.
              </p>
            </div>

            {/* Smart Visualizations */}
            <div className="glass-card p-6 rounded-3xl group hover:scale-[1.02] transition-all duration-500 glass-animate delay-100">
              <div className="h-48 rounded-2xl overflow-hidden relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
                <img 
                  src={featureVisualizations} 
                  alt="Smart Visualizations" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-xl font-bold">Smart Visualizations</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Auto-generate beautiful charts including scatter plots, bar charts, pie charts, and trend lines based on your data.
              </p>
            </div>

            {/* AI Chat */}
            <div className="glass-card p-6 rounded-3xl group hover:scale-[1.02] transition-all duration-500 glass-animate delay-200">
              <div className="h-48 rounded-2xl overflow-hidden relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
                <img 
                  src={featureAiChat} 
                  alt="AI Chat Assistant" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="text-xl font-bold">AI Chat Assistant</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Ask questions about your data in natural language and receive instant insights, recommendations, and answers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] animate-glow-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center glass-animate">
            <div className="glass-card p-12 rounded-3xl">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Ready to <span className="gradient-text">Transform Your Data?</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join thousands of analysts and researchers using AI to unlock insights from their data
              </p>
              
              <Link to="/auth">
                <Button size="lg" className="crystal-button text-primary-foreground px-12 py-8 text-lg">
                  <Sparkles className="mr-2 h-6 w-6" />
                  Start Free Today
                </Button>
              </Link>

              <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span>Setup in 30 seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span>AI-powered insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/30 py-12 backdrop-blur-glass">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-lg blur-md" />
                <img src={datamindLogo} alt="DataMind" className="h-10 w-10 relative z-10 rounded-lg" />
              </div>
              <div>
                <span className="text-lg font-bold gradient-text">DataMind</span>
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