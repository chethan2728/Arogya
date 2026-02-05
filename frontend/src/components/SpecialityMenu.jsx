import React from 'react'
import { specialityData } from '../assets/assets'
import { Link } from 'react-router-dom'

const SpecialityMenu = () => {
  return (
    <div className='flex flex-col items-center gap-4 py-16 surface-text' id='speciality'>
      <h1 className='text-3xl font-medium futurist-title'>
        Find by Speciality
      </h1>
      <p className='sm:w-1/3 text-center text-sm soft-text'>Simply browse through our extensive list of trusted doctors, schedule your appoint hassle-free</p>
      <div className='flex sm:justify-center gap-4 pt-5 w-full overflow-scroll'>
        {specialityData.map((item,index) => (
            <Link onClick={()=>scrollTo(0,0)} className='flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500 glass-card px-4 py-5 rounded-2xl min-w-[120px]' key={index} to={`/docters/${item.speciality}`}>
                <img className='w-16 sm:w-24 mb-2 drop-shadow' src={item.image} alt="" />
                <p className='surface-text'>{item.speciality}</p>
            </Link>
        ))}
      </div>
    </div>
  )
}

export default SpecialityMenu
