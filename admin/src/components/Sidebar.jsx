import React, { useContext } from 'react' // Added { useContext }
import { AdminContext } from '../context/AdminContext'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'

const Sidebar = () => {

    const { aToken } = useContext(AdminContext)
    const {dToken} = useContext(DoctorContext)

    return (
        <div className='min-h-screen glass-card border-r border-cyan-200/30'>
            {
                aToken && <ul className='soft-text mt-5'>
                    <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-cyan-300/10 border-r-4 border-primary surface-text' : ''}`} to={'/admin-dashboard'}>
                        <img src={assets.home_icon} alt="" />
                        <p className='hidden md:block'>Dashboard</p>
                    </NavLink>

                    <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-cyan-300/10 border-r-4 border-primary surface-text' : ''}`} to={'/all-apointment'}>
                        <img src={assets.appointment_icon} alt="" />
                        <p className='hidden md:block'>Appointments</p>
                    </NavLink>

                    <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-cyan-300/10 border-r-4 border-primary surface-text' : ''}`} to={'/add-doctor'}>
                        <img src={assets.add_icon} alt="" />
                        <p className='hidden md:block'>Add Doctor</p>
                    </NavLink>

                    <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-cyan-300/10 border-r-4 border-primary surface-text' : ''}`} to={'/doctors-list'}>
                        <img src={assets.people_icon} alt="" />
                        <p className='hidden md:block'>Doctors List</p>
                    </NavLink>

                    <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-cyan-300/10 border-r-4 border-primary surface-text' : ''}`} to={'/patients'}>
                        <img src={assets.patients_icon} alt="" />
                        <p className='hidden md:block'>Patients</p>
                    </NavLink>
                </ul>
            }
            {
                dToken && <ul className='soft-text mt-5'>
                    <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-cyan-300/10 border-r-4 border-primary surface-text' : ''}`} to={'/doctor-dashboard'}>
                        <img src={assets.home_icon} alt="" />
                        <p className='hidden md:block'>Dashboard</p>
                    </NavLink>

                    <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-cyan-300/10 border-r-4 border-primary surface-text' : ''}`} to={'/doctor-appointments'}>
                        <img src={assets.appointment_icon} alt="" />
                        <p className='hidden md:block'>Appointments</p>
                    </NavLink>

                    <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-cyan-300/10 border-r-4 border-primary surface-text' : ''}`} to={'/doctor-profile'}>
                        <img src={assets.people_icon} alt="" />
                        <p className='hidden md:block'>Profile</p>
                    </NavLink>
                </ul>
            }
        </div>
    )
}

export default Sidebar
