import React, { useContext } from 'react'
import {AppContext} from '../context/AppContext'
import { useState } from 'react'
import axios from 'axios'
import { useEffect } from 'react'
import { toast } from "react-toastify";
import {useNavigate} from 'react-router-dom'
import { assets } from '../assets/assets'

const MyAppointments = () => {

const { backendUrl, token, getDoctorsData, doctors } = useContext(AppContext)

const [appointments,setAppointments] = useState([])
const months = ["Jan","Feb","Mar","Apr","May","jun","jul","aug","sep","oct","nov","dec"]

const navigate = useNavigate()

const slotDateFormat = (slotDate) => {
  const dateArray = slotDate.split('_')
  return dateArray[0]+ " " + months[Number(dateArray[1])] + " " + dateArray[2]
}

const getUserAppointments = async (params) => {
  try {
    const {data} = await axios.get(backendUrl+'/api/user/appointments',{headers:{token}})

    if (data.success) {
      setAppointments(data.appointments.reverse())
      console.log(data.appointments)
    }
  } catch (error) {
    console.log(error)
    toast.error(error.message)
  }
}

const cancelAppointment = async (appointmentId) => {
  try {
    const {data} = await axios.post(backendUrl + '/api/user/cancel-appointment', {appointmentId},{headers:{token}})
    if (data.success) {
      toast.success(data.message)
      getUserAppointments()
      getDoctorsData()
    } else {
      toast.error(data.message)
    }
  } catch (error) {
    console.log(error)
    toast.error(error.message)
  }
}

const initPay = (order) => {
  const options = {
    key:import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency:order.currency,
    name:'Appointment Payment',
    description:'Appointment Payment',
    order_id:order.id,
    reciept: order.reciept,
    handler: async (response) => {
      console.log(response)


      try {
        const {data} = await axios.post(backendUrl+'/api/user/verifyRazorpay',response,{headers:{token}}) 
        if (data.success) {
          getUserAppointments()
          navigate('/my-appointments')
        }
      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
    }
  }

  const rzp = new window.Razorpay(options)
  rzp.open()
}

const appointmentRazorpay = async (appointmentId) => {
  try {
    const {data} = await axios.post(backendUrl+'/api/user/payment-razorpay',{appointmentId},{headers:{token}})


    if (data.success) {
      
      initPay(data.order)
    }
  } catch (error) {
    
  }

}

useEffect(()=>{
  if (token) {
    getUserAppointments()
  }
},[token])

  return (
    <div>
      <p className='pb-3 mt-12 font-medium surface-text border-b border-cyan-200/30'>My appointments</p>
      <div>
        {appointments.map((item,index)=>(
          <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b border-cyan-200/20' key={index}>
            <div>
              <img
                className='w-32 bg-sky-900/40 rounded-xl'
                src={doctors.find(doc => doc._id === item.docId)?.image || assets.profile_pic}
                alt=""
              />
            </div>
            <div className='flex-1 text-sm soft-text'>
            <p className='surface-text font-semibold'>{item.docData.name}</p>
            <p>{item.docData.speciality}</p>
            <p className='surface-text font-medium mt-1'>Address:</p>
            <p className='text-xs'>{item.docData.address.line1}</p>
            <p className='text-xs'>{item.docData.address.line2}</p>
            <p className='text-xs mt-1'><span className='text-sm surface-text font-medium'>Date & Time:</span>{slotDateFormat(item.slotDate)} | {item.slotTime}</p>
            </div>
            <div></div>
            <div className='flex flex-col gap-2 justify-end'>
              {!item.cancelled && item.payment && !item.isCompleted && <button className='sm:min-w-448 py-2 border rounded soft-text bg-cyan-300/10'>Paid</button>}
              {!item.cancelled && !item.payment && !item.isCompleted && <button onClick={()=>appointmentRazorpay(item._id)} className='text-sm soft-text text-center sm:min-w-48 py-2 border border-cyan-200/40 hover:bg-cyan-400/10 transition-all duration-300'>Pay Online</button>}
              {!item.cancelled && !item.isCompleted && <button onClick={()=>cancelAppointment(item._id)} className='text-sm soft-text text-center sm:min-w-48 py-2 border border-cyan-200/40 hover:bg-cyan-400/10 transition-all duration-300'>Cancel appointment</button>}
              {item.cancelled && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-rose-400/60 rounded text-rose-300'>Appointment cancelled</button>}
              {item.isCompleted && <button className='sm:min-w-48 py-2 border rounded text-emerald-300 bg-emerald-400/10'>Appointment completed</button>}
            </div>
            </div> 

        ))}
      </div>
    </div>
  )
}

export default MyAppointments
