import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const Patients = () => {
  const { aToken, patients, getPatients } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) getPatients()
  }, [aToken])

  return (
    <div className='w-full max-w-6xl m-5 soft-text'>
      <p className='mb-3 text-lg font-medium surface-text'>Patient Records</p>
      <div className='glass-card rounded-2xl text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] py-3 px-6 border-b border-cyan-200/20'>
          <p>Name</p>
          <p>Phone</p>
          <p>Visits</p>
          <p>Records</p>
          <p>Active Plans</p>
          <p>Last Visit</p>
        </div>
        {patients.map((item) => (
          <div key={item._id} className='grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] items-center px-6 py-3 border-b border-cyan-200/20 hover:bg-cyan-300/5'>
            <p className='surface-text font-medium'>{item.name}</p>
            <p>{item.phone}</p>
            <p>{item.visitsCount}</p>
            <p>{item.recordsCount}</p>
            <p>{item.activeCarePlans}</p>
            <p>{item.lastVisit}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Patients
