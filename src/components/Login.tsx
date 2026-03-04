import React, { useState } from 'react';
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle, Alert, AlertDescription, Tabs, TabsContent, TabsList, TabsTrigger } from '../ui';
import { Stethoscope, Lock, User, Mail, Building, Phone, Calendar, MapPin, Clock } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => boolean;
  onSignUp: (userData: {
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
  }) => { success: boolean; message: string };
}

export function Login({ onLogin, onSignUp }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [selectedRole, setSelectedRole] = useState<'clinic' | 'patient'>('clinic');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    // Clinic fields
    clinicName: '',
    address: '',
    contactNumber: '',
    operatingHours: '',
    // Patient fields
    fullName: '',
    phone: '',
    dateOfBirth: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleRoleChange = (role: 'clinic' | 'patient') => {
    setSelectedRole(role);
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      clinicName: '',
      address: '',
      contactNumber: '',
      operatingHours: '',
      fullName: '',
      phone: '',
      dateOfBirth: ''
    });
    setError('');
    setSuccess('');
  };

  const validateSignUp = () => {
    if (!formData.username.trim()) return 'Username is required';
    if (formData.username.length < 3) return 'Username must be at least 3 characters';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Email is invalid';

    if (selectedRole === 'clinic') {
      if (!formData.clinicName.trim()) return 'Clinic name is required';
      if (!formData.address.trim()) return 'Address is required';
      if (!formData.contactNumber.trim()) return 'Contact number is required';
      if (!formData.operatingHours.trim()) return 'Operating hours are required';
    } else {
      if (!formData.fullName.trim()) return 'Full name is required';
      if (!formData.phone.trim()) return 'Phone number is required';
      if (!formData.dateOfBirth) return 'Date of birth is required';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 500));

    if (mode === 'login') {
      const success = onLogin(formData.username, formData.password);
      if (!success) {
        setError('Invalid login credentials. Please try again.');
      }
    } else {
      const validationError = validateSignUp();
      if (validationError) {
        setError(validationError);
        setIsLoading(false);
        return;
      }

      const result = onSignUp({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        role: selectedRole,
        ...(selectedRole === 'clinic' ? {
          clinicName: formData.clinicName,
          address: formData.address,
          contactNumber: formData.contactNumber,
          operatingHours: formData.operatingHours
        } : {
          fullName: formData.fullName,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth
        })
      });

      if (!result.success) {
        setError(result.message);
      } else {
        setSuccess(result.message);
      }
    }

    setIsLoading(false);
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      clinicName: '',
      address: '',
      contactNumber: '',
      operatingHours: '',
      fullName: '',
      phone: '',
      dateOfBirth: ''
    });
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-teal-600 rounded-full">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ClinicQ</h1>
          <p className="text-gray-600">Smart Queue Management System</p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-gray-900">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              {mode === 'login' 
                ? 'Sign in to access ClinicQ'
                : 'Join the ClinicQ platform'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === 'signup' && (
              <Tabs value={selectedRole} onValueChange={handleRoleChange} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="clinic" className="text-sm">Clinic Admin</TabsTrigger>
                  <TabsTrigger value="patient" className="text-sm">Patient</TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {mode === 'signup' && selectedRole === 'clinic' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="clinicName" className="text-gray-700">Clinic Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="clinicName"
                        type="text"
                        placeholder="Enter your clinic name"
                        value={formData.clinicName}
                        onChange={(e) => handleInputChange('clinicName', e.target.value)}
                        className="pl-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-700">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        type="text"
                        placeholder="Enter clinic address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="pl-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber" className="text-gray-700">Contact Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="contactNumber"
                        type="tel"
                        placeholder="Enter clinic phone number"
                        value={formData.contactNumber}
                        onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                        className="pl-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="operatingHours" className="text-gray-700">Operating Hours</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="operatingHours"
                        type="text"
                        placeholder="e.g., Mon-Fri: 9AM-6PM"
                        value={formData.operatingHours}
                        onChange={(e) => handleInputChange('operatingHours', e.target.value)}
                        className="pl-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Map Picker Placeholder */}
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
                    <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Location map picker (Coming Soon)</p>
                  </div>
                </>
              )}

              {mode === 'signup' && selectedRole === 'patient' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-700">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="pl-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="pl-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-gray-700">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="pl-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="pl-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  mode === 'login' ? 'Sign In' : mode === 'signup' && selectedRole === 'clinic' ? 'Register Clinic' : 'Create Account'
                )}
              </Button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  {mode === 'login' ? 'Sign up here' : 'Sign in here'}
                </button>
              </p>
            </div>

            {mode === 'login' && (
              <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                <p className="text-sm text-teal-800 font-medium mb-2">Demo Credentials:</p>
                <div className="space-y-1">
                  <p className="text-sm text-teal-700">Clinic Admin - Username: <span className="font-mono bg-white px-1 rounded">clinic</span> Password: <span className="font-mono bg-white px-1 rounded">clinic123</span></p>
                  <p className="text-sm text-teal-700">Patient - Username: <span className="font-mono bg-white px-1 rounded">patient1</span> Password: <span className="font-mono bg-white px-1 rounded">patient123</span></p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 ClinicQ. Smart healthcare management.</p>
        </div>
      </div>
    </div>
  );
}