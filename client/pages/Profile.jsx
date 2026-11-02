
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Shield, Calendar, MapPin, Phone } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch user data from API or localStorage
    const fetchUserData = async () => {
      try {
        // Try to get from localStorage first
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } else {
          // Fallback to API call
          const token = localStorage.getItem('token');
          if (!token) {
            navigate('/login');
            return;
          }
          
          const response = await fetch('/api/user/profile/', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
          } else {
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set default user data for demo
        setUser({
          username: localStorage.getItem('username') || 'user',
          email: localStorage.getItem('email') || 'user@example.com',
          first_name: 'Water Quality',
          last_name: 'User',
          role: localStorage.getItem('role') || 'user',
          created_at: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = user.first_name && user.last_name 
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : user.username?.slice(0, 2).toUpperCase() || 'US';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <Card className="mb-6 backdrop-blur-sm bg-white/95 shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-4">
              <Avatar className="h-24 w-24 mx-auto ring-4 ring-blue-100">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-3xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-2">
              @{user.username}
            </CardDescription>
            <div className="mt-4">
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                <Shield className="mr-2 h-4 w-4" />
                {user.role === 'admin' ? 'Administrator' : 'User'}
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card className="backdrop-blur-sm bg-white/95 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <span className="block text-xs text-gray-500 mb-1">Username</span>
                  <span className="block text-base text-gray-900 font-medium">{user.username}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <span className="block text-xs text-gray-500 mb-1">Email Address</span>
                  <span className="block text-base text-gray-900 font-medium">{user.email}</span>
                </div>
              </div>
              
              {user.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="block text-xs text-gray-500 mb-1">Phone Number</span>
                    <span className="block text-base text-gray-900 font-medium">{user.phone}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card className="backdrop-blur-sm bg-white/95 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <span className="block text-xs text-gray-500 mb-1">Full Name</span>
                  <span className="block text-base text-gray-900 font-medium">
                    {user.first_name} {user.last_name}
                  </span>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <span className="block text-xs text-gray-500 mb-1">Account Type</span>
                  <span className="block text-base text-gray-900 font-medium capitalize">{user.role}</span>
                </div>
              </div>
              
              {user.created_at && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="block text-xs text-gray-500 mb-1">Member Since</span>
                    <span className="block text-base text-gray-900 font-medium">
                      {new Date(user.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              )}
              
              {user.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="block text-xs text-gray-500 mb-1">Location</span>
                    <span className="block text-base text-gray-900 font-medium">{user.location}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="px-6"
          >
            Back to Dashboard
          </Button>
          <Button 
            className="px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            onClick={() => {
              // TODO: Implement edit profile functionality
              alert('Edit profile feature coming soon!');
            }}
          >
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
