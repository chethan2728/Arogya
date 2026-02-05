import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'

const Appointment = () => {

  const {docId} = useParams()
  const {doctors, currencySymbol, backendUrl, token, getDoctorsData} = useContext(AppContext)
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const navigate = useNavigate()

  const [docInfo,setDocInfo] = useState(null)
  const [docSlots,setDocSlots] = useState([])
  const [slotIndex,setSlotIndex] = useState(0)
  const [slotTime,setSlotTime] = useState('')

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
    console.log(docInfo)
  }

  const getAvailableSlots = async () => {
    if (!docInfo || !docInfo.slots_booked) {
        return;
    }
    setDocSlots([])

    let today = new Date()

    for(let i = 0; i < 7; i++){
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      let endTime = new Date()
      endTime.setDate(today.getDate()  + i)
      endTime.setHours(21, 0, 0, 0)

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      }else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots = []

      while(currentDate < endTime) {
  let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  let day = currentDate.getDate()
  let month = currentDate.getMonth() + 1
  let year = currentDate.getFullYear()

  const slotDate = day + "_" + month + "_" + year
  const slotTime = formattedTime

  // Check if the slot is already booked in the database
  const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true

  if (isSlotAvailable) {
    timeSlots.push({
      datetime: new Date(currentDate),
      time: formattedTime
    })
  }

  currentDate.setMinutes(currentDate.getMinutes() + 30)
}

      setDocSlots(prev => ([...prev, timeSlots]))
    }
  }

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book appointment')
      return navigate('/Login')
    }

    try {
      
      const date = docSlots[slotIndex][0].datetime

      let day = date.getDate()
      let month = date.getMonth()+1
      let year = date.getFullYear()

      const slotDate = day + "_" + month +"_" + year

      const { data } = await axios.post(backendUrl + '/api/user/book-appointment', {docId, slotDate, slotTime}, {headers:{token}})
      if (data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      }else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    fetchDocInfo()
  },[doctors,docId])

  useEffect(()=>{
    getAvailableSlots()
  },[docInfo])

  useEffect(()=>{
    console.log(docSlots)
  },[docSlots])
 
  return docInfo &&(
    <div>
      {/* ------Doctors Details-------*/ }
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-sky-900/40 w-full sm:max-w-72 rounded-2xl' src={(docInfo.image && docInfo.image.trim()) ? docInfo.image : assets.profile_pic} alt="" />
        </div>
        <div className='flex-1 glass-card rounded-2xl p-8 py-7 mx-2 sm:mx-0  mt-[-80px] sm:mt-0'>
          {/* ------Doc Info : name, degree, experience------ */}
          <p className='flex items-center gap-2 text-2xl font-medium surface-text'>{docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 soft-text'>
            <p>
              {docInfo.degree} - {docInfo.speciality}
            </p>
            <button className='py-0.5 px-2 border border-cyan-200/40 text-xs rounded-full surface-text'>{docInfo.experience}</button>
          </div>

          {/* -------Doctors About-------- */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium surface-text mt-3'>About <img src={assets.info_icon} alt="" /></p>
            <p className='text-sm soft-text max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='soft-text font-medium mt-4'>
            Appointment fee: <span className='surface-text'>{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* -------Booking Slots--------- */}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium soft-text'>
        <p>Booking slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length && docSlots.map((item,index)=>(
              <div onClick={()=> setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-deep' : 'border border-cyan-200/40 soft-text'}`} key={index}>
               <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
               <p>{item[0] && item[0].datetime.getDate()}</p> 
              </div>
            ))
          }
        </div>

        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSlots.length && docSlots[slotIndex].map((item,index)=>(
            <p onClick={()=>setSlotTime(item.time)} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-deep' : 'soft-text border border-cyan-200/40' }`} key={index}>
              {item.time.toLowerCase()}
            </p>
          ))}
        </div>
        <button onClick={bookAppointment} className='aqua-button text-deep text-sm font-light px-14 py-3 rounded-full my-6'>Book Appointment</button>
      </div>

      {/*Listing related doctors */}

      <RelatedDoctors docId={docId} speciality={docInfo.speciality} /> 
    </div>
  )
}

export default Appointment
