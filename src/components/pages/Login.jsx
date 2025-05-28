import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthForm = ({ setUser, mode = "login" }) => {
  const [formMode, setFormMode] = useState(mode);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: ''
  });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccess('');
    setIsLoading(true);

    if (formMode === 'signup') {
      try {
        const res = await axios.post('https://backendcodeladder-2.onrender.com/authen/signup', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        });
        setSuccess(res.data.message || 'Signup successful!');
        setUser(res.data.user.username);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.user.username);
        setTimeout(() => navigate('/'), 1000);
      } catch (err) {
        setMessage(err.response?.data?.error || "Something went wrong");
      }
    } else {
      try {
        const response = await axios.post(
          'https://backendcodeladder-2.onrender.com/authen/login',
          {
            username: formData.username,
            password: formData.password,
          }
        );
        setUser(response.data.user.username);
        localStorage.setItem('username', response.data.user.username);
        localStorage.setItem('token', response.data.token);
        setSuccess('Login successful!');
        setFormData({ username: '', password: '', email: '', phone: '' });
        setTimeout(() => navigate('/'), 700);
      } catch (error) {
        if (error.response) {
          setMessage(error.response.data.error || 'Login failed');
        } else {
          setMessage('Server error');
        }
      }
    }
    setIsLoading(false);
  };

  const handleModeSwitch = () => {
    setFormMode(formMode === 'login' ? 'signup' : 'login');
    setMessage('');
    setSuccess('');
    setFormData({ username: '', password: '', email: '', phone: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 hero-pattern opacity-10"></div>
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=1920&h=1080&fit=crop" 
          alt="Team Collaboration" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-purple-900/80"></div>
      </div>
      
      <div className="relative w-full max-w-md">
        <div className="card glass-effect backdrop-blur-xl border-white/30 shadow-2xl">
          {/* Header with Image */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&h=80&fit=crop&crop=center" 
                alt="CodeLadder" 
                className="w-16 h-16 mx-auto rounded-xl shadow-lg object-cover border-2 border-white/50"
              />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">
              {formMode === 'login' ? 'Welcome Back!' : 'Join CodeLadder'}
            </h2>
            <p className="text-blue-200">
              {formMode === 'login' 
                ? 'Sign in to continue your coding journey' 
                : 'Create your account and start climbing'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  {formMode === 'login' ? "Username or Email" : "Username"}
                </label>
                <input
                  name="username"
                  type="text"
                  placeholder={formMode === 'login' ? "Enter your username or email" : "Choose a username"}
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="input-field bg-white/90 border-white/20 text-gray-900 placeholder-gray-500"
                  autoFocus
                  disabled={isLoading}
                />
              </div>

              {formMode === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field bg-white/90 border-white/20 text-gray-900 placeholder-gray-500"
                    disabled={isLoading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field bg-white/90 border-white/20 text-gray-900 placeholder-gray-500"
                  disabled={isLoading}
                />
              </div>

              {formMode === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="input-field bg-white/90 border-white/20 text-gray-900 placeholder-gray-500"
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 2a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4z"/>
                  </svg>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414-1.414L9 5.586 7.707 4.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L11 3.586l-.293.293z" clipRule="evenodd"/>
                  </svg>
                  {formMode === 'login' ? 'Sign In' : 'Create Account'}
                </div>
              )}
            </button>
          </form>

          {(message || success) && (
            <div className="mt-6 text-center">
              {message && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-400/30 backdrop-blur-sm">
                  <p className="text-red-200 font-medium">{message}</p>
                </div>
              )}
              {success && (
                <div className="p-3 rounded-lg bg-green-500/20 border border-green-400/30 backdrop-blur-sm">
                  <p className="text-green-200 font-medium">{success}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-white/80">
              {formMode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={handleModeSwitch}
                disabled={isLoading}
                className="ml-2 font-bold text-blue-300 hover:text-blue-200 hover:underline focus:outline-none transition-colors disabled:opacity-70"
              >
                {formMode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
