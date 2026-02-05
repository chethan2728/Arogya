import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'

const Docters = () => {

  const { speciality } = useParams()

  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const navigate = useNavigate()

  const { doctors } = useContext(AppContext)

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality))
    } else {
      setFilterDoc(doctors)
    }
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality])

  return (
    <div>
      <p className='soft-text'>Browse through the doctors specialist</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <button className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-primary text-deep' : 'aqua-outline'}`} onClick={() => setShowFilter(prev => !prev)}>Filters</button>
        <div className={`flex flex-col gap-4 text-sm soft-text ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <p onClick={() => speciality === 'General physician' ? navigate('/doctors') : navigate('/doctors/General physician')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-cyan-200/30 rounded transition-all cursor-pointer ${speciality === "General physician" ? "bg-cyan-300/20 surface-text" : ""}`}>General physician</p>
          <p onClick={() => speciality === 'Gynecologist' ? navigate('/doctors') : navigate('/doctors/Gynecologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-cyan-200/30 rounded transition-all cursor-pointer ${speciality === "Gynecologist" ? "bg-cyan-300/20 surface-text" : ""}`}>Gynecologist</p>
          <p onClick={() => speciality === 'Dermatologist' ? navigate('/doctors') : navigate('/doctors/Dermatologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-cyan-200/30 rounded transition-all cursor-pointer ${speciality === "Dermatologist" ? "bg-cyan-300/20 surface-text" : ""}`}>Dermatologist</p>
          <p onClick={() => speciality === 'Pediatrician' ? navigate('/doctors') : navigate('/doctors/Pediatrician')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-cyan-200/30 rounded transition-all cursor-pointer ${speciality === "Pediatrician" ? "bg-cyan-300/20 surface-text" : ""}`}>Pediatrician</p>
          <p onClick={() => speciality === 'Neurologist' ? navigate('/doctors') : navigate('/doctors/Neurologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-cyan-200/30 rounded transition-all cursor-pointer ${speciality === "Neurologist" ? "bg-cyan-300/20 surface-text" : ""}`}>Neurologist</p>
          <p onClick={() => speciality === 'Gastroenterologist' ? navigate('/doctors') : navigate('/doctors/Gastroenterologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-cyan-200/30 rounded transition-all cursor-pointer ${speciality === "Gastroenterologist" ? "bg-cyan-300/20 surface-text" : ""}`}>Gastroenterologist</p>
        </div>
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {
            filterDoc.map((item, index) => (
              <div onClick={() => navigate(`/appointment/${item._id}`)} className='glass-card rounded-2xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
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
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Docters
