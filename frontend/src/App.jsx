import { useState } from 'react'
import './App.css'
import { Routes, Route } from "react-router-dom";
import Landing from './pages/Landing.jsx';
import SignUp from './pages/SignUp.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';






function App() {

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/sign_up" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
  
    </Routes>
  )
}

export default App
