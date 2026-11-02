import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [fishPositions, setFishPositions] = useState([]);
  const navigate = useNavigate();

  // Predefined admin accounts
  const adminAccounts = [
    { 
      username: "admin", 
      email: "admin@mithiriver.com", 
      password: "admin123", 
      name: "System Administrator",
      role: "admin" 
    },
    { 
      username: "supervisor", 
      email: "supervisor@mithiriver.com", 
      password: "super123", 
      name: "Water Quality Supervisor",
      role: "admin" 
    },
    { 
      username: "moderator", 
      email: "moderator@mithiriver.com", 
      password: "mod123", 
      name: "Community Moderator",
      role: "admin" 
    }
  ];

  // Function to check if user is admin
  const checkAdminCredentials = (username, password) => {
    return adminAccounts.find(admin => 
      (admin.username === username || admin.email === username) && 
      admin.password === password
    );
  };

  useEffect(() => {
    // Generate animated ripples
    const createRipples = () => {
      const newRipples = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 200 + 100,
        delay: Math.random() * 4,
      }));
      setRipples(newRipples);
    };

    // Generate swimming fish
    const createFish = () => {
      const fish = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        direction: Math.random() > 0.5 ? 1 : -1,
        speed: Math.random() * 2 + 1,
        size: Math.random() * 20 + 15,
      }));
      setFishPositions(fish);
    };

    createRipples();
    createFish();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, check if it's a predefined admin account
      const adminAccount = checkAdminCredentials(username, password);
      if (adminAccount) {
        // Handle predefined admin login
        localStorage.setItem('token', 'admin-token-' + Date.now());
        localStorage.setItem('role', adminAccount.role);
        localStorage.setItem('user', JSON.stringify({
          id: adminAccount.username,
          username: adminAccount.username,
          email: adminAccount.email,
          name: adminAccount.name,
          role: adminAccount.role
        }));
        toast.success(`Welcome back, ${adminAccount.name}!`);
        navigate('/dashboard');
        return;
      }

      // If not admin, try regular user login via API
      const response = await fetch('/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', 'user'); // Regular user role
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success("Welcome back! Successfully logged in via API.");
        navigate('/dashboard');
        return;
      } else {
        toast.error(data.message || "Invalid credentials. Please try again.");
        return;
      }
    } catch (error) {
      // Fallback to local admin check when API is not available
      console.log("API not available, using local authentication fallback");
      
      const adminUser = checkAdminCredentials(username, password);
      
      if (adminUser) {
        // Create a mock token and store user info
        const mockToken = `offline_token_${adminUser.username}_${Date.now()}`;
        const userInfo = { ...adminUser };
        delete userInfo.password; // Remove password from stored info
        
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(userInfo));
        toast.success(`Welcome back, ${adminUser.name}! (Offline mode)`);
        navigate('/dashboard');
      } else {
        toast.error("Invalid credentials. Please check your username and password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Industry-Level Animated Underwater Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-cyan-700 to-teal-800">
        
        {/* Enhanced Volumetric Light Rays */}
        <div className="absolute inset-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-gradient-to-b from-cyan-200/30 via-cyan-300/15 to-transparent"
              style={{
                left: `${10 + i * 12}%`,
                width: '4px',
                height: '120%',
                top: '-10%',
                transform: `rotate(${(i - 4) * 6}deg)`,
                filter: 'blur(1px)',
                animation: `lightBeam ${5 + i * 0.8}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.6}s`,
              }}
            />
          ))}
        </div>

        {/* Floating Gradient Orbs */}
        <div className="absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full blur-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${80 + Math.random() * 150}px`,
                height: `${80 + Math.random() * 150}px`,
                background: `radial-gradient(circle, ${
                  i % 3 === 0 ? 'rgba(34, 211, 238, 0.15)' :
                  i % 3 === 1 ? 'rgba(59, 130, 246, 0.12)' :
                  'rgba(20, 184, 166, 0.18)'
                } 0%, transparent 70%)`,
                animation: `floatingOrb ${10 + Math.random() * 8}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 6}s`,
              }}
            />
          ))}
        </div>

        {/* Enhanced Bubble Animation System */}
        <div className="absolute inset-0">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full backdrop-blur-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${100 + Math.random() * 20}%`,
                width: `${4 + Math.random() * 12}px`,
                height: `${4 + Math.random() * 12}px`,
                background: i % 4 === 0 ? 
                  'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(34,211,238,0.4) 50%, transparent 100%)' :
                  'radial-gradient(circle, rgba(34,211,238,0.6) 0%, rgba(59,130,246,0.3) 60%, transparent 100%)',
                boxShadow: '0 0 10px rgba(34, 211, 238, 0.3)',
                animation: `bubbleRise ${12 + Math.random() * 8}s linear infinite`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Simple Fish Swimming */}
        {fishPositions.map((fish) => (
          <div
            key={fish.id}
            className="absolute text-cyan-200/30"
            style={{
              left: `${fish.x}%`,
              top: `${fish.y}%`,
              fontSize: `${fish.size}px`,
              animation: `swimAcross ${fish.speed * 10}s linear infinite`,
              transform: `scaleX(${fish.direction})`,
            }}
          >
            🐟
          </div>
        ))}

        {/* Water Ripples */}
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="absolute rounded-full border border-cyan-400/30"
            style={{
              left: `${ripple.x}%`,
              top: `${ripple.y}%`,
              width: `${ripple.size}px`,
              height: `${ripple.size}px`,
              animation: `ripple ${3 + ripple.delay}s ease-out infinite`,
              animationDelay: `${ripple.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Industry-Level Animated Login Card */}
      <Card className="w-full max-w-md mx-4 backdrop-blur-xl bg-white/95 shadow-2xl border-0 relative z-10 animate-slideUp hover:scale-105 transition-all duration-700">
        {/* Animated Border Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-teal-500/20 rounded-lg blur-xl animate-pulse"></div>
        
        <CardHeader className="text-center pb-8 relative z-10">
          {/* Premium Animated Logo */}
          <div className="mx-auto w-24 h-24 relative mb-6 group cursor-pointer">
            {/* Outer Rotating Ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-500 animate-spin-slow opacity-60"></div>
            
            {/* Inner Logo Container */}
            <div className="absolute inset-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500">
              <div className="text-4xl animate-float filter drop-shadow-lg">🌊</div>
              
              {/* Ripple Effect */}
              <div className="absolute inset-0 rounded-full border-2 border-cyan-300/50 animate-ripple"></div>
              <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ripple animation-delay-1000"></div>
            </div>
          </div>
          
          <div className="space-y-4">
            <CardTitle className="text-3xl font-bold text-gray-900 animate-slideInFromTop">
              <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                मिठी नदी
              </span>
            </CardTitle>
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
              Mithi River Guardian
            </CardTitle>
            <CardDescription className="text-gray-600 animate-fadeIn">
              Mumbai's Urban Lifeline Monitoring System
            </CardDescription>
          </div>

          {/* Animated Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl hover:scale-105 transition-all duration-300 animate-slideInFromLeft group cursor-pointer">
              <div className="text-lg font-bold text-cyan-600 group-hover:scale-110 transition-transform duration-200">17.84km</div>
              <div className="text-xs text-cyan-700">River Length</div>
              <div className="absolute inset-0 bg-cyan-200/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:scale-105 transition-all duration-300 animate-slideInFromBottom group cursor-pointer relative">
              <div className="text-lg font-bold text-blue-600 animate-pulse group-hover:scale-110 transition-transform duration-200">●</div>
              <div className="text-xs text-blue-700">Live Status</div>
              <div className="absolute inset-0 bg-blue-200/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl hover:scale-105 transition-all duration-300 animate-slideInFromRight group cursor-pointer relative">
              <div className="text-lg font-bold text-teal-600 group-hover:scale-110 transition-transform duration-200">24/7</div>
              <div className="text-xs text-teal-700">Monitoring</div>
              <div className="absolute inset-0 bg-teal-200/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Simple Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-6">
              <div className="relative group animate-slideInFromLeft animation-delay-300">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700 mb-2 block transition-colors duration-200 group-focus-within:text-cyan-600">
                  Username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 hover:border-cyan-300 focus:scale-105 bg-white/80 backdrop-blur-sm"
                    placeholder="Enter your username"
                    required
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="relative group animate-slideInFromRight animation-delay-500">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block transition-colors duration-200 group-focus-within:text-blue-600">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300 focus:scale-105 bg-white/80 backdrop-blur-sm"
                    placeholder="Enter your password"
                    required
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-300"></div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-600 to-teal-600 hover:from-cyan-600 hover:via-blue-700 hover:to-teal-700 text-white font-semibold py-4 rounded-xl transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-cyan-500/25 animate-slideInFromBottom animation-delay-700 group"
            >
              {/* Button Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-shimmerPass transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="animate-pulse">Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 group-hover:scale-105 transition-transform duration-200">
                    <span className="text-xl animate-float">🌊</span>
                    <span>Sign In to River Guardian</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                  </div>
                )}
              </div>
            </Button>

            <div className="flex flex-col space-y-4 text-center text-sm animate-fadeIn animation-delay-1000">
              <Link 
                to="/forgot-password" 
                className="text-cyan-600 hover:text-cyan-800 transition-all duration-300 hover:scale-105 relative group inline-block"
              >
                <span className="relative z-10">Forgot your password?</span>
                <div className="absolute inset-0 bg-cyan-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -m-1"></div>
              </Link>
              <div className="text-gray-500">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-cyan-600 hover:text-cyan-800 font-medium transition-all duration-300 hover:scale-105 relative group inline-block"
                >
                  <span className="relative z-10">Create account</span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 group-hover:w-full transition-all duration-300"></div>
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}

// Industry-Level CSS Animations
const styles = `
  @keyframes lightBeam {
    0%, 100% { opacity: 0.3; transform: translateY(0) scaleY(1); }
    50% { opacity: 0.7; transform: translateY(-20px) scaleY(1.1); }
  }
  
  @keyframes floatingOrb {
    0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.4; }
    25% { transform: translate(20px, -30px) scale(1.1) rotate(90deg); opacity: 0.6; }
    50% { transform: translate(-10px, -50px) scale(0.9) rotate(180deg); opacity: 0.8; }
    75% { transform: translate(-30px, -20px) scale(1.05) rotate(270deg); opacity: 0.5; }
  }
  
  @keyframes bubbleRise {
    0% { transform: translateY(20px) scale(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
  }
  
  @keyframes slideUp {
    0% { transform: translateY(50px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideInFromTop {
    0% { transform: translateY(-20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideInFromLeft {
    0% { transform: translateX(-30px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideInFromRight {
    0% { transform: translateX(30px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideInFromBottom {
    0% { transform: translateY(30px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(5deg); }
  }
  
  @keyframes ripple {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(2.5); opacity: 0; }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes shimmerPass {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(300%) skewX(-12deg); }
  }
  
  @keyframes spin-slow {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .animate-slideUp { animation: slideUp 0.8s ease-out; }
  .animate-slideInFromTop { animation: slideInFromTop 0.6s ease-out; }
  .animate-slideInFromLeft { animation: slideInFromLeft 0.7s ease-out; }
  .animate-slideInFromRight { animation: slideInFromRight 0.7s ease-out; }
  .animate-slideInFromBottom { animation: slideInFromBottom 0.8s ease-out; }
  .animate-fadeIn { animation: fadeIn 1s ease-out; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-ripple { animation: ripple 2s ease-out infinite; }
  .animate-shimmer { animation: shimmer 3s ease-in-out infinite; }
  .animate-shimmerPass { animation: shimmerPass 0.6s ease-out; }
  .animate-spin-slow { animation: spin-slow 8s linear infinite; }
  
  .animation-delay-300 { animation-delay: 300ms; }
  .animation-delay-500 { animation-delay: 500ms; }
  .animation-delay-700 { animation-delay: 700ms; }
  .animation-delay-1000 { animation-delay: 1000ms; }
  
  .bg-gradient-radial {
    background: radial-gradient(circle at center, var(--tw-gradient-stops));
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
