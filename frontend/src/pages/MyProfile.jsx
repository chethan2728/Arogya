import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyProfile = () => {

  const { userData, setUserData, token, backendUrl, loadUserProfileData } = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('')
      return
    }
    const objectUrl = URL.createObjectURL(imageFile)
    setImagePreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile])

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData()
      formData.append('name', userData.name || '')
      formData.append('phone', userData.phone || '')
      formData.append('dob', userData.dob || '')
      formData.append('gender', userData.gender || '')
      formData.append('address', JSON.stringify(userData.address || {}))
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const { data } = await axios.post(
        backendUrl + '/api/user/update-profile',
        formData,
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await loadUserProfileData()
        setImageFile(null)
        setIsEdit(false)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  return userData && (
    <div className='max-w-lg flex flex-col gap-2 text-sm soft-text'>
      
      <div className='flex items-center gap-4'>
        <img className='w-36 h-36 object-cover rounded-xl bg-sky-900/40' src={imagePreview || userData.image} alt="" />
        {isEdit && (
          <label className='aqua-outline px-4 py-2 rounded-full cursor-pointer hover:bg-cyan-400/10 transition-all'>
            Change Photo
            <input
              className='hidden'
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </label>
        )}
      </div>

      {
        isEdit
          ? <input 
  className='bg-white/70 surface-text text-3xl font-medium max-w-60 mt-4 rounded' 
  type="text" 
  value={userData.name || ''} 
  onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))} 
/>
          : <p className='font-medium text-3xl surface-text mt-4'>{userData.name}</p>
      }

      <hr className='bg-cyan-200/40 h-[1px] border-none' />
      
      <div>
        <p className='soft-text underline mt-3'>CONTACT INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 soft-text'>
          <p className='font-medium'>Email id:</p>
          <p className='text-sky-600'>{userData.email}</p>
          <p className='font-medium'>Phone:</p>
          {
            isEdit
              ? <input 
  className='bg-white/70 max-w-52 rounded surface-text' 
  type="text" 
  value={userData.phone || ''} 
  onChange={e => setUserData(prev => ({ ...prev, phone: e.target.value }))} 
/>
              : <p className='text-sky-600'>{userData.phone}</p>
          }
          {isEdit && <p className='text-xs soft-text'>Use country code (e.g., +1 or +91) for SMS reminders.</p>}
          <p className='font-medium'>Address:</p>
          {
            isEdit
              ? <input 
  className='bg-white/70 rounded surface-text' 
  onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} 
  value={userData.address?.line1 || ''} 
  type="text" 
/>
              : <p className='soft-text'>
                {userData.address.line1}
                <br />
                {userData.address.line2}
              </p>
          }
        </div>
      </div>

      <div>
        <p className='soft-text underline mt-3'>BASIC INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 soft-text'>
          <p className='font-medium'>Gender:</p>
          {
            isEdit
              ? <select className='max-w-20 bg-white/70 surface-text rounded' onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} value={userData.gender} >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              : <p className='soft-text'>{userData.gender}</p>
          }
          <p className='font-medium'>Birthday:</p>
          {
            isEdit
              ? <input className='max-w-28 bg-white/70 surface-text rounded' type="date" onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} value={userData.dob} />
              : <p className='soft-text'>{userData.dob}</p>
          }
        </div>
      </div>

      <div className='mt-10'>
        {
          isEdit
            ? <button className='aqua-outline px-8 py-2 rounded-full hover:bg-cyan-400/10 transition-all' onClick={updateUserProfileData}>Save Information</button>
            : <button className='aqua-outline px-8 py-2 rounded-full hover:bg-cyan-400/10 transition-all' onClick={() => setIsEdit(true)}>Edit</button>
        }
      </div>
    </div>
  )
}

export default MyProfile
