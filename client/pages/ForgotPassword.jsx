import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Mail, Shield, Key, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsEmailSent(true);
        toast.success("Password reset instructions sent to your email!");
      } else {
        toast.error(data.message || "Failed to send reset email. Please try again.");
      }
    } catch (error) {
      toast.error("Connection error. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-600">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Floating Security Elements */}
        <div className="absolute top-20 left-12 w-36 h-36 bg-purple-400/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-28 right-20 w-52 h-52 bg-indigo-300/20 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-blue-400/40 rounded-full blur-lg animate-ping"></div>
        
        {/* Animated Security Waves */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,40 Q25,20 50,40 T100,40 V100 H0 Z" fill="rgba(255,255,255,0.1)" className="animate-pulse" />
            <path d="M0,60 Q25,40 50,60 T100,60 V100 H0 Z" fill="rgba(255,255,255,0.05)" className="animate-pulse" style={{ animationDelay: '2s' }} />
          </svg>
        </div>
      </div>

      {/* Forgot Password Card */}
      <Card className="w-full max-w-md mx-4 backdrop-blur-sm bg-white/95 shadow-2xl border-0 relative z-10">
        {!isEmailSent ? (
          <>
            <CardHeader className="space-y-4 text-center pb-6">
              {/* Security Shield Icon */}
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Reset Your Password
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  Enter your email address and we'll send you reset instructions
                </CardDescription>
              </div>

              {/* Security Info Banner */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-100">
                <p className="text-xs text-purple-700 font-medium">🔒 Your account security is our priority</p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 transform hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Reset Link...
                    </div>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Reset Instructions
                    </>
                  )}
                </Button>
              </form>

              {/* Back to Login Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm text-purple-600 hover:text-purple-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </div>

              {/* Security Note */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  🛡️ Reset link will expire in 24 hours for security
                </p>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            {/* Email Sent Success State */}
            <CardHeader className="space-y-4 text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Check Your Email
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  We've sent password reset instructions to your email
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center">
                  <Key className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Reset Email Sent!</h3>
                    <p className="text-xs text-green-700 mt-1">
                      Check your inbox and click the reset link to create a new password
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                
                <Button 
                  onClick={() => setIsEmailSent(false)}
                  variant="outline"
                  className="w-full h-11 border-gray-300 hover:bg-gray-50"
                >
                  Try Different Email
                </Button>
              </div>

              <div className="text-center pt-4 border-t border-gray-200">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm text-purple-600 hover:text-purple-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
