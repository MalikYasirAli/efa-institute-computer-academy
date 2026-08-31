import React from 'react'

export default function Contact(){
  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold">Contact</h1>
        <div className="mt-3 text-gray-600">
          <div>Phone / WhatsApp: <a href="tel:+923417490257" className="text-efa-indigo-500">0341-7490257</a></div>
          <div>Email: <a href="mailto:efacomputeracademy7@gmail.com" className="text-efa-indigo-500">efacomputeracademy7@gmail.com</a></div>
          <div>Address: Sillanwali, Sargodha, Pakistan</div>
          <div>Hours: 7:00 AM – 7:00 PM</div>
        </div>
        <div className="mt-4">
          <a href="https://wa.me/923417490257" className="px-4 py-2 bg-efa-lime-500 text-white rounded-md">Message on WhatsApp</a>
        </div>
      </section>
    </div>
  )
}
