import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Banner = () => {

  const navigate = useNavigate()

  return (
    <div className='relative overflow-hidden flex glass-card rounded-2xl px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-10'>
      <div className='absolute -top-12 right-10 h-40 w-40 rounded-full bg-cyan-300/30 blur-3xl'></div>
      {/* ---------- Left Side ----------*/}
        <div className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5'>
            <div className='text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold surface-text futurist-title'>
                <p>Book Appointment</p>
                <p className='mt-4'>With 100+ Trusted Doctors</p>
            </div>
            <button onClick={()=>{navigate('/login'); scrollTo(0,0)}} className='aqua-button tex-sm sm:text-base text-deep px-8 py-3 rounded-full mt-6 hover:scale-105 transition'>Create Account</button>
        </div>
      {/* ---------- Right Side ---------*/}
      <div className='hidden md:block md:w-1/2 lg:w-[370px] relative'>
        <img className='w-full absolute bottom-0 right-0 max-w-md drop-shadow-[0_25px_45px_rgba(8,26,36,0.5)]' src={assets.appointment_img} alt="" />
      </div>
    </div>
  )
}

export default Banner
