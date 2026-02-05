import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'

const Navbar = () => {

  const { aToken, setAtoken } = useContext(AdminContext)
  const { dToken, setDToken } = useContext(DoctorContext)

  const navigate = useNavigate()

  const logout = () => {
    navigate('/')
    aToken && setAtoken('')
    aToken && localStorage.removeItem('aToken')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
  }
  return (
    <div className='flex justify-between item-center px-4 sm:px-10 py-3 border-b border-cyan-200/40 glass-card'>
      <div className='flex items-center gap-2 text-xs'>
        <div className="w-24 sm:w-28 ">
          <img
            className="w-full h-full cursor-pointer "
            src={assets.admin_logo}
            alt="Admin Logo"
          />
        </div>        <p className='border px-2.5 py-0.5 rounded-full border-cyan-200/40 soft-text'>{aToken ? 'Admin' : 'Doctor'} </p>
      </div>
      <button onClick={logout} className='aqua-button text-deep text-sm px-10 py-2 rounded-full'>Logout</button>
    </div>
  )
}

export default Navbar
