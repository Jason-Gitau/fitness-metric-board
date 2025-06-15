
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

type Mode = "login" | "signup";

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
        // Set redirect URL for email verification/etc as required by Supabase best practices
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 shadow rounded-xl border">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {mode === "login" ? "Login to Your Account" : "Sign Up"}
        </h2>
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
          />
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? (mode === "login" ? "Logging in..." : "Signing up...") : (mode === "login" ? "Login" : "Sign Up")}
          </Button>
        </form>
        <div className="mt-6 flex flex-col items-center gap-1">
          <span className="text-sm text-gray-500">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>
          <Button
            variant="link"
            type="button"
            className="text-blue-700 px-0"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            disabled={submitting}
          >
            {mode === "login" ? "Sign up" : "Login"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
