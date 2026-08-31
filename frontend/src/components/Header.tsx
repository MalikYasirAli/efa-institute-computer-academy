import React from 'react'
import { Link } from 'react-router-dom'

const Header: React.FC = () => {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-efa-indigo-500 rounded-md flex items-center justify-center text-white font-bold">E</div>
          <div className="text-sm font-semibold">
            <div className="text-efa-navy-700">EFA Institute</div>
            <div className="text-xs text-gray-500">Computer Academy — Sillanwali</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-700 hover:text-efa-indigo-500">Home</Link>
          <Link to="/about" className="text-gray-700 hover:text-efa-indigo-500">About</Link>
          <Link to="/courses" className="text-gray-700 hover:text-efa-indigo-500">Courses</Link>
          <Link to="/admission" className="text-gray-700 hover:text-efa-indigo-500">Admission</Link>
          <Link to="/application-status" className="text-gray-700 hover:text-efa-indigo-500">Application Status</Link>
          <Link to="/certificate-verification" className="text-gray-700 hover:text-efa-indigo-500">Certificate Verification</Link>
          <Link to="/contact" className="text-gray-700 hover:text-efa-indigo-500">Contact</Link>
        </nav>

        <div className="md:hidden">
          <button
            aria-label="Toggle menu"
            className="p-2 rounded-md border border-gray-200"
            onClick={() => setOpen(!open)}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link to="/" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/about" onClick={() => setOpen(false)}>About</Link>
            <Link to="/courses" onClick={() => setOpen(false)}>Courses</Link>
            <Link to="/admission" onClick={() => setOpen(false)}>Admission</Link>
            <Link to="/application-status" onClick={() => setOpen(false)}>Application Status</Link>
            <Link to="/certificate-verification" onClick={() => setOpen(false)}>Certificate Verification</Link>
            <Link to="/contact" onClick={() => setOpen(false)}>Contact</Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
