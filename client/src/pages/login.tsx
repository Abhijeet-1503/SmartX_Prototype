import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, User, Crown } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface User {
  id: number;
  username: string;
  role: string;
  name: string;
  email?: string;
}

interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
}

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string>("");

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => 
      apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: (response) => {
      // Store auth data
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      // Redirect to dashboard
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      setError(error.message || "Login failed");
    },
  });

  const onSubmit = (data: LoginForm) => {
    setError("");
    loginMutation.mutate(data);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "god": return <Crown className="w-5 h-5 text-yellow-400" />;
      case "admin": return <Shield className="w-5 h-5 text-blue-400" />;
      case "teacher": return <User className="w-5 h-5 text-green-400" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const quickLogin = (credentials: { username: string; password: string; role: string }) => {
    form.setValue("username", credentials.username);
    form.setValue("password", credentials.password);
    onSubmit(credentials);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-cyan-500 p-3 rounded-2xl">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            SmartProctor-X
          </h1>
          <p className="text-slate-400 mt-2">Advanced AI-Powered Monitoring System</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white text-center">Access Control</CardTitle>
            <CardDescription className="text-slate-400 text-center">
              Enter your credentials to access the monitoring dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert className="bg-red-900/20 border-red-500/50 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
                          placeholder="Enter username"
                          autoComplete="username"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
                          placeholder="Enter password"
                          autoComplete="current-password"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-2 transition-all duration-200 transform hover:scale-105"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Authenticating..." : "Access System"}
                </Button>
              </form>
            </Form>

            {/* Quick Access Demo */}
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-slate-400 text-sm">Quick Access (Demo)</p>
              </div>
              
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  onClick={() => quickLogin({ username: "god", password: "dev2025!", role: "god" })}
                  className="w-full justify-start bg-slate-700/30 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/50"
                  disabled={loginMutation.isPending}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  God Mode (Full Access)
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => quickLogin({ username: "admin", password: "admin123", role: "admin" })}
                  className="w-full justify-start bg-slate-700/30 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50"
                  disabled={loginMutation.isPending}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Access
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => quickLogin({ username: "teacher1", password: "teacher123", role: "teacher" })}
                  className="w-full justify-start bg-slate-700/30 border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50"
                  disabled={loginMutation.isPending}
                >
                  <User className="w-4 h-4 mr-2" />
                  Teacher Access
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-slate-500 text-sm">
          Secured by AI-Enhanced Authentication System
        </div>
      </div>
    </div>
  );
}