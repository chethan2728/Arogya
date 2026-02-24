import React from 'react'
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

const TopDoctors = () => {

  const navigate = useNavigate();
  const {doctors} = useContext(AppContext)


  return (
    <div className='flex flex-col item-center gap-4 my-16 surface-text md:mx-10 scene-3d'>
      <h1 className='text-3xl font-medium futurist-title'>Top Doctors to Book</h1>
      <p className='sm:w-1/3 text-center text-sm soft-text'>Simply browse through our extensive list of trusted doctors.</p>
      <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
        {doctors.slice(0,10).map((item,index)=>(
            <div onClick={()=>navigate(`/appointment/${item._id}`)} className='glass-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 tilt-card' key={index}>
                <img className='bg-sky-900/40' src={(item.image && item.image.trim()) ? item.image : assets.profile_pic} alt="" />
                <div className='p-4'>
                    <div className={`flex items-center gap-2 text-sm text-center ${item.available ? "text-emerald-500" : "text-rose-500"}`}>
                    <p className={`w-2 h-2 ${item.available ? "bg-emerald-500" : "bg-rose-500"} rounded-full`}></p>
                    <p></p><p>{item.available ? "Available" : "Not Available"}</p>
                    </div>
                    <p className='surface-text text-lg font-medium'>{item.name}</p>
                    <p className='soft-text text-sm'>{item.speciality}</p>
                </div>
            </div>
        ))}
      </div>
      <button onClick={()=>{navigate('/doctors'); scrollTo(0,0) }} className='aqua-outline px-12 py-3 rounded-full mt-10 hover:bg-cyan-400/10 transition'>more</button>
    </div>
  )
}

export default TopDoctors
