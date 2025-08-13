import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/AuthForms.css';


const SignUp = () => {
 const navigate = useNavigate();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state before submission
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', form);
      if (res.data.message && res.data.message !== 'User created') {
        setError(res.data.message); // Show error message from backend
      } else {
        navigate('/login'); // Redirect to login if successful
      }
    } catch (err) {
      // Set error message from backend or a generic error
      setError(err.response?.data?.message || 'Error during sign up');
    }
  };

  return (
    <>

    <form onSubmit={handleSubmit} className="insc">
        <h2>
          <img src="/caller-logo.png" alt="Description" />
          Sign Up
        </h2>

        {/* Bootstrap Alert for Errors */}
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

        <input name="username" placeholder="Username" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
      <div className="text-center">
        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
      </>

  );
};

export default SignUp;
