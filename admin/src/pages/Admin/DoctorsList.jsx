import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {

  const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminContext)

    useEffect(() => {
      if (aToken) {
        getAllDoctors()
      }
    }, [aToken])

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll soft-text'>
      <h1 className='text-lg font-medium surface-text'>All Doctors</h1>
      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {
          doctors.map((item, index) => (
            <div className='glass-card rounded-2xl max-w-56 overflow-hidden cursor-pointer group p-4' key={index}>
              <div className='w-16 h-16 rounded-full bg-cyan-100/60 mb-3 flex items-center justify-center text-lg font-semibold text-slate-700'>
                {item.name?.slice(0,1)}
              </div>
              <p className='surface-text text-lg font-medium'>{item.name}</p>
              <p className='soft-text text-sm'>{item.email}</p>
              <p>{item.speciality}</p>
              <div className='mt-2 flex items-center gap-1 text-sm'>
                <input onChange={() => changeAvailability(item._id)} type="checkbox" checked={item.available} />
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default DoctorsList
