import React from 'react'
import { Link } from 'react-router-dom'
import { courses } from '@/data/courses'

export default function Home(){
  return (
    <div className="space-y-12">
      <section className="bg-white rounded-lg p-6 md:p-12 shadow-sm">
        <div className="md:flex md:items-center md:justify-between">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-4xl font-extrabold text-efa-navy-700">EFA Institute of Computer Academy</h1>
            <p className="mt-4 text-gray-600">Practical computer and digital skills training in Sillanwali. Prepare for real-world roles with hands-on classes and instructor-led guidance.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/admission" className="inline-flex items-center px-4 py-2 bg-efa-indigo-500 text-white rounded-md shadow-sm">Apply for Admission</Link>
              <Link to="/courses" className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-md">View Courses</Link>
              <a href="https://wa.me/923417490257" className="inline-flex items-center px-4 py-2 bg-efa-lime-500 text-white rounded-md">WhatsApp: 0341-7490257</a>
            </div>
          </div>
          <div className="mt-6 md:mt-0">
            <img src="/website/assets/images/logo-placeholder.svg" alt="EFA logo" className="w-48 h-auto" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold">About EFA</h2>
          <p className="mt-3 text-gray-600">EFA Institute of Computer Academy provides foundational training in computer skills and practical digital marketing to students and local professionals in Sillanwali.</p>
          <Link to="/about" className="mt-4 inline-block text-efa-indigo-500">Learn more</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm col-span-2">
          <h2 className="text-xl font-semibold">Courses</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map(c => (
              <div key={c.slug} className="border rounded-md p-4 hover:shadow-md bg-white">
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{c.summary}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Link to={`/courses/${c.slug}`} className="text-efa-indigo-500">View Details</Link>
                  <div className="text-sm text-gray-500">{c.durations?.join(' / ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold">Why choose EFA?</h2>
        <ul className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
          <li>Practical, hands-on training</li>
          <li>Local, accessible location in Sillanwali</li>
          <li>Dedicated instructor support</li>
        </ul>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold">Admission</h2>
        <p className="mt-2 text-gray-600">Ready to apply? Start your application and our staff will guide you through the process.</p>
        <div className="mt-4">
          <Link to="/admission" className="px-4 py-2 bg-efa-indigo-500 text-white rounded-md">Apply for Admission</Link>
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold">Contact</h2>
        <div className="mt-3 text-gray-600">
          <div>Phone / WhatsApp: <a className="text-efa-indigo-500" href="tel:+923417490257">0341-7490257</a></div>
          <div>Email: <a className="text-efa-indigo-500" href="mailto:efacomputeracademy7@gmail.com">efacomputeracademy7@gmail.com</a></div>
          <div className="mt-2">Address: Sillanwali, Sargodha, Pakistan</div>
          <div>Hours: 7:00 AM – 7:00 PM</div>
        </div>
      </section>
    </div>
  )
}
