import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Avatar, AvatarFallback, Alert, AlertDescription, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Switch } from '../ui';
import { 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  LogOut, 
  Users,
  Stethoscope,
  Bell,
  Phone,
  MapPin,
  Heart,
  Search,
  Star,
  Car,
  Building,
  Home,
  Settings,
  Moon,
  Sun,
  ArrowRight
} from 'lucide-react';

interface User {
  username: string;
  role: string;
  fullName?: string;
}

interface QueueStatus {
  isInQueue: boolean;
  token?: string;
  position?: number;
  estimatedWait?: number;
  status: 'not-checked-in' | 'waiting' | 'current' | 'completed';
  checkedInTime?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  availability: string;
  queueCount: number;
  avgWaitTime: number;
}

interface Clinic {
  id: string;
  name: string;
  address: string;
  distance: number;
  travelTime: number;
  rating: number;
  doctors: Doctor[];
  status: 'open' | 'busy' | 'closed';
  phone: string;
  contactNumber: string;
  operatingHours: string;
}

interface PatientDashboardProps {
  user: User | null;
  onLogout: () => void;
}

function ClinicCard({ 
  clinic, 
  isFavorite, 
  onToggleFavorite, 
  onViewDetails 
}: { 
  clinic: Clinic; 
  isFavorite: boolean; 
  onToggleFavorite: (clinicId: string) => void;
  onViewDetails: (clinic: Clinic) => void;
}) {
  const totalWaiting = clinic.doctors.reduce((sum, d) => sum + d.queueCount, 0);
  const avgWaitTime = clinic.doctors.length > 0 
    ? Math.round(clinic.doctors.reduce((sum, d) => sum + d.avgWaitTime, 0) / clinic.doctors.length)
    : 0;

  return (
    <Card className={`transition-all duration-200 hover:shadow-xl border-2 ${
      clinic.status === 'closed' ? 'opacity-60' : 'hover:border-teal-200 dark:hover:border-teal-800'
    }`}>
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4 flex-1">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1">{clinic.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center mt-2">
                    <MapPin className="w-4 h-4 mr-1.5" />
                    {clinic.address}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleFavorite(clinic.id)}
                  className="p-2 h-9 w-9 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      isFavorite 
                        ? 'text-red-500 fill-current' 
                        : 'text-gray-400 hover:text-red-500'
                    }`} 
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
            <Car className="w-5 h-5 text-muted-foreground mb-1.5" />
            <p className="text-xs text-muted-foreground mb-0.5">Distance</p>
            <p className="text-base font-bold">{clinic.distance.toFixed(1)} km</p>
          </div>
          <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
            <Clock className="w-5 h-5 text-muted-foreground mb-1.5" />
            <p className="text-xs text-muted-foreground mb-0.5">Travel</p>
            <p className="text-base font-bold">{clinic.travelTime} min</p>
          </div>
          <div className="flex flex-col items-center p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
            <Star className="w-5 h-5 text-yellow-500 fill-current mb-1.5" />
            <p className="text-xs text-muted-foreground mb-0.5">Rating</p>
            <p className="text-base font-bold">{clinic.rating.toFixed(1)}</p>
          </div>
          <div className="flex flex-col items-center p-3 bg-teal-50 dark:bg-teal-950/30 rounded-lg">
            <Users className="w-5 h-5 text-teal-600 dark:text-teal-400 mb-1.5" />
            <p className="text-xs text-muted-foreground mb-0.5">Queue</p>
            <p className="text-base font-bold">{totalWaiting}</p>
          </div>
        </div>

        {/* Doctors Preview Section */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            {clinic.doctors.length} Available Doctors
          </p>
          <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
            {clinic.doctors.slice(0, 3).map((doctor) => (
              <div key={doctor.id} className="flex-shrink-0 p-3 bg-background border border-border rounded-lg min-w-[160px] hover:border-teal-300 dark:hover:border-teal-700 transition-colors">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <p className="text-xs font-medium truncate">{doctor.name.replace('Dr. ', '')}</p>
                </div>
                <p className="text-xs text-muted-foreground truncate mb-1">{doctor.specialization}</p>
                <p className="text-xs text-muted-foreground">{doctor.queueCount} in queue</p>
              </div>
            ))}
            {clinic.doctors.length > 3 && (
              <div className="flex-shrink-0 p-3 bg-muted/30 border border-dashed border-border rounded-lg min-w-[100px] flex items-center justify-center">
                <p className="text-xs text-muted-foreground font-medium">+{clinic.doctors.length - 3} more</p>
              </div>
            )}
          </div>
        </div>

        {/* Wait Time Bar */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-lg mb-4 border border-teal-100 dark:border-teal-900">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-medium text-teal-900 dark:text-teal-100">Est. Wait Time:</span>
          </div>
          <span className="text-lg font-bold text-teal-700 dark:text-teal-300">{avgWaitTime} min</span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Badge 
            className={`text-xs px-3 py-1 ${
              clinic.status === 'open' 
                ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800' 
                : clinic.status === 'busy'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800'
                : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800'
            }`}
            variant="outline"
          >
            {clinic.status === 'open' ? '● Open Now' : clinic.status === 'busy' ? '● Busy' : '● Closed'}
          </Badge>
          <Button
            size="lg"
            disabled={clinic.status === 'closed'}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold h-11 shadow-md hover:shadow-lg transition-all"
            onClick={() => onViewDetails(clinic)}
          >
            View Doctors & Book
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'clinics' | 'queue' | 'settings'>('home');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({
    isInQueue: false,
    status: 'not-checked-in'
  });
  
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [showClinicDetails, setShowClinicDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteClinicIds, setFavoriteClinicIds] = useState<string[]>(['1', '2']);

  // Mock clinics with doctors
  const [nearbyClinics] = useState<Clinic[]>([
    {
      id: '1',
      name: 'HealthFirst Medical Center',
      address: '123 Main St, Downtown',
      distance: 1.2,
      travelTime: 15,
      rating: 4.8,
      status: 'open',
      phone: '+1-555-0100',
      contactNumber: '+1-555-0100',
      operatingHours: 'Mon-Fri: 8AM-6PM',
      doctors: [
        { id: 'd1', name: 'Dr. Sarah Johnson', specialization: 'General Practice', availability: '9AM-5PM', queueCount: 3, avgWaitTime: 15 },
        { id: 'd2', name: 'Dr. Michael Chen', specialization: 'Cardiology', availability: '10AM-4PM', queueCount: 2, avgWaitTime: 20 },
        { id: 'd3', name: 'Dr. Emily Davis', specialization: 'Dermatology', availability: '8AM-3PM', queueCount: 1, avgWaitTime: 10 }
      ]
    },
    {
      id: '2',
      name: 'CityCore Family Clinic',
      address: '456 Oak Avenue, Midtown',
      distance: 2.5,
      travelTime: 22,
      rating: 4.6,
      status: 'busy',
      phone: '+1-555-0101',
      contactNumber: '+1-555-0101',
      operatingHours: 'Mon-Sat: 9AM-7PM',
      doctors: [
        { id: 'd4', name: 'Dr. Robert Wilson', specialization: 'Pediatrics', availability: '9AM-6PM', queueCount: 5, avgWaitTime: 30 },
        { id: 'd5', name: 'Dr. Lisa Anderson', specialization: 'Family Medicine', availability: '10AM-5PM', queueCount: 4, avgWaitTime: 25 }
      ]
    },
    {
      id: '3',
      name: 'Riverside Medical Plaza',
      address: '789 River Rd, Riverside',
      distance: 3.8,
      travelTime: 28,
      rating: 4.9,
      status: 'open',
      phone: '+1-555-0102',
      contactNumber: '+1-555-0102',
      operatingHours: 'Mon-Fri: 7AM-8PM',
      doctors: [
        { id: 'd6', name: 'Dr. James Miller', specialization: 'Internal Medicine', availability: '8AM-6PM', queueCount: 2, avgWaitTime: 12 },
        { id: 'd7', name: 'Dr. Maria Rodriguez', specialization: 'Endocrinology', availability: '9AM-4PM', queueCount: 1, avgWaitTime: 15 },
        { id: 'd8', name: 'Dr. David Lee', specialization: 'Orthopedics', availability: '10AM-5PM', queueCount: 3, avgWaitTime: 20 }
      ]
    },
    {
      id: '4',
      name: 'Metro Health Services',
      address: '321 Metro Blvd, Metro District',
      distance: 5.1,
      travelTime: 35,
      rating: 4.4,
      status: 'open',
      phone: '+1-555-0103',
      contactNumber: '+1-555-0103',
      operatingHours: 'Daily: 8AM-9PM',
      doctors: [
        { id: 'd9', name: 'Dr. Amanda White', specialization: 'General Medicine', availability: '8AM-5PM', queueCount: 4, avgWaitTime: 22 },
        { id: 'd10', name: 'Dr. Thomas Garcia', specialization: 'Neurology', availability: '9AM-6PM', queueCount: 2, avgWaitTime: 18 }
      ]
    }
  ]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToggleFavorite = (clinicId: string) => {
    setFavoriteClinicIds(prev => 
      prev.includes(clinicId) 
        ? prev.filter(id => id !== clinicId)
        : [...prev, clinicId]
    );
  };

  const handleViewClinicDetails = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setShowClinicDetails(true);
  };

  const handleJoinQueue = (doctor: Doctor, clinic: Clinic) => {
    const token = `Q${Math.floor(Math.random() * 999) + 1}`;
    const position = doctor.queueCount + 1;
    const estimatedWait = position * 10;
    const checkedInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setQueueStatus({
      isInQueue: true,
      token,
      position,
      estimatedWait,
      status: 'waiting',
      checkedInTime
    });
    
    setShowClinicDetails(false);
    setActiveTab('queue');
  };

  const filteredClinics = nearbyClinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clinic.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clinic.doctors.some(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const favoriteClinics = filteredClinics.filter(c => favoriteClinicIds.includes(c.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-teal-600 rounded-lg">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">ClinicQ</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                  {user?.fullName?.charAt(0).toUpperCase() || user?.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user?.fullName || user?.username}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar - Fixed */}
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border overflow-y-auto">
          <nav className="p-4">
            <div className="space-y-2">
              <Button
                variant={activeTab === 'home' ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  activeTab === 'home' 
                    ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                    : ''
                }`}
                onClick={() => setActiveTab('home')}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                variant={activeTab === 'clinics' ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  activeTab === 'clinics' 
                    ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                    : ''
                }`}
                onClick={() => setActiveTab('clinics')}
              >
                <Building className="w-4 h-4 mr-2" />
                Find Clinics
              </Button>
              <Button
                variant={activeTab === 'queue' ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  activeTab === 'queue' 
                    ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                    : ''
                }`}
                onClick={() => setActiveTab('queue')}
              >
                <Users className="w-4 h-4 mr-2" />
                My Queue
              </Button>
              <Button
                variant={activeTab === 'settings' ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  activeTab === 'settings' 
                    ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                    : ''
                }`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content - Scrollable */}
        <main className="flex-1 ml-64 p-6 overflow-y-auto">
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">Hello, {user?.fullName || user?.username}!</h2>
                <p className="text-teal-100">Find nearby clinics and manage your healthcare appointments.</p>
              </div>

              {/* Nearby Clinics Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Nearby Clinics</h3>
                    <p className="text-sm text-muted-foreground">Find and book appointments at nearby clinics</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('clinics')}>
                    View All
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nearbyClinics.slice(0, 4).map((clinic) => (
                    <ClinicCard
                      key={clinic.id}
                      clinic={clinic}
                      isFavorite={favoriteClinicIds.includes(clinic.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onViewDetails={handleViewClinicDetails}
                    />
                  ))}
                </div>
              </div>

              {/* Queue Status */}
              {queueStatus.isInQueue && (
                <Card className="border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950">
                  <CardHeader>
                    <CardTitle className="text-teal-900 dark:text-teal-100">Your Queue Status</CardTitle>
                    <CardDescription className="text-teal-700 dark:text-teal-300">
                      You're currently in the queue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-teal-700 dark:text-teal-300">Token</p>
                        <p className="text-xl font-bold text-teal-900 dark:text-teal-100">{queueStatus.token}</p>
                      </div>
                      <div>
                        <p className="text-sm text-teal-700 dark:text-teal-300">Position</p>
                        <p className="text-xl font-bold text-teal-900 dark:text-teal-100">#{queueStatus.position}</p>
                      </div>
                      <div>
                        <p className="text-sm text-teal-700 dark:text-teal-300">Est. Wait</p>
                        <p className="text-xl font-bold text-teal-900 dark:text-teal-100">{queueStatus.estimatedWait}m</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'clinics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Find Clinics</h2>
                <p className="text-sm text-muted-foreground">Discover nearby clinics and book appointments</p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search clinics, doctors, or specialties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Favorites */}
              {favoriteClinics.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Heart className="w-5 h-5 text-red-500 fill-current mr-2" />
                    Favorite Clinics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favoriteClinics.map((clinic) => (
                      <ClinicCard
                        key={clinic.id}
                        clinic={clinic}
                        isFavorite={true}
                        onToggleFavorite={handleToggleFavorite}
                        onViewDetails={handleViewClinicDetails}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Clinics */}
              <div>
                <h3 className="text-lg font-semibold mb-3">All Clinics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredClinics.map((clinic) => (
                    <ClinicCard
                      key={clinic.id}
                      clinic={clinic}
                      isFavorite={favoriteClinicIds.includes(clinic.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onViewDetails={handleViewClinicDetails}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">My Queue</h2>
                <p className="text-sm text-muted-foreground">Track your position in the queue</p>
              </div>

              {queueStatus.isInQueue ? (
                <Card className="border-teal-200 dark:border-teal-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Queue Status</CardTitle>
                        <CardDescription>Checked in at {queueStatus.checkedInTime}</CardDescription>
                      </div>
                      <Badge className="bg-teal-600 text-white">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6 mb-6">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Token Number</p>
                        <p className="text-3xl font-bold">{queueStatus.token}</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Position</p>
                        <p className="text-3xl font-bold">#{queueStatus.position}</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Est. Wait</p>
                        <p className="text-3xl font-bold">{queueStatus.estimatedWait}m</p>
                      </div>
                    </div>
                    <Alert className="border-teal-200 bg-teal-50 dark:bg-teal-950 dark:border-teal-800">
                      <AlertDescription className="text-teal-800 dark:text-teal-200">
                        Please stay nearby. You'll be notified when it's your turn.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Not in Queue</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You're not currently in any queue. Find a clinic to join.
                    </p>
                    <Button onClick={() => setActiveTab('clinics')} className="bg-teal-600 hover:bg-teal-700">
                      Find Clinics
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Settings</h2>
                <p className="text-sm text-muted-foreground">Customize your experience</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how the app looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      <div>
                        <Label className="text-sm font-medium">Dark Mode</Label>
                        <p className="text-xs text-muted-foreground">Toggle dark mode theme</p>
                      </div>
                    </div>
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={setIsDarkMode}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm text-muted-foreground mt-1">{user?.fullName || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Username</Label>
                    <p className="text-sm text-muted-foreground mt-1">{user?.username}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Clinic Details Dialog */}
      <Dialog open={showClinicDetails} onOpenChange={setShowClinicDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-5">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building className="w-10 h-10 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-3xl mb-2">{selectedClinic?.name}</DialogTitle>
                  <DialogDescription className="flex items-center text-base">
                    <MapPin className="w-5 h-5 mr-2" />
                    {selectedClinic?.address}
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-8 py-2">
            {/* Clinic Info - More prominent */}
            <div className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-br from-muted/50 to-muted rounded-xl border-2 border-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-semibold">{selectedClinic?.contactNumber}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Hours</p>
                  <p className="text-sm font-semibold">{selectedClinic?.operatingHours}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Rating</p>
                  <p className="text-sm font-semibold">{selectedClinic?.rating.toFixed(1)} / 5.0</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Distance</p>
                  <p className="text-sm font-semibold">{selectedClinic?.distance.toFixed(1)} km • {selectedClinic?.travelTime} min</p>
                </div>
              </div>
            </div>

            {/* Doctors List - More subtle */}
            <div>
              <div className="mb-4 pb-3 border-b border-border">
                <h3 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide">
                  Available Doctors ({selectedClinic?.doctors.length})
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Select a doctor to join their queue</p>
              </div>
              <div className="space-y-2">
                {selectedClinic?.doctors.map((doctor) => (
                  <div 
                    key={doctor.id} 
                    className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/60 border border-transparent hover:border-border rounded-lg transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-teal-100/50 dark:bg-teal-900/30 rounded-full flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
                        <Stethoscope className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{doctor.name}</h4>
                        <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {doctor.availability}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-y-0 space-x-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">In Queue</p>
                        <p className="text-sm font-semibold">{doctor.queueCount} patients</p>
                        <p className="text-xs text-muted-foreground">~{doctor.avgWaitTime} min</p>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={() => handleJoinQueue(doctor, selectedClinic!)}
                      >
                        Join Queue
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}