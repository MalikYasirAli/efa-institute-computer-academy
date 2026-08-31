import React from 'react'

export default function About(){
  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold">About EFA Institute of Computer Academy</h1>
        <p className="mt-3 text-gray-600">EFA Computer Academy Sillanwali offers practical computer and digital skills training to help learners gain workplace-relevant abilities. We focus on hands-on lessons and instructor-led support.</p>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold">Location & Contact</h2>
        <div className="mt-2 text-gray-600">
          <div>Sillanwali, Sargodha, Pakistan</div>
          <div>Phone / WhatsApp: <a href="tel:+923417490257" className="text-efa-indigo-500">0341-7490257</a></div>
          <div>Email: <a href="mailto:efacomputeracademy7@gmail.com" className="text-efa-indigo-500">efacomputeracademy7@gmail.com</a></div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold">Leadership & Instruction</h2>
        <div className="mt-2 text-gray-600">
          <div>Owner/Director: M. Fareed</div>
          <div>Instructor (protected): Yasir Ali</div>
        </div>
      </section>
    </div>
  )
}
