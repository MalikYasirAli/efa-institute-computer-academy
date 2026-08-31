import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './routes/Home'
import About from './routes/About'
import Courses from './routes/Courses'
import CourseDetail from './routes/CourseDetail'
import Admission from './routes/Admission'
import ApplicationStatus from './routes/ApplicationStatus'
import CertificateVerification from './routes/CertificateVerification'
import Contact from './routes/Contact'
import Privacy from './routes/Privacy'
import Terms from './routes/Terms'
import Disclaimer from './routes/Disclaimer'
import AdminLogin from './routes/Admin/Login'
import AdminDashboard from './routes/Admin/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />
        <Route path="/admission" element={<Admission />} />
        <Route path="/application-status" element={<ApplicationStatus />} />
        <Route path="/certificate-verification" element={<CertificateVerification />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}
