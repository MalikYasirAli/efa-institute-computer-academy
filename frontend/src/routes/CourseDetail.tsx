import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { courses } from '@/data/courses'

export default function CourseDetail(){
  const { slug } = useParams()
  const course = courses.find(c => c.slug === slug)

  if (!course) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-xl font-semibold">Course not found</h1>
        <p className="mt-2 text-gray-600">We couldn't find a course with that identifier.</p>
        <Link to="/courses" className="mt-4 inline-block text-efa-indigo-500">Back to courses</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="mt-3 text-gray-600">{course.description}</p>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold">Topics</h2>
        <ul className="mt-3 list-disc list-inside text-gray-600">
          {course.topics?.map((t, i) => (<li key={i}>{t}</li>))}
        </ul>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold">Duration Options</h2>
        <div className="mt-3 text-gray-600">{course.durations?.join(', ')}</div>
        <div className="mt-4">
          <Link to="/admission" className="px-4 py-2 bg-efa-indigo-500 text-white rounded-md">Apply for Admission</Link>
          <a href="https://wa.me/923417490257" className="ml-3 px-4 py-2 bg-efa-lime-500 text-white rounded-md">WhatsApp</a>
        </div>
      </section>
    </div>
  )
}
