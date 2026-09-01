import React from 'react'
import { supabase } from '@/lib/supabaseClient'
import { fetchAttendance, createAttendanceAdmin, updateAttendanceAdmin } from '@/lib/attendance'

export default function AdminAttendance(){
  const [courses, setCourses] = React.useState<any[]>([])
  const [courseId, setCourseId] = React.useState<string | null>(null)
  const [date, setDate] = React.useState<string>(new Date().toISOString().slice(0,10))
  const [students, setStudents] = React.useState<any[]>([])
  const [attendanceMap, setAttendanceMap] = React.useState<Record<string, any>>({})
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => { loadCourses() }, [])

  async function loadCourses() {
    const { data, error } = await supabase.from('courses').select('id, title').order('title')
    if (error) { console.error(error); setCourses([]); return }
    setCourses(data ?? [])
    if ((data ?? []).length > 0) setCourseId((data ?? [])[0].id)
  }

  async function loadStudentsForCourse() {
    if (!courseId) return
    setLoading(true)
    try {
      const { data, error } = await supabase.from('students').select('id, student_id, registration_number, full_name').eq('course_id', courseId).eq('status', 'Active').order('full_name').limit(500)
      if (error) throw error
      setStudents(data ?? [])
      const ids = (data ?? []).map((s:any) => s.id)
      if (ids.length === 0) {
        setAttendanceMap({})
        setLoading(false)
        return
      }
      const records = await fetchAttendance({ date, courseId })
      const map: Record<string, any> = {}
      ;(records ?? []).forEach(r => { map[r.student_id] = r })
      setAttendanceMap(map)
    } catch (err:any) {
      console.error(err)
      setStudents([])
    } finally { setLoading(false) }
  }

  React.useEffect(() => { loadStudentsForCourse() }, [courseId, date])

  async function mark(studentId: string, status: string) {
    try {
      await createAttendanceAdmin({ studentId, attendanceDate: date, status })
      await loadStudentsForCourse()
    } catch (err:any) { console.error(err); alert('Failed to mark') }
  }

  async function toggleEdit(attId: string) {
    const newStatus = prompt('New status (Present/Absent/Leave):')
    if (!newStatus) return
    try {
      await updateAttendanceAdmin(attId, { status: newStatus })
      await loadStudentsForCourse()
    } catch (err:any) { console.error(err); alert('Update failed') }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded">
        <h1 className="text-xl font-bold">Attendance</h1>
        <div className="mt-3 flex flex-col md:flex-row gap-3">
          <select value={courseId ?? ''} onChange={e => setCourseId(e.target.value || null)} className="border p-2 rounded">
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 rounded" />
          <button onClick={loadStudentsForCourse} className="px-3 py-2 bg-efa-indigo-500 text-white rounded">Load</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded">
        {loading ? <div>Loading...</div> : (
          <div>
            {students.length === 0 ? <div className="text-sm text-gray-500">No students found for this course</div> : (
              <div className="space-y-2">
                {students.map(s => (
                  <div key={s.id} className="border p-2 rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">{s.full_name}</div>
                      <div className="text-sm text-gray-600">{s.student_id} • {s.registration_number}</div>
                    </div>
                    <div className="flex gap-2">
                      {attendanceMap[s.id] ? (
                        <>
                          <div className="px-3 py-1 rounded bg-gray-100">{attendanceMap[s.id].status}</div>
                          <button onClick={() => toggleEdit(attendanceMap[s.id].id)} className="px-2 py-1 bg-efa-indigo-500 rounded text-white">Edit</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => mark(s.id, 'Present')} className="px-2 py-1 bg-efa-lime-500 rounded">Present</button>
                          <button onClick={() => mark(s.id, 'Absent')} className="px-2 py-1 bg-rose-600 rounded text-white">Absent</button>
                          <button onClick={() => mark(s.id, 'Leave')} className="px-2 py-1 bg-efa-indigo-500 rounded text-white">Leave</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
