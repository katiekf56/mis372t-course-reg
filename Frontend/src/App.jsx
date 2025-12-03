import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import Schedule from './components/Schedule.jsx';
import SearchCourses from './components/SearchCourses.jsx';
import AddClass from './components/AddClass.jsx';
import Profile from './components/Profile.jsx';

export default function App() {
  return (
    <div className="app-root">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/search" element={<SearchCourses />} />
          <Route path="/add-class" element={<AddClass />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
      <footer className="footer">© Course Reg 2025</footer>
    </div>
  );
}
