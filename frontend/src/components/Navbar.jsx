import React, { useContext, useEffect } from 'react'
import {assets} from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext';

const NavBar = () => {

  const navigate = useNavigate();

  const { token, setToken, userData } = useContext(AppContext)
  const [showMenu, setShowMenu] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);


  const logout = () => {
    setToken(false)
    localStorage.removeItem('token')
  }

  useEffect(() => {
    const onDocClick = () => setShowProfileMenu(false)
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-cyan-200/40">
      <img onClick={()=>navigate('/')} className='w-44 cursor-pointer' src={assets.logo} alt="" />
      <ul className='hidden md:flex items-start gap-5 font-medium text-slate-800'>
        <NavLink to='/'>
          <li className='py-1'>HOME</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
        </NavLink>

        <NavLink to='/docters'>
          <li className='py-1'>ALL DOCTERS</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
        </NavLink>

        <NavLink to='/about'>
          <li className='py-1'>ABOUT</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
        </NavLink>

        <NavLink to='/contact'>
          <li className='py-1'>CONTACT</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
        </NavLink>
      </ul>
      <div className='flex items-center gap-4'>
        {
          token && userData
          ? <div className='flex items-center gap-2 cursor-pointer relative' onClick={(e) => { e.stopPropagation(); setShowProfileMenu(prev => !prev) }}>
            <img className='w-8 rounded-full' src={userData.image} alt="" />
            <img className='w-2.5' src={assets.dropdown_icon} alt="" />
            {showProfileMenu && (
              <div className='absolute top-10 right-0 pt-4 text-base font-medium text-slate-700 z-20'>
                <div className='min-w-48 glass-card rounded flex flex-col gap-4 p-4'>
                  <p onClick={()=>{navigate('my-profile'); setShowProfileMenu(false)}} className='hover:text-slate-900 cursor-pointer'>My Profile</p>
                  <p onClick={()=>{navigate('my-appointments'); setShowProfileMenu(false)}} className='hover:text-slate-900 cursor-pointer'>My Appointment</p>
                  <p onClick={()=>{navigate('health-tracker'); setShowProfileMenu(false)}} className='hover:text-slate-900 cursor-pointer'>Health Tracker</p>
                  <p onClick={()=>{logout(); setShowProfileMenu(false)}} className='hover:text-slate-900 cursor-pointer'>Logout</p>
                </div>
              </div>
            )}
          </div>
          :<button onClick={()=>navigate('/login')} className='aqua-button text-deep px-8 py-3 rounded-full font-light hidden room md:block'>Create Account</button>
        }
        <img onClick={()=>setShowMenu(true)} className='w-6 md:hidden' src={assets.menu_icon} alt="" />
        {/*Mobile Mwnu */}
        <div className={` ${showMenu ? 'fixed w-full' : 'h-0 w-0'} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
          <div className='flex items-center justify-between px-5 py-6'>
            <img className='w-36' src={assets.logo} alt="" />
            <img className='w-7' onClick={()=>setShowMenu(false)} src={assets.cross_icon} alt="" />
          </div>
          <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium text-slate-800'>
            <NavLink  onClick={()=>setShowMenu(false)} to='/'><p className='px-4 py-2 rounded inline-block'>Home</p></NavLink>
            <NavLink  onClick={()=>setShowMenu(false)} to='/docters'><p className='px-4 py-2 rounded inline-block'>All Doctors</p></NavLink>
            <NavLink  onClick={()=>setShowMenu(false)} to='/about'><p className='px-4 py-2 rounded inline-block'>About</p></NavLink>
            <NavLink  onClick={()=>setShowMenu(false)} to='/contact'><p className='px-4 py-2 rounded inline-block'>Contact</p></NavLink>
            <NavLink  onClick={()=>setShowMenu(false)} to='/health-tracker'><p className='px-4 py-2 rounded inline-block'>Health Tracker</p></NavLink>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NavBar
