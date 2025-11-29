import {  } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route , Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Home from './pages/Home';
import Watch from './pages/Watch';
import UploadVideo from './pages/UploadVideo';
import UserProfile from './pages/UserProfile';
import ProtectedRoute from './pages/ProtectedRoute';
import { SearchProvider } from './context/SearchContext';
function App() {
  
  return (
    <SearchProvider>
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path='/register' element={<SignUp/>} />
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path='/login' element={<Login/>}/>
        <Route path='/home' element={<ProtectedRoute><Home/></ProtectedRoute>}/>
        <Route path='/watch/:videoId' element={<ProtectedRoute><Watch/></ProtectedRoute>}/>
        <Route path='/profile/:userId' element={<ProtectedRoute><UserProfile/></ProtectedRoute>}/>
        <Route path='/upload' element={<ProtectedRoute><UploadVideo/></ProtectedRoute>}/>
      </Routes>
      </BrowserRouter>
    </AuthProvider>
    </SearchProvider>
  )
}

export default App
