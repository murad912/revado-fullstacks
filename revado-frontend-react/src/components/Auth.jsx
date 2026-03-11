import React, { useState } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [status, setStatus] = useState({ msg: '', isError: false });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ msg: '', isError: false });

    try {
      if (isForgotMode) {
        await authService.forgotPassword(resetEmail);
        setStatus({ msg: 'Reset link sent!', isError: false });
      } else if (isLoginMode) {
        await authService.login(formData.username, formData.password);
        navigate('/dashboard');
      } else {
        await authService.signup(formData);
        setStatus({ msg: 'Account created! Please login.', isError: false });
        setIsLoginMode(true);
      }
    } catch (err) {
      setStatus({ msg: err.response?.data?.message || 'Connection Error', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f8f9fa' 
    }}>
      <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '400px', margin: '15px' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary display-6">RevaDo</h2>
            <p className="text-muted">
              {isForgotMode ? 'Reset Password' : (isLoginMode ? 'Welcome Back' : 'Join Us')}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {!isForgotMode && (
              <div className="mb-3">
                <label className="form-label fw-bold small">Username</label>
                <input 
                  type="text" className="form-control" 
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required 
                />
              </div>
            )}

            {!isLoginMode || isForgotMode ? (
              <div className="mb-3">
                <label className="form-label fw-bold small">Email</label>
                <input 
                  type="email" className="form-control" 
                  value={isForgotMode ? resetEmail : formData.email} 
                  onChange={(e) => isForgotMode ? setResetEmail(e.target.value) : setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
            ) : null}

            {!isForgotMode && (
              <div className="mb-4">
                <label className="form-label fw-bold small">Password</label>
                <input 
                  type="password" className="form-control" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary w-100 fw-bold py-2 mb-3" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isForgotMode ? 'Send Link' : (isLoginMode ? 'Login' : 'Sign Up'))}
            </button>
          </form>

          {status.msg && (
            <div className={`alert py-2 small text-center ${status.isError ? 'alert-danger' : 'alert-success'}`}>
              {status.msg}
            </div>
          )}

          <div className="text-center mt-3">
            <button 
              className="btn btn-link btn-sm text-decoration-none" 
              onClick={() => { setIsForgotMode(!isForgotMode); setIsLoginMode(true); }}
            >
              {isForgotMode ? 'Back to Login' : 'Forgot Password?'}
            </button>
            <br />
            {!isForgotMode && (
              <button 
                className="btn btn-link btn-sm text-decoration-none" 
                onClick={() => setIsLoginMode(!isLoginMode)}
              >
                {isLoginMode ? "Need an account? Sign Up" : "Already have an account? Login"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;