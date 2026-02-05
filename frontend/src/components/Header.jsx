import React from 'react'
import { assets } from '../assets/assets'

const Header = () => {
  return (
    <div className='relative overflow-hidden flex flex-col md:flex-row flex-wrap rounded-2xl px-6 md:px-10 lg:px-20 glass-card'>
      <div className='absolute -top-10 -left-10 w-40 h-40 rounded-full bg-cyan-300/30 blur-3xl'></div>
      <div className='absolute bottom-0 right-0 w-56 h-56 rounded-full bg-sky-400/20 blur-3xl'></div>
      
      {/* ------ Left Side ------ */}
      <div className='md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px]'>
        <p className='text-3xl md:text-4xl lg:text-5xl font-semibold surface-text leading-tight md:leading-tight lg:leading-tight futurist-title'>
            Book Appointment <br/> in a Clearer Future
        </p>
        <div className='flex flex-col md:flex-row items-center gap-3 soft-text text-sm font-light'>
            <img className='w-28' src={assets.group_profiles} alt="" />
            <p>Simply browse through our extensive list of trusted doctors,<br className='hidden sm:block'/>schedule your appointment hassle free  </p>
        </div>
        <a href="" className='flex flex-center gap-2 aqua-button px-8 py-3 rounded-full text-deep text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300'>
            book Appointment <img className='w-3' src={assets.arrow_icon} alt="" />
        </a>
      </div>

      {/* ------ Right Side ------ */}
        <div className='md:w-1/2 relative min-h-[220px]'>
          <div className='absolute right-6 top-10 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-300/60 via-sky-400/20 to-transparent blur-xl'></div>
          <div className='absolute right-12 top-16 h-36 w-36 rounded-full border border-cyan-200/40 bg-white/10 glow-ring'></div>
          <div className='absolute right-20 top-24 h-20 w-20 rounded-full border border-cyan-100/50 bg-white/10'></div>
        </div>
    </div>
  )
}

export default Header
