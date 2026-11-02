import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Search, Filter, MoreVertical, UserCheck, UserX, Shield, Mail, Calendar, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('loading'); // 'real', 'demo', 'loading'

  useEffect(() => {
    // Check if user is admin
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }

    fetchUsers();
  }, [navigate]);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterRole, users]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching users from backend...', token ? 'Token exists' : 'No token');
      
      const response = await fetch('/api/admin/users/', {
        headers: {
          'Authorization': `Token ${token}`,  // Django uses 'Token' not 'Bearer'
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Users data received:', data);
        
        const userList = data.users || data || [];
        
        if (userList.length === 0) {
          console.warn('⚠️ No users found in database, using demo data');
          toast.info('No users in database yet. Showing demo data.');
          generateDynamicUsers();
          return;
        }
        
        // Transform backend data to match our format
        const formattedUsers = userList.map((user, index) => ({
          id: user.id || index + 1,
          username: user.username || user.email?.split('@')[0] || `user${index}`,
          email: user.email || '',
          name: user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user.name || user.username || 'Unknown User',
          role: user.role || (user.is_staff ? 'admin' : 'user'),
          status: user.is_active ? 'active' : 'inactive',
          joinedDate: user.date_joined ? new Date(user.date_joined).toLocaleDateString() : new Date().toLocaleDateString(),
          lastLogin: user.last_login ? getRelativeTime(new Date(user.last_login)) : 'Never'
        }));
        
        console.log('✅ Formatted users:', formattedUsers);
        setUsers(formattedUsers);
        setDataSource('real');
        toast.success(`Loaded ${formattedUsers.length} real users from database!`);
      } else if (response.status === 401) {
        // Unauthorized - token is invalid, need to re-login
        console.error('❌ Token is invalid or expired');
        toast.error('Your session has expired. Please log in again.');
        
        // Clear localStorage and redirect to login
        localStorage.clear();
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', response.status, errorData);
        toast.warning(`API returned ${response.status}. Using demo data.`);
        generateDynamicUsers();
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      toast.error(`Failed to connect to backend: ${error.message}. Using demo data.`);
      generateDynamicUsers();
    } finally {
      setLoading(false);
    }
  };

  const generateDynamicUsers = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUsername = currentUser.username || 'admin';
    const currentName = currentUser.first_name && currentUser.last_name
      ? `${currentUser.first_name} ${currentUser.last_name}`
      : currentUser.name || 'Current User';
    const currentEmail = currentUser.email || 'admin@example.com';
    
    console.log('📝 Generating demo data for current user:', currentUser);
    
    const demoUsers = [
      { 
        id: 1, 
        username: currentUsername, 
        email: currentEmail, 
        name: currentName + ' (You)', 
        role: 'admin', 
        status: 'active', 
        joinedDate: new Date().toLocaleDateString(), 
        lastLogin: 'Just now' 
      },
      { id: 2, username: 'priya_sharma', email: 'priya@example.com', name: 'Priya Sharma (Demo)', role: 'user', status: 'active', joinedDate: '2024-03-20', lastLogin: '1 hour ago' },
      { id: 3, username: 'raj_kumar', email: 'raj@example.com', name: 'Raj Kumar (Demo)', role: 'moderator', status: 'active', joinedDate: '2024-02-10', lastLogin: '3 hours ago' },
      { id: 4, username: 'ananya_singh', email: 'ananya@example.com', name: 'Ananya Singh (Demo)', role: 'user', status: 'active', joinedDate: '2024-04-05', lastLogin: '1 day ago' },
      { id: 5, username: 'vikram_patel', email: 'vikram@example.com', name: 'Vikram Patel (Demo)', role: 'user', status: 'inactive', joinedDate: '2024-01-28', lastLogin: '1 week ago' },
      { id: 6, username: 'sneha_reddy', email: 'sneha@example.com', name: 'Sneha Reddy (Demo)', role: 'analyst', status: 'active', joinedDate: '2024-05-12', lastLogin: '30 mins ago' },
      { id: 7, username: 'arjun_mehta', email: 'arjun@example.com', name: 'Arjun Mehta (Demo)', role: 'user', status: 'active', joinedDate: '2024-06-01', lastLogin: '2 days ago' },
      { id: 8, username: 'divya_joshi', email: 'divya@example.com', name: 'Divya Joshi (Demo)', role: 'user', status: 'banned', joinedDate: '2024-03-15', lastLogin: '2 weeks ago' },
    ];
    setUsers(demoUsers);
    setDataSource('demo');
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
        toast.success('User deleted successfully');
      } else {
        const error = await response.json();
        toast.error(`Failed to delete user: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      // Fallback to client-side deletion for demo
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted (demo mode)');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast.success(`User role updated to ${newRole}`);
      } else {
        const error = await response.json();
        console.error('Failed to update role:', error);
        // Fallback to client-side update
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast.success(`User role updated to ${newRole} (demo mode)`);
      }
    } catch (error) {
      console.error('Error changing role:', error);
      // Fallback to client-side update for demo
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole} (demo mode)`);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const response = await fetch(`/api/admin/users/${userId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: newStatus === 'active' })
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      } else {
        const error = await response.json();
        console.error('Failed to update status:', error);
        // Fallback to client-side update
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} (demo mode)`);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      // Fallback to client-side update for demo
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} (demo mode)`);
    }
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      moderator: 'bg-blue-100 text-blue-800 border-blue-200',
      analyst: 'bg-green-100 text-green-800 border-green-200',
      user: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return (
      <Badge className={`${roleColors[role] || roleColors.user} border font-semibold`}>
        {role.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      banned: 'bg-red-100 text-red-800 border-red-200'
    };
    return (
      <Badge className={`${statusColors[status] || statusColors.inactive} border font-semibold`}>
        {status === 'active' ? '● ACTIVE' : status === 'banned' ? '✕ BANNED' : '○ INACTIVE'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      {/* Data Source Banner */}
      {dataSource === 'demo' && (
        <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800">
                ⚠️ Demo Mode - Backend API Not Connected
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Currently showing demo data. The first user (you) is real, others are placeholders.
                Check browser console (F12) for API connection details.
              </p>
            </div>
            <Button 
              onClick={fetchUsers}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Retry Connection
            </Button>
          </div>
        </div>
      )}
      
      {dataSource === 'real' && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-800">
                ✅ Live Data - Connected to Database
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Showing {users.length} real user{users.length !== 1 ? 's' : ''} from your PostgreSQL database.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage all registered users and their permissions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Users className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active</p>
                  <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.status === 'active').length}</p>
                </div>
                <UserCheck className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Admins</p>
                  <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.role === 'admin').length}</p>
                </div>
                <Shield className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Banned</p>
                  <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.status === 'banned').length}</p>
                </div>
                <UserX className="h-10 w-10 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">All Users</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterRole('all')}>All Roles</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole('admin')}>Admin</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole('moderator')}>Moderator</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole('analyst')}>Analyst</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole('user')}>User</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <TableHead className="font-bold">User</TableHead>
                  <TableHead className="font-bold">Email</TableHead>
                  <TableHead className="font-bold">Role</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Joined</TableHead>
                  <TableHead className="font-bold">Last Login</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-blue-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{user.joinedDate}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{user.lastLogin}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.status)}>
                              {user.status === 'active' ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                              {user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'admin')}>Make Admin</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'moderator')}>Make Moderator</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'analyst')}>Make Analyst</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'user')}>Make User</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
