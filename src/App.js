import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';        // Aapka naya Home component
import Login from './components/Login';      // Aapka purana Login component
import Signup from './components/Signup';    // Aapka purana Signup component
import Profile from './components/Profile';  // Aapka purana Profile component
import AdminPanel from './components/AdminPanel'; // Naya Admin Panel component

function App() {
  return (
    <Router>
      <Routes>
        {/* Ye line Home ko default page banayegi (i.e., jab koi root URL par aayega) */}
        <Route path="/" element={<Home />} />
        
        {/* Baaki sabhi pages ke routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* === ADMIN PANEL ROUTE === */}
        <Route path="/admin" element={<AdminPanel />} />
        
        {/* Aapke aage aane wale pages jaise Shopping, Restaurant yahan add honge baad mein */}
        {/* <Route path="/shopingzone" element={<Shopping />} /> */}
      </Routes>
    </Router>
  );
}

export default App;