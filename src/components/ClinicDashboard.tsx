import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Avatar, AvatarFallback, Switch, Label, Input, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner@2.0.3';
import { 
  Users, 
  Calendar, 
  Clock, 
  ArrowRight, 
  LogOut, 
  Plus,
  Stethoscope,
  Bell,
  Settings,
  Home,
  Moon,
  Sun,
  Activity,
  TrendingUp,
  CheckCircle2,
  GripVertical,
  UserPlus,
  Edit,
  Trash2,
  Menu,
  X
} from 'lucide-react';

interface User {
  username: string;
  role: string;
  clinicName?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  availability: string;
  activeQueueCount: number;
}

interface Patient {
  id: string;
  name: string;
  token: string;
  estimatedWait: number;
  status: 'waiting' | 'current' | 'completed';
  checkedIn: string;
  phone: string;
  doctorId: string;
}

interface DashboardProps {
  user: User | null;
  onLogout: () => void;
}

// Sortable patient item component
function SortablePatientItem({ patient, index }: { patient: Patient; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: patient.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 bg-background hover:bg-muted/50 border-b border-border last:border-b-0 cursor-move ${
        isDragging ? 'z-50 shadow-lg' : ''
      }`}
    >
      <div className="flex items-center space-x-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
          {index + 1}
        </div>
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-muted">
            {patient.name.split(' ').map(n => n.charAt(0)).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium">{patient.name}</h4>
          <p className="text-sm text-muted-foreground">Token: {patient.token} • {patient.checkedIn}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Badge variant="outline" className="text-orange-700 border-orange-200 dark:text-orange-400 dark:border-orange-800">
          ~{patient.estimatedWait}m wait
        </Badge>
        <Badge variant="secondary">Waiting</Badge>
      </div>
    </div>
  );
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'doctors' | 'patients' | 'settings'>('home');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  
  // Doctors state
  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: '1', name: 'Dr. Sarah Johnson', specialization: 'General Practice', availability: '9:00 AM - 5:00 PM', activeQueueCount: 4 },
    { id: '2', name: 'Dr. Michael Chen', specialization: 'Cardiology', availability: '10:00 AM - 6:00 PM', activeQueueCount: 2 },
    { id: '3', name: 'Dr. Emily Davis', specialization: 'Pediatrics', availability: '8:00 AM - 4:00 PM', activeQueueCount: 5 }
  ]);
  
  // Patients state (linked to doctors)
  const [patients, setPatients] = useState<Patient[]>([
    { id: '1', name: 'Sarah Johnson', token: 'A001', estimatedWait: 5, status: 'current', checkedIn: '09:30 AM', phone: '+1-555-0123', doctorId: '1' },
    { id: '2', name: 'Mike Chen', token: 'A002', estimatedWait: 15, status: 'waiting', checkedIn: '09:45 AM', phone: '+1-555-0124', doctorId: '1' },
    { id: '3', name: 'Emily Davis', token: 'A003', estimatedWait: 25, status: 'waiting', checkedIn: '10:00 AM', phone: '+1-555-0125', doctorId: '1' },
    { id: '4', name: 'Robert Wilson', token: 'A004', estimatedWait: 35, status: 'waiting', checkedIn: '10:15 AM', phone: '+1-555-0126', doctorId: '1' },
    { id: '5', name: 'Alice Brown', token: 'B001', estimatedWait: 0, status: 'current', checkedIn: '10:30 AM', phone: '+1-555-0127', doctorId: '2' },
    { id: '6', name: 'Tom Wilson', token: 'B002', estimatedWait: 10, status: 'waiting', checkedIn: '10:45 AM', phone: '+1-555-0128', doctorId: '2' },
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAddDoctorDialog, setShowAddDoctorDialog] = useState(false);
  const [showWalkInDialog, setShowWalkInDialog] = useState(false);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [availabilityDoctorId, setAvailabilityDoctorId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Form states
  const [newDoctor, setNewDoctor] = useState({ name: '', specialization: '', availability: '' });
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInDoctorId, setWalkInDoctorId] = useState('');

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Update doctor queue counts
  useEffect(() => {
    setDoctors(prev => prev.map(doctor => ({
      ...doctor,
      activeQueueCount: patients.filter(p => p.doctorId === doctor.id && p.status !== 'completed').length
    })));
  }, [patients]);

  const handleAddDoctor = () => {
    if (!newDoctor.name.trim() || !newDoctor.specialization.trim() || !newDoctor.availability.trim()) {
      toast.error('Please fill in all doctor details');
      return;
    }

    const newDoctorObj: Doctor = {
      id: Date.now().toString(),
      name: newDoctor.name,
      specialization: newDoctor.specialization,
      availability: newDoctor.availability,
      activeQueueCount: 0
    };

    setDoctors(prev => [...prev, newDoctorObj]);
    toast.success(`${newDoctor.name} added successfully`);
    setNewDoctor({ name: '', specialization: '', availability: '' });
    setShowAddDoctorDialog(false);
  };

  const handleRemoveDoctor = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor && doctor.activeQueueCount > 0) {
      toast.error('Cannot remove doctor with active patients');
      return;
    }
    setDoctors(prev => prev.filter(d => d.id !== doctorId));
    toast.success('Doctor removed successfully');
  };

  const handleAddWalkIn = () => {
    if (!walkInName.trim() || !walkInDoctorId) {
      toast.error('Please enter patient name and select a doctor');
      return;
    }

    const newToken = `W${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;
    const checkedInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newPatient: Patient = {
      id: Date.now().toString(),
      name: walkInName,
      token: newToken,
      estimatedWait: 0,
      status: 'current',
      checkedIn: checkedInTime,
      phone: walkInPhone || 'N/A',
      doctorId: walkInDoctorId
    };

    setPatients(prev => {
      const newPatients = [...prev];
      const currentIndex = newPatients.findIndex(p => p.status === 'current' && p.doctorId === walkInDoctorId);
      
      if (currentIndex !== -1) {
        newPatients[currentIndex].status = 'waiting';
        newPatients[currentIndex].estimatedWait = 10;
      }
      
      newPatients.forEach(patient => {
        if (patient.status === 'waiting' && patient.doctorId === walkInDoctorId) {
          patient.estimatedWait += 10;
        }
      });
      
      newPatients.unshift(newPatient);
      return newPatients;
    });

    toast.success('Walk-in patient added', {
      description: `${walkInName} is now being served.`
    });

    setWalkInName('');
    setWalkInPhone('');
    setWalkInDoctorId('');
    setShowWalkInDialog(false);
  };

  const handleNextPatient = (doctorId: string) => {
    setPatients(prev => {
      const newPatients = [...prev];
      const currentIndex = newPatients.findIndex(p => p.status === 'current' && p.doctorId === doctorId);
      
      if (currentIndex !== -1) {
        newPatients[currentIndex].status = 'completed';
      }
      
      const nextWaitingIndex = newPatients.findIndex(p => p.status === 'waiting' && p.doctorId === doctorId);
      if (nextWaitingIndex !== -1) {
        newPatients[nextWaitingIndex].status = 'current';
        newPatients[nextWaitingIndex].estimatedWait = 0;
      }
      
      newPatients.forEach((patient) => {
        if (patient.status === 'waiting' && patient.doctorId === doctorId) {
          patient.estimatedWait = Math.max(0, patient.estimatedWait - 10);
        }
      });
      
      return newPatients;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const draggedPatient = patients.find(p => p.id === active.id);
    const targetPatient = patients.find(p => p.id === over.id);

    if (!draggedPatient || !targetPatient) return;

    setPatients(prev => {
      const oldIndex = prev.findIndex(p => p.id === active.id);
      const newIndex = prev.findIndex(p => p.id === over.id);
      
      const newPatients = arrayMove(prev, oldIndex, newIndex);
      
      let waitTime = 0;
      newPatients.forEach(patient => {
        if (patient.status === 'waiting') {
          patient.estimatedWait = waitTime;
          waitTime += 10;
        }
      });

      toast.success('Queue reordered', {
        description: `${draggedPatient.name} has been moved.`,
        duration: 4000
      });
      
      return newPatients;
    });
  };

  const getDoctorPatients = (doctorId: string) => patients.filter(p => p.doctorId === doctorId);
  const waitingPatients = patients.filter(p => p.status === 'waiting');
  const currentPatients = patients.filter(p => p.status === 'current');
  const completedToday = patients.filter(p => p.status === 'completed').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-card border-b border-border px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-teal-600 rounded-lg">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Clinic Dashboard</h1>
                <p className="text-xs text-muted-foreground">{user?.clinicName || 'ClinicQ'}</p>
              </div>
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
                  {user?.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user?.username}</span>
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

      <div className="flex pt-16 h-[calc(100vh)]">
        {/* Sidebar Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`fixed md:sticky top-16 left-0 bottom-0 w-64 h-[calc(100vh-4rem)] bg-card border-r border-border overflow-y-auto transition-transform duration-300 z-30 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
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
                variant={activeTab === 'doctors' ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  activeTab === 'doctors' 
                    ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                    : ''
                }`}
                onClick={() => setActiveTab('doctors')}
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                Manage Doctors
              </Button>
              <Button
                variant={activeTab === 'patients' ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  activeTab === 'patients' 
                    ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                    : ''
                }`}
                onClick={() => setActiveTab('patients')}
              >
                <Users className="w-4 h-4 mr-2" />
                Patient Queues
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
        <main className="flex-1 w-full md:w-[calc(100%-16rem)] p-4 md:p-6 overflow-y-auto">
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.username}!</h2>
                <p className="text-teal-100">Manage your clinic's doctors and patient queues efficiently.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Doctors</p>
                        <p className="text-2xl font-bold mt-1">{doctors.length}</p>
                      </div>
                      <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-lg">
                        <Stethoscope className="w-6 h-6 text-teal-600 dark:text-teal-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Waiting</p>
                        <p className="text-2xl font-bold mt-1">{waitingPatients.length}</p>
                      </div>
                      <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <Clock className="w-6 h-6 text-orange-600 dark:text-orange-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Current</p>
                        <p className="text-2xl font-bold mt-1">{currentPatients.length}</p>
                      </div>
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold mt-1">{completedToday}</p>
                      </div>
                      <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your clinic efficiently</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      className="h-24 flex flex-col items-start justify-center bg-teal-50 dark:bg-teal-950 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 border-2 border-teal-200 dark:border-teal-800"
                      variant="outline"
                      onClick={() => setShowAddDoctorDialog(true)}
                    >
                      <UserPlus className="w-6 h-6 mb-2" />
                      <span className="font-semibold">Add Doctor</span>
                      <span className="text-xs text-muted-foreground">Register new doctor</span>
                    </Button>

                    <Button
                      className="h-24 flex flex-col items-start justify-center bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-800"
                      variant="outline"
                      onClick={() => setActiveTab('doctors')}
                    >
                      <Stethoscope className="w-6 h-6 mb-2" />
                      <span className="font-semibold">Manage Doctors</span>
                      <span className="text-xs text-muted-foreground">{doctors.length} active doctors</span>
                    </Button>

                    <Button
                      className="h-24 flex flex-col items-start justify-center bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900 text-green-700 dark:text-green-300 border-2 border-green-200 dark:border-green-800"
                      variant="outline"
                      onClick={() => setShowWalkInDialog(true)}
                    >
                      <Plus className="w-6 h-6 mb-2" />
                      <span className="font-semibold">Add Walk-in</span>
                      <span className="text-xs text-muted-foreground">Register new patient</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Doctors Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Doctors Overview</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('doctors')}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {doctors.map((doctor) => {
                      const doctorCurrentPatient = patients.find(p => p.doctorId === doctor.id && p.status === 'current');
                      return (
                        <div key={doctor.id} className="flex items-center justify-between p-5 border-2 border-border rounded-xl hover:border-teal-200 dark:hover:border-teal-800 hover:shadow-md transition-all bg-muted/30">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800 rounded-xl flex items-center justify-center shadow-sm">
                              <Stethoscope className="w-7 h-7 text-teal-600 dark:text-teal-300" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-base">{doctor.name}</h4>
                              <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                              <p className="text-xs text-muted-foreground mt-1.5 flex items-center">
                                <Clock className="w-3.5 h-3.5 inline mr-1.5" />
                                {doctor.availability}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Queue</p>
                              <p className="text-2xl font-bold">{doctor.activeQueueCount}</p>
                            </div>
                            
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'doctors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Manage Doctors</h2>
                  <p className="text-sm text-muted-foreground">Add, edit, and manage doctors in your clinic</p>
                </div>
                <Button onClick={() => setShowAddDoctorDialog(true)} className="bg-teal-600 hover:bg-teal-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Doctor
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doctor) => (
                  <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-teal-600 dark:text-teal-300" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{doctor.name}</CardTitle>
                            <CardDescription>{doctor.specialization}</CardDescription>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveDoctor(doctor.id)}
                          className="hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2" />
                          {doctor.availability}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-sm text-muted-foreground">Active Queue</span>
                          <Badge variant={doctor.activeQueueCount > 0 ? 'default' : 'secondary'}>
                            {doctor.activeQueueCount} patients
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <Button 
                            className="w-full" 
                            variant="outline"
                            onClick={() => {
                              setSelectedDoctorId(doctor.id);
                              setActiveTab('patients');
                            }}
                          >
                            View Queue
                          </Button>
                          <Button 
                            className="w-full" 
                            variant="secondary"
                            onClick={() => {
                              setAvailabilityDoctorId(doctor.id);
                              setShowAvailabilityDialog(true);
                            }}
                          >
                            Set Availability
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Patient Queues</h2>
                <p className="text-sm text-muted-foreground">Manage queues for each doctor</p>
              </div>

              {/* Doctor selector */}
              <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/50 rounded-xl border border-border">
                <span className="text-sm font-medium text-muted-foreground ml-2 mr-1">Select Doctor:</span>
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  {doctors.map(doctor => {
                    const isActive = (selectedDoctorId || doctors[0]?.id) === doctor.id;
                    return (
                      <Button
                        key={doctor.id}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDoctorId(doctor.id)}
                        className={`rounded-full px-4 transition-all ${
                          isActive 
                            ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm border-transparent' 
                            : 'bg-background hover:bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        <Stethoscope className="w-3.5 h-3.5 mr-2" />
                        {doctor.name}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {[doctors.find(d => d.id === (selectedDoctorId || doctors[0]?.id))].filter((d): d is Doctor => d !== undefined).map(doctor => {
                const doctorPatients = getDoctorPatients(doctor.id);
                const currentPatient = doctorPatients.find(p => p.status === 'current');
                const waitingPatientsList = doctorPatients.filter(p => p.status === 'waiting');
                const completedPatientsList = doctorPatients.filter(p => p.status === 'completed');
                const totalToday = doctorPatients.length;

                return (
                  <div key={doctor.id} className="space-y-4 mb-8">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <h3 className="text-xl font-bold">{doctor.name}</h3>
                      <span className="text-sm text-muted-foreground">{doctor.specialization}</span>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="shadow-sm">
                        <CardContent className="p-4 flex items-center space-x-4">
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 rounded-xl">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Waiting</p>
                            <p className="text-2xl font-bold">{waitingPatientsList.length}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="shadow-sm">
                        <CardContent className="p-4 flex items-center space-x-4">
                          <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-xl">
                            <Activity className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">In Consultation</p>
                            <p className="text-2xl font-bold">{currentPatient ? 1 : 0}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="shadow-sm">
                        <CardContent className="p-4 flex items-center space-x-4">
                          <div className="p-3 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-500 rounded-xl">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Completed</p>
                            <p className="text-2xl font-bold">{completedPatientsList.length}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="shadow-sm">
                        <CardContent className="p-4 flex items-center space-x-4">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-xl">
                            <Activity className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Today</p>
                            <p className="text-2xl font-bold">{totalToday}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Main Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                      {/* Left: In Consultation */}
                      <Card className="border-green-200 dark:border-green-800 shadow-sm overflow-hidden">
                        <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 flex items-center space-x-2 border-b border-green-100 dark:border-green-800/50">
                          <Activity className="w-4 h-4 text-green-700 dark:text-green-500" />
                          <span className="font-semibold text-green-800 dark:text-green-400">In Consultation</span>
                        </div>
                        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                          {currentPatient ? (
                            <div className="w-full text-center space-y-4">
                              <Avatar className="w-16 h-16 mx-auto">
                                <AvatarFallback className="bg-green-100 text-green-700 text-xl">
                                  {currentPatient.name.split(' ').map(n => n.charAt(0)).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-bold text-lg">{currentPatient.name}</h4>
                                <p className="text-sm text-muted-foreground">Token: {currentPatient.token}</p>
                              </div>
                              <Button
                                onClick={() => handleNextPatient(doctor.id)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                              >
                                Complete & Call Next
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center space-y-4">
                              <Activity className="w-12 h-12 text-muted-foreground opacity-20 mx-auto" />
                              <p className="text-sm text-muted-foreground font-medium">No active consultation</p>
                              <Button
                                onClick={() => handleNextPatient(doctor.id)}
                                disabled={waitingPatientsList.length === 0}
                                className="bg-blue-600 hover:bg-blue-700 text-white mt-2"
                              >
                                Call Next Patient
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Right: Waiting Queue */}
                      <Card className="lg:col-span-2 shadow-sm min-h-[250px]">
                        <CardHeader className="pb-3 border-b border-border">
                          <CardTitle className="text-base">Waiting Queue ({waitingPatientsList.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          {waitingPatientsList.length > 0 ? (
                            <div className="overflow-hidden">
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                              >
                                <SortableContext
                                  items={waitingPatientsList.map(p => p.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {waitingPatientsList.map((patient, index) => (
                                    <SortablePatientItem key={patient.id} patient={patient} index={index} />
                                  ))}
                                </SortableContext>
                              </DndContext>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
                              <p className="text-sm font-medium">Queue is empty</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Settings</h2>
                <p className="text-sm text-muted-foreground">Customize your clinic dashboard</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how your dashboard looks</CardDescription>
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
                  <CardTitle>Clinic Information</CardTitle>
                  <CardDescription>Your clinic details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Clinic Name</Label>
                    <p className="text-sm text-muted-foreground mt-1">{user?.clinicName || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Admin Username</Label>
                    <p className="text-sm text-muted-foreground mt-1">{user?.username}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Doctors</Label>
                    <p className="text-sm text-muted-foreground mt-1">{doctors.length} active doctors</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Add Doctor Dialog */}
      <Dialog open={showAddDoctorDialog} onOpenChange={setShowAddDoctorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
            <DialogDescription>
              Register a new doctor to your clinic
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="doctorName">Doctor Name</Label>
              <Input
                id="doctorName"
                placeholder="Dr. John Smith"
                value={newDoctor.name}
                onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                placeholder="General Practice, Cardiology, etc."
                value={newDoctor.specialization}
                onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Availability Time</Label>
              <Input
                id="availability"
                placeholder="9:00 AM - 5:00 PM"
                value={newDoctor.availability}
                onChange={(e) => setNewDoctor({ ...newDoctor, availability: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDoctorDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDoctor} className="bg-teal-600 hover:bg-teal-700">
              Add Doctor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Walk-in Dialog */}
      <Dialog open={showWalkInDialog} onOpenChange={setShowWalkInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Walk-in Patient</DialogTitle>
            <DialogDescription>
              Register an emergency walk-in patient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="walkInName">Patient Name</Label>
              <Input
                id="walkInName"
                placeholder="Enter patient name"
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="walkInPhone">Phone Number (Optional)</Label>
              <Input
                id="walkInPhone"
                placeholder="Enter phone number"
                value={walkInPhone}
                onChange={(e) => setWalkInPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="walkInDoctor">Assign to Doctor</Label>
              <select 
                id="walkInDoctor"
                value={walkInDoctorId} 
                onChange={(e) => setWalkInDoctorId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="">Select a doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWalkInDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddWalkIn} className="bg-teal-600 hover:bg-teal-700">
              Add Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Availability Dialog */}
      <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Doctor Availability</DialogTitle>
            <DialogDescription>
              Configure working hours and slot durations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Working Days</Label>
              <div className="flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <Badge key={day} variant={['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(day) ? "default" : "outline"} className={['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(day) ? "bg-teal-600" : "cursor-pointer"}>
                    {day}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" type="time" defaultValue="09:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" type="time" defaultValue="17:00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slotDuration">Slot Duration</Label>
              <select 
                id="slotDuration"
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                defaultValue="10"
              >
                <option value="10">10 mins</option>
                <option value="15">15 mins</option>
                <option value="20">20 mins</option>
                <option value="30">30 mins</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvailabilityDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Availability updated');
              setShowAvailabilityDialog(false);
            }} className="bg-teal-600 hover:bg-teal-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}