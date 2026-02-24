import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const Header = () => {
  const navigate = useNavigate()
  const letters = ['A', 'R', 'O', 'G', 'Y', 'A']

  return (
    <div className='relative overflow-hidden flex flex-col md:flex-row flex-wrap rounded-3xl px-6 md:px-12 lg:px-20 glass-card min-h-[68vh] md:min-h-[72vh]'>
      <div className='absolute -top-12 -left-12 w-44 h-44 rounded-full bg-cyan-300/20 blur-3xl orb-float'></div>
      <div className='absolute bottom-0 right-0 w-64 h-64 rounded-full bg-sky-400/15 blur-3xl orb-float'></div>
      <div className='absolute inset-0 pointer-events-none hero-noise'></div>
      
      {/* ------ Left Side ------ */}
      <div className='md:w-1/2 flex flex-col items-start justify-center gap-6 py-10 m-auto md:py-[10vw] z-10'>
        <span className='lead-pill'>Trusted Digital Healthcare</span>
        <p className='text-3xl md:text-5xl lg:text-6xl font-semibold leading-tight md:leading-tight lg:leading-tight futurist-title hero-gradient-text max-w-[12ch]'>
            Better Care Starts Here
        </p>
        <p className='soft-text text-sm md:text-base max-w-[52ch]'>
          Book appointments in minutes, get guided symptom support, and manage your health journey from one clean dashboard.
        </p>
        <div className='flex flex-wrap gap-3'>
          <button onClick={() => navigate('/doctors')} className='aqua-button px-8 py-3 rounded-full text-deep text-sm hover:scale-105 transition-all duration-300'>
            Find Doctors
          </button>
          <button onClick={() => navigate('/health-tracker')} className='aqua-outline px-8 py-3 rounded-full text-sm hover:bg-cyan-400/10 transition-all duration-300'>
            Open Health Tracker
          </button>
        </div>
        <div className='flex items-center gap-3 soft-text text-sm font-light'>
            <img className='w-28' src={assets.group_profiles} alt="" />
            <p>50+ active doctors • secure payments • AI assisted booking</p>
        </div>
      </div>

      {/* ------ Right Side ------ */}
        <div className='md:w-1/2 relative min-h-[260px] flex items-center justify-center z-10 pt-4 md:pt-0'>
          <div className='alphabet-wall'>
            {letters.map((letter, idx) => (
              <div
                key={letter + idx}
                className='alpha-cube'
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                {letter}
              </div>
            ))}
          </div>
          <div className='absolute -bottom-3 left-1/2 -translate-x-1/2 grid grid-cols-3 gap-2 md:gap-3'>
            <div className='hero-metric'>24/7 Support</div>
            <div className='hero-metric'>AI Triage</div>
            <div className='hero-metric'>Fast Booking</div>
          </div>
        </div>
    </div>
  )
}

export default Header
