import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setIsEmailSent(true);
      toast.success("Password reset email sent successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center py-16 lg:py-24">
          <div className="container max-w-lg">
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-7 w-7 text-green-600" />
                  </div>
                </div>
                <CardTitle className="font-display text-2xl">Check Your Email</CardTitle>
                <CardDescription>
                  We've sent a password reset link to {email}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click the link in the email to reset your password. If you don't see it, check your spam folder.
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => setIsEmailSent(false)}
                    variant="outline" 
                    className="w-full"
                  >
                    Try Different Email
                  </Button>
                  <Link to="/login">
                    <Button className="w-full bg-primary text-white hover:bg-primary/90">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex items-center justify-center py-16 lg:py-24">
        <div className="container max-w-lg">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center">
                  <Heart className="h-7 w-7 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="font-display text-2xl">Forgot Password?</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;