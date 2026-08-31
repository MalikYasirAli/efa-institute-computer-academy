import React from 'react'
import { courses } from '@/data/courses'
import { Link } from 'react-router-dom'

export default function Courses(){
  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold">Courses</h1>
        <p className="mt-2 text-gray-600">Browse our course offerings below. Click a course to view details and admission options.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map(c => (
          <article key={c.slug} className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold">{c.title}</h2>
            <p className="mt-2 text-gray-600">{c.summary}</p>
            <div className="mt-4 flex items-center justify-between">
              <Link to={`/courses/${c.slug}`} className="text-efa-indigo-500">View Details</Link>
              <div className="text-sm text-gray-500">{c.durations?.join(' / ')}</div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
