"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function SignIn() {
  const { user, googleSignIn, githubSignIn, emailSignIn, emailSignUp, resetPassword } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Generate dots only on client side to avoid hydration mismatch
  const dots = useMemo(() => {
    if (!mounted) return [];
    return [...Array(100)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
    }));
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      router.push("/roadmap");
    }
  }, [user, router]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        if (!formData.name.trim()) {
          setError("Please enter your name");
          setLoading(false);
          return;
        }
        await emailSignUp(formData.email, formData.password, formData.name);
      } else {
        await emailSignIn(formData.email, formData.password);
      }
    } catch (error) {
      console.error("Auth error:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("Email already in use. Try signing in instead.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await resetPassword(formData.email);
      setResetSuccess(true);
    } catch (error) {
      console.error("Reset error:", error);
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider) => {
    setLoading(true);
    setError("");
    try {
      if (provider === "google") {
        await googleSignIn();
      } else if (provider === "github") {
        await githubSignIn();
      }
    } catch (error) {
      console.error("Social sign-in error:", error);
      setError("Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] relative bg-background overflow-hidden flex items-center justify-center">
      {/* Animated dots background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {dots.map((dot) => (
          <div
            key={dot.id}
            className="dot absolute w-1 h-1 bg-foreground/20 rounded-full animate-pulse"
            style={{
              left: `${dot.left}%`,
              top: `${dot.top}%`,
              animationDelay: `${dot.delay}s`,
              animationDuration: `${dot.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 h-full py-16 flex items-center justify-center">
        <div className="container m-auto px-6 md:px-12">
          <div className="m-auto max-w-md">
            <div className="rounded-2xl bg-background/80 backdrop-blur-sm border border-border p-8 sm:p-12">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <Image
                  src="/InnoVision_LOGO-removebg-preview.png"
                  alt="InnoVision Logo"
                  width={60}
                  height={60}
                  priority
                />
              </div>

              {/* Heading */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-foreground text-sm font-light mb-4">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{resetMode ? "Reset Password" : isSignUp ? "Create Account" : "Welcome Back"}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-light text-foreground mb-2">
                  {resetMode ? "Reset Your Password" : isSignUp ? "Sign up for InnoVision" : "Sign in to InnoVision"}
                </h2>
                <p className="text-muted-foreground font-light text-sm">
                  {resetMode ? "Enter your email to receive a reset link" : "Continue your learning journey"}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {resetSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                  Password reset email sent! Check your inbox.
                </div>
              )}

              {resetMode ? (
                /* Password Reset Form */
                <form onSubmit={handlePasswordReset} className="space-y-4 mb-6">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full h-12 pl-12 pr-4 border border-border rounded-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-light"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-light transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setResetMode(false);
                      setResetSuccess(false);
                      setError("");
                    }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to sign in
                  </button>
                </form>
              ) : (
                <>
                  {/* Email/Password Form */}
                  <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
                    {isSignUp && (
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          type="text"
                          name="name"
                          placeholder="Full name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full h-12 pl-12 pr-4 border border-border rounded-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-light"
                        />
                      </div>
                    )}

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full h-12 pl-12 pr-4 border border-border rounded-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-light"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full h-12 pl-12 pr-12 border border-border rounded-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-light"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    {!isSignUp && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setResetMode(true)}
                          className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-light transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-background text-muted-foreground font-light">Or continue with</span>
                    </div>
                  </div>

                  {/* Social Sign in buttons */}
                  <div className="space-y-3 mb-6">
                    <button
                      onClick={() => handleSocialSignIn("github")}
                      disabled={loading}
                      className="group w-full h-12 px-6 border border-border rounded-full transition-all duration-300 hover:border-foreground/30 hover:bg-muted hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        className="w-5 h-5 text-foreground"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                      </svg>
                      <span className="font-light text-foreground">Continue with GitHub</span>
                    </button>

                    <button
                      onClick={() => handleSocialSignIn("google")}
                      disabled={loading}
                      className="group w-full h-12 px-6 border border-border rounded-full transition-all duration-300 hover:border-foreground/30 hover:bg-muted hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <img src="/google.png" alt="Google" className="w-5 h-5" />
                      <span className="font-light text-foreground">Continue with Google</span>
                    </button>
                  </div>

                  {/* Toggle Sign Up/Sign In */}
                  <div className="text-center">
                    <button
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError("");
                        setFormData({ name: "", email: "", password: "" });
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isSignUp ? "Already have an account? " : "Don't have an account? "}
                      <span className="text-blue-500 hover:text-blue-600 font-medium">
                        {isSignUp ? "Sign in" : "Sign up"}
                      </span>
                    </button>
                  </div>
                </>
              )}

              {/* Terms */}
              <div className="mt-8 space-y-3 text-muted-foreground text-center">
                <p className="text-xs font-light">
                  By proceeding, you agree to our{" "}
                  <a href="/terms" className="underline hover:text-foreground transition-colors">
                    Terms of Use
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="underline hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
