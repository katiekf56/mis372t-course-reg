import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
// Cart component was removed/renamed to Schedule — use Schedule instead
import Schedule from './components/Schedule.jsx';
import SearchCourses from './components/SearchCourses.jsx';
import AddClass from './components/AddClass.jsx';
import Profile from "./components/Profile.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path='/' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/schedule' element={<Schedule />} />
        <Route path='/search' element={<SearchCourses />} />
        <Route path='/add-class' element={<AddClass />} />
      </Routes>
    </BrowserRouter>
  );
}
