import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if coming from email link
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    
    if (token) {
      verifyTokenFromUrl(token);
    }
  }, [location]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0 && !success) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, success]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const verifyTokenFromUrl = async (token) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/auth/verify-email?token=${token}`);
      setSuccess(true);
      toast.success(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/verify-email', { token: code });
      setSuccess(true);
      toast.success(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    }

    setLoading(false);
  };

  const resendCode = async () => {
    try {
      const email = localStorage.getItem('pendingVerificationEmail');
      if (!email) {
        toast.error('No email found for resending verification');
        return;
      }

      await axios.post('/api/auth/resend-verification', { email });
      toast.success('Verification code sent!');
      setTimeLeft(300);
      setCanResend(false);
    } catch (error) {
      toast.error('Error sending verification code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            {success ? (
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Mail className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
            )}
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {success ? 'Email Verified!' : 'Verify Your Email'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {success 
              ? 'Your email has been successfully verified. Redirecting to login...'
              : 'Enter the 6-digit verification code sent to your email.'
            }
          </p>
        </div>

        {!success && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Verification Code
              </label>
              <div className="relative">
                <input
                  id="code"
                  type="text"
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                {timeLeft > 0 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTime(timeLeft)}
                  </div>
                )}
              </div>
              {timeLeft === 0 && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  Verification code has expired. Please request a new one.
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || timeLeft === 0 || code.length !== 6}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify Email'
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={resendCode}
                disabled={!canResend}
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canResend ? "Didn't receive the code? Resend" : `Resend available in ${formatTime(timeLeft)}`}
              </button>
            </div>
          </form>
        )}

        {success && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Redirecting to login page...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;