import { useState } from 'react';
import { Stethoscope, User, Mail, Lock } from 'lucide-react';
import type { User as UserType, UserRole } from '../App';

interface AuthScreenProps {
  onLogin: (user: UserType) => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('doctor');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    preferredLanguage: 'English',
  });

  // Mock accounts for demo
  const mockAccounts = {
    doctors: [
      { id: 'doc-001', name: 'Dr. Sarah Johnson', email: 'sarah.johnson@hospital.com', role: 'doctor' as UserRole, preferredLanguage: 'English' },
      { id: 'doc-002', name: 'Dr. Michael Chen', email: 'michael.chen@hospital.com', role: 'doctor' as UserRole, preferredLanguage: 'English' },
    ],
    patients: [
      { id: 'pat-001', name: 'Maria Garcia', email: 'maria.garcia@email.com', role: 'patient' as UserRole },
      { id: 'pat-002', name: 'John Smith', email: 'john.smith@email.com', role: 'patient' as UserRole },
    ],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For demo purposes, create/login user based on role
    if (isLogin) {
      // Try to find existing account
      const allAccounts = [...mockAccounts.doctors, ...mockAccounts.patients];
      const existingUser = allAccounts.find(
        acc => acc.email.toLowerCase() === formData.email.toLowerCase()
      );

      if (existingUser) {
        onLogin(existingUser);
      } else {
        // Default login based on role
        if (role === 'doctor') {
          onLogin(mockAccounts.doctors[0]);
        } else {
          onLogin(mockAccounts.patients[0]);
        }
      }
    } else {
      // Sign up - create new user
      const newUser: UserType = {
        id: `${role}-${Date.now()}`,
        name: formData.name || (role === 'doctor' ? 'Dr. New Doctor' : 'New Patient'),
        email: formData.email,
        role: role,
        preferredLanguage: role === 'doctor' ? formData.preferredLanguage : undefined,
      };
      onLogin(newUser);
    }
  };

  const quickLogin = (user: UserType) => {
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-5 rounded-3xl inline-block mb-6 shadow-2xl">
            <Stethoscope className="size-14 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            MediTranscribe AI
          </h1>
          <p className="text-gray-600 mt-3 text-lg">AI-Powered Telemedicine Assistant</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 space-y-6 border border-teal-100">
          <div className="flex items-center justify-center gap-3 border-b border-gray-200 pb-5">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-6 py-2.5 rounded-xl transition-all font-semibold ${
                isLogin
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-6 py-2.5 rounded-xl transition-all font-semibold ${
                !isLogin
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">
                I am a:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={`p-5 rounded-2xl border-2 transition-all ${
                    role === 'doctor'
                      ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-900 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <Stethoscope className="size-7 mx-auto mb-2" />
                  <p className="font-semibold">Doctor</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`p-5 rounded-2xl border-2 transition-all ${
                    role === 'patient'
                      ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-900 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <User className="size-7 mx-auto mb-2" />
                  <p className="font-semibold">Patient</p>
                </button>
              </div>
            </div>

            {/* Name (Sign Up Only) */}
            {!isLogin && (
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="size-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* Preferred Language (Sign Up for Doctors Only) */}
            {!isLogin && role === 'doctor' && (
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Preferred Translation Language
                </label>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Mandarin">Mandarin</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Portuguese">Portuguese</option>
                </select>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Email
              </label>
              <div className="relative">
                <Mail className="size-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock className="size-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-3.5 rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              {isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          {/* Quick Login for Demo */}
          <div className="pt-5 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3 text-center font-medium">Quick Demo Login:</p>
            <div className="space-y-2">
              {mockAccounts.doctors.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => quickLogin(doc)}
                  className="w-full text-left px-4 py-3 bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 rounded-xl transition-all text-sm border border-teal-200 hover:border-teal-300 shadow-sm hover:shadow-md"
                >
                  <span className="font-semibold text-teal-900">{doc.name}</span>
                  <span className="text-teal-700 ml-2">(Doctor)</span>
                </button>
              ))}
              {mockAccounts.patients.map((pat) => (
                <button
                  key={pat.id}
                  onClick={() => quickLogin(pat)}
                  className="w-full text-left px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 rounded-xl transition-all text-sm border border-cyan-200 hover:border-cyan-300 shadow-sm hover:shadow-md"
                >
                  <span className="font-semibold text-cyan-900">{pat.name}</span>
                  <span className="text-cyan-700 ml-2">(Patient)</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}