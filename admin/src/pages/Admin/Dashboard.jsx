import React from 'react'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { useEffect } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const Dashboard = () => {

  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext)

  const { slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getDashData()
    }
  }, [aToken])

  return dashData && (
    <div className='m-5 soft-text'>
      <div className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2 glass-card p-4 min-w-52 rounded-2xl cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.doctor_icon} alt="" />
          <div>
            <p className='text-xl font-semibold surface-text'>{dashData.doctors}</p>
            <p className='soft-text'>Doctors</p>
          </div>
        </div>

        <div className='flex items-center gap-2 glass-card p-4 min-w-52 rounded-2xl cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold surface-text'>{dashData.appointments}</p>
            <p className='soft-text'>Appointments</p>
          </div>
        </div>

        <div className='flex items-center gap-2 glass-card p-4 min-w-52 rounded-2xl cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.patients_icon} alt="" />
          <div>
            <p className='text-xl font-semibold surface-text'>{dashData.patients}</p>
            <p className='soft-text'>Patients</p>
          </div>
        </div>
      </div>

      <div className='glass-card rounded-2xl mt-10'>
        <div className='flex item-center gap-2.5 px-4 py-4 rounded-t border-b border-cyan-200/10'>
          <img src={assets.list_icon} alt="" />
          <p className='font-semibold surface-text'>Latest Bookings</p>
        </div>

        <div className='pt-4'>
          {
            dashData.latestAppointments.map((item, index) => (
              <div className='flex items-center px-6 py-3 gap-3 hover:bg-cyan-300/5' key={index}>
                <img className='rounded-full w-10 bg-sky-900/40' src={item.docData.image} alt="" />
                <div className='flex-1 text-sm'>
                  <p className='surface-text font-medium'>{item.docData.name}</p>
                  <p className='soft-text'>{slotDateFormat(item.slotDate)}</p>
                </div>
                {
                  item.cancelled
                    ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                    : item.isCompleted
                      ? <p className='text-green-400 text-xs font-medium'>Completed</p> : <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                }
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Dashboard
