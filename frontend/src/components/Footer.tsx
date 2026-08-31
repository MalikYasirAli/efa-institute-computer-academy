import React from 'react'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="font-semibold">EFA Institute of Computer Academy</div>
          <div className="text-sm text-gray-600">EFA Computer Academy Sillanwali</div>
          <div className="text-sm text-gray-600 mt-2">Owner/Director: M. Fareed</div>
        </div>

        <div>
          <div className="font-semibold">Navigation</div>
          <div className="flex flex-col mt-2 text-sm">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/courses">Courses</Link>
            <Link to="/admission">Admission</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>

        <div>
          <div className="font-semibold">Contact</div>
          <div className="text-sm mt-2">
            <div>Phone / WhatsApp: <a href="tel:+923417490257" className="text-efa-indigo-500">0341-7490257</a></div>
            <div>Secondary: <a href="tel:+923215867261" className="text-efa-indigo-500">0321-5867261</a></div>
            <div>Email: <a href="mailto:efacomputeracademy7@gmail.com" className="text-efa-indigo-500">efacomputeracademy7@gmail.com</a></div>
            <div className="mt-2 text-xs text-gray-500">Open: 7:00 AM – 7:00 PM</div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-50 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">© {new Date().getFullYear()} EFA Institute of Computer Academy — All rights reserved</div>
      </div>
    </footer>
  )
}

export default Footer
