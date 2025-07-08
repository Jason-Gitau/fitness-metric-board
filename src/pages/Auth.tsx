
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Users, TrendingUp, Activity } from "lucide-react";

type Mode = "login" | "signup";

const SUGGESTION_CARDS = [
  { icon: <Users className="w-5 h-5" />, text: "Track member attendance and growth", color: "from-blue-500/20 to-purple-500/20 border-blue-500/30" },
  { icon: <TrendingUp className="w-5 h-5" />, text: "Analyze gym performance metrics", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30" },
  { icon: <Activity className="w-5 h-5" />, text: "Monitor member health progress", color: "from-orange-500/20 to-red-500/20 border-orange-500/30" },
  { icon: <Zap className="w-5 h-5" />, text: "Automate gym operations efficiently", color: "from-violet-500/20 to-pink-500/20 border-violet-500/30" }
];

const WEBHOOK_URL = "https://dolphin-precise-quetzal.ngrok-free.app/webhook-test/b81fd764-f0b3-481c-a3cc-d2e881cdf11c";

const AuthPage: React.FC = () => {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const { session, user, loading } = useAuthState();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (!email || !password) {
      toast({ title: "Error", description: "Please provide email and password", variant: "destructive" });
      setSubmitting(false);
      return;
    }
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) toast({ title: "Login failed", description: error.message, variant: "destructive" });
        else toast({ title: "Logged in successfully" });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectUrl } });
        if (error) toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
        else toast({ title: "Sign up successful", description: "Please check your email to activate your account." });
      }
    } catch (error: any) {
      toast({ title: "Auth failed", description: error.message || "Unknown error", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: chatInput.trim(),
          timestamp: new Date().toISOString(),
          source: "landing_page"
        }),
      });

      if (response.ok) {
        toast({ title: "Message sent!", description: "We'll get back to you shortly." });
        setChatInput("");
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      toast({ 
        title: "Failed to send message", 
        description: "Please try again later.", 
        variant: "destructive" 
      });
    }
    setSendingMessage(false);
  };

  const handleSuggestionClick = (suggestionText: string) => {
    setChatInput(suggestionText);
  };

  if (showAuthForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-lg p-8 rounded-2xl border border-slate-700/50 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              {mode === "login" ? "Welcome Back" : "Join FIT OS"}
            </h2>
            <p className="text-slate-400 text-sm">
              {mode === "login" ? "Sign in to your gym management account" : "Create your gym management account"}
            </p>
          </div>
          
          <form className="space-y-4" onSubmit={handleAuth}>
            <Input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              disabled={submitting}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
            />
            <Input
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Password"
              value={password}
              disabled={submitting}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
            />
            <Button 
              type="submit" 
              disabled={submitting} 
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {submitting ? (mode === "login" ? "Signing in..." : "Creating account...") : (mode === "login" ? "Sign In" : "Create Account")}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <span className="text-slate-400 text-sm">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            </span>
            <Button
              variant="link"
              type="button"
              className="text-blue-400 hover:text-blue-300 px-2"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              disabled={submitting}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </Button>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => setShowAuthForm(false)}
            className="w-full mt-4 text-slate-400 hover:text-white hover:bg-slate-700/50"
          >
            ← Back to landing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-emerald-500/10"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Main Logo/Title */}
        <div className="mb-12">
          <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent mb-4 tracking-tight">
            FIT OS
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The intelligent gym management system that transforms how you run your fitness business
          </p>
        </div>

        {/* Functional Chat Input */}
        <form onSubmit={handleChatSubmit} className="w-full max-w-2xl mb-12">
          <div className="relative">
            <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-4 shadow-2xl">
              <div className="flex items-center space-x-3">
                <Zap className="w-6 h-6 text-blue-400 flex-shrink-0" />
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask anything about your gym..."
                  disabled={sendingMessage}
                  className="flex-1 bg-transparent border-none text-white placeholder:text-slate-400 text-lg focus:ring-0 focus:outline-none p-0"
                />
                <Button
                  type="submit"
                  disabled={!chatInput.trim() || sendingMessage}
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 hover:text-blue-400 hover:bg-slate-700/50 transition-colors flex-shrink-0"
                >
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Suggestion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-12">
          {SUGGESTION_CARDS.map((card, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(card.text)}
              className={`group cursor-pointer bg-gradient-to-r ${card.color} backdrop-blur-lg rounded-xl border p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-white">
                  {card.icon}
                </div>
                <p className="text-white font-medium text-left flex-1">
                  {card.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => setShowAuthForm(true)}
            className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setMode("login");
              setShowAuthForm(true);
            }}
            className="border-slate-600 text-slate-300 hover:bg-slate-800/50 hover:text-white px-8 py-4 rounded-xl transition-all duration-200 text-lg backdrop-blur-lg"
          >
            Sign In
          </Button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <p className="text-slate-500 text-sm">
            Revolutionizing gym management with AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
