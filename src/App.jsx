import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';

import { Routes, Route } from 'react-router-dom';

import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Problemset from './components/pages/Problemset';

import Ladders from './components/pages/Ladders';
import LadderPage from './components/pages/LadderPage';

import Admin from './components/pages/Admin';

const App = () => {
  const [user, setUser] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar user={user} setUser={setUser} />
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/problemset" element={<Problemset />} /> 
          <Route path="/ladders" element={<Ladders />} />
          <Route path="/ladder/:tableId" element={<LadderPage />} />
          <Route path='/admin' element={<Admin />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
