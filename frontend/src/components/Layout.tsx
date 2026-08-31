import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

const Layout: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-neutral-100 text-gray-900">
    <Header />
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </main>
    <Footer />
  </div>
)

export default Layout
