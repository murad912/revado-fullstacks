import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState({ msg: '', isError: false, loading: false });
  
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setStatus({ msg: 'Passwords do not match.', isError: true });

    setStatus({ ...status, loading: true });
    try {
      await authService.resetPassword(token, password);
      setStatus({ msg: 'Password updated! Redirecting to login...', isError: false, loading: false });
      setTimeout(() => navigate('/auth'), 3000);
    } catch (err) {
      setStatus({ msg: 'Token invalid or expired. Please request a new link.', isError: true, loading: false });
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold text-primary">New Password</h3>
          <p className="text-muted small">Enter your new credentials below</p>
        </div>

        <form onSubmit={handleReset}>
          <div className="mb-3">
            <label className="form-label small fw-bold">New Password</label>
            <input 
              type="password" className="form-control" placeholder="••••••••" 
              onChange={e => setPassword(e.target.value)} disabled={status.loading} required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">Confirm Password</label>
            <input 
              type="password" className="form-control" placeholder="••••••••" 
              onChange={e => setConfirm(e.target.value)} disabled={status.loading} required 
            />
          </div>
          <button className="btn btn-primary w-100 py-2 fw-bold" disabled={status.loading || !password}>
            {status.loading ? <span className="spinner-border spinner-border-sm"></span> : 'Update Password'}
          </button>
        </form>

        {status.msg && (
          <div className={`alert mt-3 py-2 small ${status.isError ? 'alert-danger' : 'alert-success'}`}>
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;