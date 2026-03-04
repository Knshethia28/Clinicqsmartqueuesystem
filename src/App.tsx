import React, { useState } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { PatientDashboard } from './components/PatientDashboard';

interface RegisteredUser {
  username: string;
  password: string;
  email: string;
  role: 'clinic' | 'patient';
  // Clinic-specific fields
  clinicName?: string;
  address?: string;
  contactNumber?: string;
  operatingHours?: string;
  // Patient-specific fields
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string; fullName?: string; clinicName?: string } | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([
    {
      username: 'clinic',
      password: 'clinic123',
      email: 'admin@democlinic.com',
      role: 'clinic',
      clinicName: 'Demo Medical Center',
      address: '123 Healthcare Ave, Medical District',
      contactNumber: '+1-555-CLINIC',
      operatingHours: 'Mon-Fri: 9AM-6PM, Sat: 9AM-2PM'
    },
    {
      username: 'patient1',
      password: 'patient123',
      email: 'john@example.com',
      role: 'patient',
      fullName: 'John Smith',
      phone: '+1-555-0123',
      dateOfBirth: '1985-06-15'
    }
  ]);

  const handleLogin = (username: string, password: string) => {
    // Check against registered users
    const foundUser = registeredUsers.find(
      u => u.username === username && u.password === password
    );
    
    if (foundUser) {
      setUser({ 
        username, 
        role: foundUser.role,
        fullName: foundUser.role === 'patient' ? foundUser.fullName : undefined,
        clinicName: foundUser.role === 'clinic' ? foundUser.clinicName : undefined
      });
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleSignUp = (userData: {
    username: string;
    password: string;
    email: string;
    role: 'clinic' | 'patient';
    clinicName?: string;
    address?: string;
    contactNumber?: string;
    operatingHours?: string;
    fullName?: string;
    phone?: string;
    dateOfBirth?: string;
  }) => {
    // Check if username already exists
    const userExists = registeredUsers.some(u => u.username === userData.username);
    if (userExists) {
      return { success: false, message: 'Username already exists' };
    }

    // Check if email already exists
    const emailExists = registeredUsers.some(u => u.email === userData.email);
    if (emailExists) {
      return { success: false, message: 'Email already registered' };
    }

    // Register new user
    setRegisteredUsers(prev => [...prev, userData]);
    
    // Auto-login after successful registration
    setUser({ 
      username: userData.username, 
      role: userData.role,
      fullName: userData.role === 'patient' ? userData.fullName : undefined,
      clinicName: userData.role === 'clinic' ? userData.clinicName : undefined
    });
    setIsLoggedIn(true);
    
    return { success: true, message: 'Account created successfully!' };
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} onSignUp={handleSignUp} />
      ) : user?.role === 'clinic' ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <PatientDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}