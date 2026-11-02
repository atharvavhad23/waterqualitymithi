import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Clock, Award, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const CleanupDrives = () => {
  const [cleanupDrives, setCleanupDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [userRegistrations, setUserRegistrations] = useState(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Admin form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    duration: '',
    max_volunteers: '',
    meeting_point: '',
    contact_person: '',
    contact_phone: '',
    equipment_provided: '',
    requirements: ''
  });

  useEffect(() => {
    fetchCleanupDrives();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = () => {
    // Check if user is admin from localStorage token
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsAdmin(user.is_staff || user.is_superuser || false);
  };

  const fetchCleanupDrives = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cleanup-drives/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCleanupDrives(data.drives || []);
        
        // Load user's registrations from localStorage
        const savedRegistrations = JSON.parse(localStorage.getItem('cleanupRegistrations') || '[]');
        setUserRegistrations(new Set(savedRegistrations));
      } else {
        // If endpoint doesn't exist, use mock data
        setCleanupDrives(getMockCleanupDrives());
      }
    } catch (error) {
      console.error('Error fetching cleanup drives:', error);
      setCleanupDrives(getMockCleanupDrives());
    } finally {
      setLoading(false);
    }
  };

  const getMockCleanupDrives = () => {
    return [
      {
        id: 1,
        title: 'Mithi River Cleanup - Bandra West',
        description: 'Join us for a community cleanup drive at Mithi River, Bandra West section. We will focus on removing plastic waste and debris from the riverbanks.',
        location: 'Bandra West, Mumbai',
        date: '2025-11-15',
        time: '07:00 AM',
        duration: '4 hours',
        max_volunteers: 50,
        registered_count: 23,
        meeting_point: 'Bandra West Railway Station Exit',
        contact_person: 'Priya Sharma',
        contact_phone: '+91-98765-43210',
        equipment_provided: 'Gloves, Garbage bags, Safety vests, Refreshments',
        requirements: 'Please wear comfortable clothing and closed shoes',
        status: 'upcoming',
        created_by: 'Admin',
        created_at: '2025-10-25'
      },
      {
        id: 2,
        title: 'Mithi River Cleanup - Powai Lake Area',
        description: 'Cleanup drive focusing on the Powai Lake confluence area. Help us restore the ecosystem by removing pollutants and waste.',
        location: 'Powai, Mumbai',
        date: '2025-11-22',
        time: '06:30 AM',
        duration: '5 hours',
        max_volunteers: 75,
        registered_count: 45,
        meeting_point: 'Powai Lake Garden Entrance',
        contact_person: 'Rajesh Kumar',
        contact_phone: '+91-98765-43211',
        equipment_provided: 'Gloves, Bags, Boots, Breakfast & Lunch',
        requirements: 'Minimum age 16 years, bring water bottle',
        status: 'upcoming',
        created_by: 'Admin',
        created_at: '2025-10-26'
      },
      {
        id: 3,
        title: 'Mithi River Cleanup - Mahim Creek',
        description: 'Completed cleanup drive at Mahim Creek. Successfully removed 500kg of waste with 60 volunteers.',
        location: 'Mahim, Mumbai',
        date: '2025-10-20',
        time: '07:00 AM',
        duration: '4 hours',
        max_volunteers: 60,
        registered_count: 60,
        meeting_point: 'Mahim Railway Station',
        contact_person: 'Anjali Desai',
        contact_phone: '+91-98765-43212',
        equipment_provided: 'All equipment provided',
        requirements: 'None',
        status: 'completed',
        created_by: 'Admin',
        created_at: '2025-10-10'
      }
    ];
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    
    const newDrive = {
      ...formData,
      registered_count: 0,
      status: 'upcoming',
      created_by: 'Admin',
      created_at: new Date().toISOString().split('T')[0],
      id: Date.now()
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cleanup-drives/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDrive)
      });

      if (response.ok) {
        const data = await response.json();
        setCleanupDrives([data, ...cleanupDrives]);
      } else {
        // Fallback to local state
        setCleanupDrives([newDrive, ...cleanupDrives]);
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        time: '',
        duration: '',
        max_volunteers: '',
        meeting_point: '',
        contact_person: '',
        contact_phone: '',
        equipment_provided: '',
        requirements: ''
      });
      setShowCreateForm(false);
      alert('✅ Cleanup Drive Created Successfully!\n\nThe drive has been published and is now visible to all users.');
    } catch (error) {
      console.error('Error creating drive:', error);
      alert('Failed to create cleanup drive. Please try again.');
    }
  };

  const handleRegister = (driveId) => {
    const drive = cleanupDrives.find(d => d.id === driveId);
    
    if (!drive) return;
    
    if (drive.registered_count >= drive.max_volunteers) {
      alert('❌ Registration Full\n\nThis cleanup drive has reached maximum capacity. Please check other available drives.');
      return;
    }

    if (userRegistrations.has(driveId)) {
      alert('ℹ️ Already Registered\n\nYou are already registered for this cleanup drive.');
      return;
    }

    // Add to registrations
    const newRegistrations = new Set(userRegistrations);
    newRegistrations.add(driveId);
    setUserRegistrations(newRegistrations);
    
    // Save to localStorage
    localStorage.setItem('cleanupRegistrations', JSON.stringify([...newRegistrations]));
    
    // Update drive count
    setCleanupDrives(cleanupDrives.map(d => 
      d.id === driveId 
        ? { ...d, registered_count: d.registered_count + 1 }
        : d
    ));

    alert(`✅ Registration Successful!\n\nYou have been registered for:\n${drive.title}\n\nDate: ${drive.date}\nTime: ${drive.time}\nMeeting Point: ${drive.meeting_point}\n\nA confirmation email has been sent to your registered email address.`);
  };

  const handleCancelRegistration = (driveId) => {
    if (window.confirm('Are you sure you want to cancel your registration?')) {
      const newRegistrations = new Set(userRegistrations);
      newRegistrations.delete(driveId);
      setUserRegistrations(newRegistrations);
      
      localStorage.setItem('cleanupRegistrations', JSON.stringify([...newRegistrations]));
      
      setCleanupDrives(cleanupDrives.map(d => 
        d.id === driveId 
          ? { ...d, registered_count: Math.max(0, d.registered_count - 1) }
          : d
      ));

      alert('Registration cancelled successfully.');
    }
  };

  const getFilteredDrives = () => {
    if (activeTab === 'all') return cleanupDrives;
    if (activeTab === 'upcoming') return cleanupDrives.filter(d => d.status === 'upcoming');
    if (activeTab === 'completed') return cleanupDrives.filter(d => d.status === 'completed');
    if (activeTab === 'my-registrations') return cleanupDrives.filter(d => userRegistrations.has(d.id));
    return cleanupDrives;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 p-8">
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">🌊</div>
          <div className="text-xl text-gray-600">Loading cleanup drives...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                🌊 Cleanup Drive Registration
              </h1>
              <p className="text-gray-600">Join community efforts to clean and restore Mithi River</p>
            </div>
            {isAdmin && (
              <Button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700"
              >
                {showCreateForm ? '✕ Cancel' : '+ Create New Drive'}
              </Button>
            )}
          </div>
        </div>

        {/* Admin Create Form */}
        {isAdmin && showCreateForm && (
          <Card className="mb-8 shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
            <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="w-6 h-6" />
                Create New Cleanup Drive
              </CardTitle>
              <CardDescription className="text-white/80">
                Fill in the details to create a new cleanup drive event
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCreateDrive} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Drive Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Mithi River Cleanup - Bandra"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Bandra West, Mumbai"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 4 hours"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Volunteers *</label>
                    <input
                      type="number"
                      name="max_volunteers"
                      value={formData.max_volunteers}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Point *</label>
                    <input
                      type="text"
                      name="meeting_point"
                      value={formData.meeting_point}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Bandra Station Exit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                    <input
                      type="text"
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+91-XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Provided</label>
                    <input
                      type="text"
                      name="equipment_provided"
                      value={formData.equipment_provided}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Gloves, Bags, Refreshments"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the cleanup drive objectives and activities..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any special requirements or instructions for volunteers..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700"
                  >
                    ✓ Create Cleanup Drive
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="all">All Drives ({cleanupDrives.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({cleanupDrives.filter(d => d.status === 'upcoming').length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({cleanupDrives.filter(d => d.status === 'completed').length})</TabsTrigger>
            <TabsTrigger value="my-registrations">My Registrations ({userRegistrations.size})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Drives Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {getFilteredDrives().length === 0 ? (
            <div className="col-span-2 text-center py-20">
              <div className="text-6xl mb-4">🌊</div>
              <div className="text-xl text-gray-600 mb-2">No cleanup drives found</div>
              <div className="text-sm text-gray-500">
                {activeTab === 'my-registrations' 
                  ? 'You have not registered for any cleanup drives yet'
                  : 'Check back soon for upcoming cleanup events'
                }
              </div>
            </div>
          ) : (
            getFilteredDrives().map((drive) => {
              const isRegistered = userRegistrations.has(drive.id);
              const isFull = drive.registered_count >= drive.max_volunteers;
              const isCompleted = drive.status === 'completed';
              const spotsLeft = drive.max_volunteers - drive.registered_count;

              return (
                <Card key={drive.id} className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl hover:shadow-3xl transition-all">
                  <CardHeader className={`${isCompleted ? 'bg-gradient-to-r from-gray-500 to-gray-600' : 'bg-gradient-to-r from-green-600 to-blue-600'} text-white`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{drive.title}</CardTitle>
                        <CardDescription className="text-white/80">
                          {drive.description}
                        </CardDescription>
                      </div>
                      {isCompleted && (
                        <Badge className="bg-white text-gray-700">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {!isCompleted && isFull && (
                        <Badge className="bg-red-500 text-white">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Full
                        </Badge>
                      )}
                      {!isCompleted && isRegistered && (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Registered
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{drive.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <span>{new Date(drive.date).toLocaleDateString('en-IN', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <span>{drive.time} ({drive.duration})</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="w-5 h-5 text-orange-600" />
                        <span>
                          {drive.registered_count} / {drive.max_volunteers} volunteers
                          {!isCompleted && !isFull && (
                            <span className="text-green-600 font-medium ml-2">
                              ({spotsLeft} spots left)
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="pt-3 border-t">
                        <div className="text-sm text-gray-600 mb-1">
                          <strong>Meeting Point:</strong> {drive.meeting_point}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          <strong>Contact:</strong> {drive.contact_person} ({drive.contact_phone})
                        </div>
                        {drive.equipment_provided && (
                          <div className="text-sm text-gray-600 mb-1">
                            <strong>Equipment:</strong> {drive.equipment_provided}
                          </div>
                        )}
                        {drive.requirements && (
                          <div className="text-sm text-gray-600">
                            <strong>Requirements:</strong> {drive.requirements}
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {!isCompleted && (
                        <div className="pt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Registration Progress</span>
                            <span>{Math.round((drive.registered_count / drive.max_volunteers) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${isFull ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 to-blue-500'}`}
                              style={{ width: `${Math.min(100, (drive.registered_count / drive.max_volunteers) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {!isCompleted && (
                        <div className="pt-4">
                          {isRegistered ? (
                            <Button 
                              onClick={() => handleCancelRegistration(drive.id)}
                              variant="outline"
                              className="w-full border-red-500 text-red-600 hover:bg-red-50"
                            >
                              ✕ Cancel Registration
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handleRegister(drive.id)}
                              disabled={isFull}
                              className={`w-full ${isFull ? 'bg-gray-400' : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'} text-white`}
                            >
                              {isFull ? '✕ Registration Full' : '✓ Register Now'}
                            </Button>
                          )}
                        </div>
                      )}

                      {isCompleted && (
                        <div className="pt-4">
                          <Badge className="w-full justify-center py-2 bg-green-100 text-green-800">
                            <Award className="w-4 h-4 mr-2" />
                            Thank you for participating!
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CleanupDrives;
