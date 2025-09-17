import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';
import axios from 'axios';

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check if coming from email link
  React.useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    
    if (token) {
      verifyTokenFromUrl(token);
    }
  }, [location]);

  const verifyTokenFromUrl = async (token) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/auth/verify-email?token=${token}`);
      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/auth/verify-email', { token: code });
      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed');
    }

    setLoading(false);
  };

  const resendCode = async () => {
    try {
      await axios.post('/api/auth/resend-verification');
      alert('Verification email sent!');
    } catch (error) {
      alert('Error sending verification email');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            {success ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <Mail className="h-16 w-16 text-primary-600" />
            )}
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {success ? 'Email Verified!' : 'Verify Your Email'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {success 
              ? 'Your email has been successfully verified. Redirecting to login...'
              : 'Enter the verification code sent to your email or click the link in your email.'
            }
          </p>
        </div>

        {!success && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                required
                className="input-field text-center text-lg tracking-widest"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={resendCode}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;