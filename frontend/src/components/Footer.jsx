import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        {/*-----left section ----- */}
        <div>
            <img className='mb-1 w-48' src={assets.logo} alt="" />
            <p className='w-full md:w-2/3 text-gray-600 leading-6'>At CareXpert, we believe that expert care should be accessible, reliable, and built on trust. Our mission is to provide solutions that simplify your life while ensuring quality and support you can count on every step of the way.</p>
        </div>

        {/*----center section ----- */}
        <div>
            <p className='text-xl font-medium mb-5'>Company</p>
            <ul className='flex flex-col gap-2 text-gray-600'>
                <li>Home</li>
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
            </ul>
      </div>

        {/*-----left section ----- */}
        <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-2 text-gray-600'>
                <li>9980550913</li>
                <li>nchethan250@gmail.com</li>
            </ul>
        </div>
      </div>
      {/* -------Copyright text --------- */}
      <div>
        <hr/>
        <p className='py-5 text-sm text-center'>Copyright 2025@ CareXpert - All Right Reserved</p>
      </div>
    </div>
  )
}

export default Footer
