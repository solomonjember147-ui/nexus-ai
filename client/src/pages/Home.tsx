import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { CheckCircle2, Zap, BarChart3, Shield, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    navigate("/tasks");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold text-foreground">Nexus AI</h1>
          </div>
          <a href={getLoginUrl()} className="text-foreground hover:text-accent transition-colors">
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-accent font-medium">AI-Powered Productivity Platform</span>
          </div>

          <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
            Work Smarter with{" "}
            <span className="bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
              AI Assistance
            </span>
          </h2>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Combine intelligent task management, knowledge base organization, and real-time AI insights to maximize your productivity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a href={getLoginUrl()}>
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Smart Task Management</h3>
              <p className="text-muted-foreground">
                AI-powered prioritization and automatic summaries for intelligent task organization.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors">
              <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Knowledge Base</h3>
              <p className="text-muted-foreground">
                Store, organize, and retrieve documents with AI-assisted search and retrieval.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors">
              <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Analytics & Insights</h3>
              <p className="text-muted-foreground">
                Track productivity metrics and visualize your progress with interactive dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-foreground text-center mb-16">
            Powerful Features for Modern Teams
          </h3>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent/20">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">AI Task Summarization</h4>
                  <p className="text-muted-foreground">
                    Automatically generate concise summaries and actionable insights for every task.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent/20">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Secure & Private</h4>
                  <p className="text-muted-foreground">
                    Role-based access control and secure authentication for your peace of mind.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent/20">
                    <BarChart3 className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Real-time Analytics</h4>
                  <p className="text-muted-foreground">
                    Monitor your productivity with interactive charts and detailed metrics.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent/20">
                    <CheckCircle2 className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Intelligent Prioritization</h4>
                  <p className="text-muted-foreground">
                    Let AI help you focus on what matters most with smart priority suggestions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent/20">
                    <Zap className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Fast & Responsive</h4>
                  <p className="text-muted-foreground">
                    Lightning-fast interface designed for seamless productivity workflows.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent/20">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Notifications & Alerts</h4>
                  <p className="text-muted-foreground">
                    Stay informed with real-time notifications for task updates and AI insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-foreground mb-6">
            Ready to transform your productivity?
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of professionals using Nexus AI to work smarter and achieve more.
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="gap-2">
              Start for Free <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground text-sm">
          <p>&copy; 2026 Nexus AI. Powered by advanced AI technology.</p>
        </div>
      </footer>
    </div>
  );
}
