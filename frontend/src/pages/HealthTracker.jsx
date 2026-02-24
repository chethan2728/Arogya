import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const HealthTracker = () => {
  const { token, backendUrl } = useContext(AppContext)
  const [health, setHealth] = useState({ visits: [], records: [] })
  const [activePlans, setActivePlans] = useState([])
  const [progress, setProgress] = useState({ upcomingAppointments: 0, completedAppointments: 0, adherenceStreak: 0, pendingActions: 0 })
  const [followupTimeline, setFollowupTimeline] = useState([])
  const [visitDate, setVisitDate] = useState('')
  const [visitNotes, setVisitNotes] = useState('')
  const [recordTitle, setRecordTitle] = useState('')
  const [recordNotes, setRecordNotes] = useState('')
  const [recordFile, setRecordFile] = useState(null)
  const [endReason, setEndReason] = useState('')

  const loadHealth = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/health', { headers: { token } })
      if (data.success) {
        setHealth(data.health)
        setActivePlans(data.activePlans)
        setProgress(data.progress || { upcomingAppointments: 0, completedAppointments: 0, adherenceStreak: 0, pendingActions: 0 })
        setFollowupTimeline(data.followupTimeline || [])
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const addVisit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post(backendUrl + '/api/user/health/visit', { date: visitDate, notes: visitNotes }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        setVisitDate('')
        setVisitNotes('')
        loadHealth()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const addRecord = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('title', recordTitle)
      formData.append('notes', recordNotes)
      if (recordFile) {
        formData.append('report', recordFile)
      }
      const { data } = await axios.post(backendUrl + '/api/user/health/record', formData, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        setRecordTitle('')
        setRecordNotes('')
        setRecordFile(null)
        loadHealth()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const endCare = async (docId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/health/end-care', { docId, reason: endReason }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        setEndReason('')
        loadHealth()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) loadHealth()
  }, [token])

  return (
    <div className='mt-8 space-y-8'>
      <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='glass-card rounded-2xl p-4'>
          <p className='text-xs soft-text'>Upcoming Appointments</p>
          <p className='text-2xl font-semibold surface-text'>{progress.upcomingAppointments}</p>
        </div>
        <div className='glass-card rounded-2xl p-4'>
          <p className='text-xs soft-text'>Completed Visits</p>
          <p className='text-2xl font-semibold surface-text'>{progress.completedAppointments}</p>
        </div>
        <div className='glass-card rounded-2xl p-4'>
          <p className='text-xs soft-text'>Adherence Streak</p>
          <p className='text-2xl font-semibold surface-text'>{progress.adherenceStreak}</p>
        </div>
        <div className='glass-card rounded-2xl p-4'>
          <p className='text-xs soft-text'>Pending Actions</p>
          <p className='text-2xl font-semibold surface-text'>{progress.pendingActions}</p>
        </div>
      </div>

      <div className='glass-card rounded-2xl p-6'>
        <p className='text-xl font-semibold surface-text futurist-title'>Active Care Plans</p>
        <div className='mt-4 space-y-3'>
          {activePlans.length === 0 && <p className='soft-text'>No active plans yet.</p>}
          {activePlans.map(plan => (
            <div key={plan._id} className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-cyan-200/30 rounded-xl p-4'>
              <div>
                <p className='surface-text font-medium'>{plan.doctor?.name || 'Doctor'}</p>
                <p className='soft-text text-sm'>{plan.doctor?.speciality || 'General'}</p>
                <p className='soft-text text-xs'>Started: {new Date(plan.startedAt).toLocaleDateString()}</p>
              </div>
              <div className='flex gap-2'>
                <input value={endReason} onChange={(e) => setEndReason(e.target.value)} className='border border-cyan-200/40 rounded px-3 py-2 bg-white/70 surface-text text-sm' placeholder='Reason to end' />
                <button onClick={() => endCare(plan.docId)} className='aqua-outline px-4 py-2 rounded-full text-sm'>End Care</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='glass-card rounded-2xl p-6'>
        <p className='text-xl font-semibold surface-text futurist-title'>Post-Visit Follow-up Timeline</p>
        <div className='mt-4 space-y-3'>
          {!followupTimeline.length && <p className='soft-text'>No follow-up actions yet.</p>}
          {followupTimeline.map(item => (
            <div key={item.id} className='border border-cyan-200/30 rounded-xl p-4 flex items-center justify-between'>
              <div>
                <p className='surface-text font-medium'>{item.title}</p>
                <p className='soft-text text-sm'>Due: {new Date(item.dueAt).toLocaleDateString()}</p>
              </div>
              <p className={`text-xs px-2 py-1 rounded-full ${item.status === 'done' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {item.status}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className='grid md:grid-cols-2 gap-6'>
        <form onSubmit={addVisit} className='glass-card rounded-2xl p-6 space-y-3'>
          <p className='text-lg font-semibold surface-text'>Add Visit</p>
          <input type='date' value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className='border border-cyan-200/40 rounded px-3 py-2 bg-white/70 surface-text text-sm w-full' required />
          <textarea value={visitNotes} onChange={(e) => setVisitNotes(e.target.value)} rows={3} className='border border-cyan-200/40 rounded px-3 py-2 bg-white/70 surface-text text-sm w-full' placeholder='Visit notes' />
          <button className='aqua-button text-deep px-5 py-2 rounded-full text-sm'>Save Visit</button>
        </form>

        <form onSubmit={addRecord} className='glass-card rounded-2xl p-6 space-y-3'>
          <p className='text-lg font-semibold surface-text'>Upload Report</p>
          <input value={recordTitle} onChange={(e) => setRecordTitle(e.target.value)} className='border border-cyan-200/40 rounded px-3 py-2 bg-white/70 surface-text text-sm w-full' placeholder='Report title (optional)' />
          <textarea value={recordNotes} onChange={(e) => setRecordNotes(e.target.value)} rows={3} className='border border-cyan-200/40 rounded px-3 py-2 bg-white/70 surface-text text-sm w-full' placeholder='Record notes' />
          <input
            type='file'
            accept='.pdf,.png,.jpg,.jpeg,.doc,.docx'
            onChange={(e) => setRecordFile(e.target.files?.[0] || null)}
            className='border border-cyan-200/40 rounded px-3 py-2 bg-white/70 surface-text text-sm w-full'
          />
          <button className='aqua-button text-deep px-5 py-2 rounded-full text-sm'>Upload Report</button>
        </form>
      </div>

      <div className='glass-card rounded-2xl p-6'>
        <p className='text-lg font-semibold surface-text'>History</p>
        <div className='mt-4 grid md:grid-cols-2 gap-6'>
          <div>
            <p className='surface-text font-medium'>Visits</p>
            <ul className='mt-2 space-y-2'>
              {health.visits?.map((visit, idx) => (
                <li key={idx} className='text-sm soft-text border border-cyan-200/20 rounded-lg p-3'>
                  <p>{visit.date}</p>
                  <p>{visit.notes}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className='surface-text font-medium'>Records</p>
            <ul className='mt-2 space-y-2'>
              {health.records?.map((record, idx) => (
                <li key={idx} className='text-sm soft-text border border-cyan-200/20 rounded-lg p-3'>
                  <p className='surface-text font-medium'>{record.title}</p>
                  <p>{record.notes}</p>
                  {record.fileUrl && (
                    <a
                      href={record.fileUrl}
                      target='_blank'
                      rel='noreferrer'
                      className='inline-block mt-2 text-cyan-300 underline'
                    >
                      Open report
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthTracker
