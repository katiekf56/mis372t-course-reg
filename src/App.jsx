import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import Cart from './components/Cart.jsx';
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
        <Route path='/cart' element={<Cart />} />
        <Route path='/search' element={<SearchCourses />} />
        <Route path='/add-class' element={<AddClass />} />
      </Routes>
    </BrowserRouter>
  );
}
