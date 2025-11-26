import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';

interface Props {
  onLogin: (role: UserRole) => void;
}

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [formData, setFormData] = useState({ id: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when component mounts (navigation back to login)
  useEffect(() => {
    setSelectedRole(null);
    setFormData({ id: '', password: '' });
    setIsLoading(false);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setFormData({ id: '', password: '' });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.id || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    // Simulate authentication delay handled by parent
    onLogin(selectedRole);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-900 text-white mb-6 shadow-lg">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Attendly</h1>
          <p className="text-gray-500 text-sm">
            {selectedRole === 'student' ? 'Student Portal Access' : 
             selectedRole === 'teacher' ? 'Faculty Dashboard Access' : 
             'Please select your portal to continue'}
          </p>
        </div>

        {!selectedRole ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <button 
              onClick={() => handleRoleSelect('student')}
              className="w-full group bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 flex items-center justify-between"
            >
               <div className="flex items-center gap-4">
                 <div className="bg-gray-100 p-3 rounded-full text-gray-600 group-hover:bg-gray-200 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                 </div>
                 <div className="text-left">
                   <h3 className="font-semibold text-gray-900">Student Portal</h3>
                   <p className="text-xs text-gray-500">View attendance & insights</p>
                 </div>
               </div>
               <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
               </svg>
            </button>

            <button 
              onClick={() => handleRoleSelect('teacher')}
              className="w-full group bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 flex items-center justify-between"
            >
               <div className="flex items-center gap-4">
                 <div className="bg-gray-100 p-3 rounded-full text-gray-600 group-hover:bg-gray-200 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                 </div>
                 <div className="text-left">
                   <h3 className="font-semibold text-gray-900">Teacher Dashboard</h3>
                   <p className="text-xs text-gray-500">Manage classes & alerts</p>
                 </div>
               </div>
               <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
               </svg>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {selectedRole === 'student' ? 'Username / Roll Number' : 'Username / Faculty ID'}
              </label>
              <input 
                type="text" 
                value={formData.id}
                onChange={(e) => setFormData({...formData, id: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                placeholder={selectedRole === 'student' ? 'e.g. 2024-CS-042' : 'e.g. FAC-001'}
                autoFocus
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-xs text-gray-500 hover:text-gray-900">Forgot?</a>
              </div>
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-100 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-lg hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Sign In'}
              </button>
              
              <button 
                type="button" 
                onClick={() => handleRoleSelect(null)}
                className="w-full bg-white text-gray-600 font-medium py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Back to Selection
              </button>
            </div>
          </form>
        )}

        <div className="mt-10 text-center text-xs text-gray-400">
          &copy; 2024 Attendly Systems.
        </div>
      </div>
    </div>
  );
};