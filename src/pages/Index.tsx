import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Brain, Upload, MessageSquare, TrendingUp, Shield, Sparkles, Zap, Database, BrainCircuit } from "lucide-react";
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
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center bg-black overflow-hidden pt-24"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 0.4
          }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/15 to-white/15" />

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-16">

            {/* LEFT CONTENT */}
            <div className="lg:w-2/3">
              <p className="text-sm tracking-widest text-gray-300 uppercase">
                Built for Analysts, Researchers & Businesses
              </p>

              <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
                  Transform Data
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary/80 to-white bg-clip-text text-transparent">
                  Into AI Insights
                </span>
              </h1>

              <p className="max-w-xl mt-6 text-lg text-gray-300 sm:text-xl">
                Upload datasets, chat with AI, and unlock powerful analytics with
                stunning visualizations & intelligent insights.
              </p>

              {/* CTA BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-6 mt-10">
                <Link to="/auth">
                  <Button
                    size="lg"
                    className="px-10 py-6 text-lg bg-gradient-to-r from-primary to-primary/70 rounded-full shadow-lg hover:shadow-primary/40 hover:scale-[1.07] transition-transform"
                  >
                    <BrainCircuit className="mr-2 h-5 w-5" />
                    Start Analyzing Free
                  </Button>
                </Link>
              </div>

              {/* Hero Info / Stats */}
              <div className="inline-flex items-center pt-8 mt-12 border-gray-800">

                <span className="ml-2 text-base text-gray-300">
                  10,000+ insights generated last week
                </span>
              </div>

              {/* Stats */}
              <div ref={statsRef} className="grid grid-cols-3 gap-8 mt-16 max-w-2xl">
                <div className="text-center">
                  <div className="stat-number text-5xl font-bold text-primary" data-target="10000">
                    0
                  </div>
                  <p className="text-gray-400 text-sm mt-1">Active Users</p>
                </div>

                <div className="text-center">
                  <div className="stat-number text-5xl font-bold text-primary" data-target="50000">
                    0
                  </div>
                  <p className="text-gray-400 text-sm mt-1">Datasets Analyzed</p>
                </div>

                <div className="text-center">
                  <div className="stat-number text-5xl font-bold text-primary" data-target="99">
                    0
                  </div>
                  <p className="text-gray-400 text-sm mt-1">Accuracy %</p>
                </div>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="lg:absolute lg:right-0 lg:top-20 xl:top-10">
              <img
                className="w-full max-w-sm md:max-w-md lg:max-w-lg drop-shadow-2xl"
                src="/3d-visual.png"
                alt="3D Visualization"
              />
            </div>
          </div>
        </div>

      </section>



      {/* Features Section — Minimal Soft Grid Style */}
      <section className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">

        {/* Flipped Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            transform: "scaleY(-1)", // Flip only the image vertically
            zIndex: 0,
          }}
        />

        {/* Bright Soft Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/15 to-white/15 z-10" />

        {/* Content */}
        <div className="container mx-auto px-4 max-w-7xl relative z-20">

          {/* Heading */}
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Everything You Need to Analyze Data
            </h2>
            <p className="mt-4 md:mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
              AI-powered tools to simplify your workflow from upload to insights
            </p>
          </div>

          {/* Grid */}
          <div className="
      grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
      mt-16 lg:mt-24 text-center
      gap-y-16 md:gap-x-12
    ">
            {[
              { icon: Upload, title: "Easy Upload", desc: "Drag & drop CSVs or spreadsheets with instant schema detection." },
              { icon: MessageSquare, title: "AI Chat Assistant", desc: "Ask questions in natural language and get quick insights." },
              { icon: BarChart3, title: "Smart Visualizations", desc: "Auto-generate interactive 2D/3D charts in seconds." },
              { icon: TrendingUp, title: "Advanced Analytics", desc: "Correlation detection, trends, and statistical breakdowns." },
              { icon: Brain, title: "AI-Powered Insights", desc: "Reveal patterns and receive actionable recommendations." },
              { icon: Shield, title: "Secure & Private", desc: "Enterprise-level encryption keeps your data protected." },
            ].map((feature, index) => (
              <div
                key={index}
                className={`
            px-8 lg:px-14
            ${index >= 3 ? "md:border-t md:border-gray-300/50" : ""}
            ${index % 3 !== 0 ? "md:border-l md:border-gray-300/50" : ""}
          `}
              >
                {/* Icon */}
                <div className="w-16 h-16 flex mt-5 items-center justify-center mx-auto rounded-2xl">
                  <feature.icon className="h-12 w-12 text-primary" />
                </div>

                {/* Title */}
                <h3 className="mt-5 text-xl font-bold text-foreground">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mt-4 text-base text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
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
