import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Insights from './components/Insights';
import MyTeam from './components/MyTeam';
import Settings from './components/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';


// Simple Login/Register form component
function SimpleLoginForm() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nama, setNama] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login or registration logic here
    if (isLoginView) {
      console.log("Login attempt with:", { email, password });
    } else {
      console.log("Register attempt with:", { nama, email, password, confirmPassword });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1>{isLoginView ? 'Login' : 'Register'}</h1>
        
        <form onSubmit={handleSubmit}>
          {!isLoginView && (
            <div className="form-group">
              <label htmlFor="name">Nama Lengkap</label>
              <input
                type="text"
                id="name"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama Lengkap"
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          
          {!isLoginView && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Konfirmasi Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi Password"
              />
            </div>
          )}
          
          <button type="submit" className="auth-button">
            {isLoginView ? 'Login' : 'Register'}
          </button>
        </form>
        
        <p className="auth-redirect">
          {isLoginView ? 'Belum punya akun?' : 'Sudah punya akun?'}
          <button 
            onClick={() => setIsLoginView(!isLoginView)}
            className="switch-button"
          >
            {isLoginView ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

// Main App component
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/insights" 
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-team" 
            element={
              <ProtectedRoute>
                <MyTeam />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
export default App;