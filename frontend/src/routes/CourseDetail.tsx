import React from 'react'
import { useParams } from 'react-router-dom'
export default function CourseDetail(){
  const { slug } = useParams()
  return <div><h1 className="text-xl font-semibold">Course: {slug}</h1><p className="mt-2 text-gray-600">Course detail placeholder.</p></div>
}
