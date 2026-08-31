import React from 'react'
import { Outlet, Link } from 'react-router-dom'

const Header: React.FC = () => (
  <header className="bg-white shadow-sm">
    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
      <Link to="/" className="font-semibold text-lg text-efa-navy-500">EFA Institute of Computer Academy</Link>
      <nav className="space-x-4 hidden md:block">
        <Link to="/courses" className="text-gray-700">Courses</Link>
        <Link to="/admission" className="text-gray-700">Admission</Link>
        <Link to="/contact" className="text-gray-700">Contact</Link>
      </nav>
    </div>
  </header>
)

const Footer: React.FC = () => (
  <footer className="bg-white border-t mt-12">
    <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} EFA Institute of Computer Academy — Sillanwali
    </div>
  </footer>
)

const Layout: React.FC = () => (
  <>
    <Header />
    <main>
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </main>
    <Footer />
  </>
)

export default Layout
