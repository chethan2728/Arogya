import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 soft-text'>
        <p>CONTACT <span className='surface-text font-semibold'>US</span> </p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm soft-text'>
        <img className='w-full md:max-w-[360px]' src={assets.contact_image} alt="" />

        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-lg surface-text'>Our OFFICE</p>
          <p>1st and second shop 1st floor <br /> near cbs bank geddalahalli <br /> kothanur post bengaluru 560077</p>
          <p className='font-bold'>Contact No:9980550913 <br /> <span className='font-bold'>Email: nchethan250@gmail.com</span></p>
          <p className='font-semibold text-lg surface-text'>Careers at AROGYA</p>
          <p>lEARN MORE ABOUT US</p>
          <button className='aqua-outline px-8 py-4 text-sm hover:bg-cyan-400/10 transiton-all duration-500'>Explore</button>
        </div>
      </div>
    </div>
  )
}

export default Contact
