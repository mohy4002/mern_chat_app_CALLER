import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/AuthForms.css';
import socket from '../socket.js';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state before submission
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      if (res.data.message && res.data.message !== 'User logged in') {
        setError(res.data.message); // Show error message from backend
      }
      // Emit to socket the user's ID (or any identifier your backend expects)
      socket.emit('join', res.data.user._id);
      navigate('/dashboard',{state:{user:res.data.user, token:res.data.token}}); // Redirect to dashboard if successful
      // You can also do other stuff here, like redirecting user or storing tokens
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <dir>
    <form onSubmit={handleSubmit } className="insc">
      <h2>
        <img src="/caller-logo.png" alt="Description" />
        Login</h2>
      
      {/* Bootstrap Alert for Errors - Only this part uses Bootstrap */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError("")} 
            aria-label="Close"
          ></button>
        </div>
      )}

      <input
        name="email"
        type="email"
        placeholder="Email"
        onChange={handleChange}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        required
      />
      <button type="submit">Login</button>
    </form>
    <div className="text-center">
      <p>
        Don't have an account? <a href="/sign_up">Sign Up</a>
      </p>
    </div>
      
    </dir>
  );
};

export default Login;