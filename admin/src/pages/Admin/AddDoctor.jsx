import React, { useState, useContext } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const AddDoctor = () => {
    // State variables
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [experience, setExperience] = useState('1 Year')
    const [fees, setFees] = useState('')
    const [speciality, setSpeciality] = useState('General physician')
    const [education, setEducation] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')
    const [about, setAbout] = useState('')

    const { backendUrl, aToken } = useContext(AdminContext);

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {
            // Data Transformation to prevent "Cast to Number" and "Cast to String" errors
            const doctorData = {
                name,
                email,
                password,
                experience: Number(experience.split(' ')[0]),
                fees: Number(fees),
                speciality,
                degree: education,
                about,
                address1,
                address2
            }

            const { data } = await axios.post(
                backendUrl + '/api/admin/add-doctor',
                doctorData,
                { headers: { aToken } }
            )

            if (data.success) {
                toast.success(data.message)
                // Clear Form
                setName(''); setEmail(''); setPassword('');
                setFees(''); setEducation(''); setAddress1('');
                setAddress2(''); setAbout('');
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
            console.error(error)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full soft-text'>
            <p className='mb-3 text-lg font-medium surface-text futurist-title'>Add Doctor</p>

            <div className='glass-card px-8 py-8 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
                <div className='flex flex-col lg:flex-row items-start gap-10'>
                    
                    {/* Left Column */}
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Doctor Name</p>
                            <input onChange={(e) => setName(e.target.value)} value={name} className='border border-cyan-200/40 rounded px-3 py-2 bg-white/70 surface-text' type="text" placeholder='Name' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Doctor Email</p>
                            <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-cyan-200/40 rounded px-3 py-2 bg-white/70 surface-text' type="email" placeholder='Email' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Doctor Password</p>
                            <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-cyan-200/40 rounded px-3 py-2 bg-white/70 surface-text' type="password" placeholder='Password' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Experience</p>
                            <select onChange={(e) => setExperience(e.target.value)} value={experience} className='border border-cyan-200/40 rounded px-3 py-2 bg-white/70 surface-text'>
                                <option value="1 Year">1 Year</option>
                                <option value="2 Years">2 Years</option>
                                <option value="3 Years">3 Years</option>
                                <option value="4 Years">3 Years</option>
                                <option value="5 Years">5 Years</option>
                                <option value="8 Years">8 Years</option>
                                <option value="10 Years">10+ Years</option>
                            </select>
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Fees</p>
                            <input onChange={(e) => setFees(e.target.value)} value={fees} className='border border-cyan-200/40 rounded px-3 py-2 bg-white/70 surface-text' type="number" placeholder='Fees' required />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Speciality</p>
                            <select onChange={(e) => setSpeciality(e.target.value)} value={speciality} className='border border-cyan-200/40 rounded px-3 py-2 bg-white/70 surface-text'>
                                <option value="General physician">General physician</option>
                                <option value="Gynecologist">Gynecologist</option>
                                <option value="Neurologist">Neurologist</option>
                                <option value="Pediatrician">Pediatrician</option>
                                <option value="Dermatologist">Dermatologist</option>
                                <option value="Gastroenterologist">Gastroenterologist</option>
                            </select>
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Education</p>
                            <input onChange={(e) => setEducation(e.target.value)} value={education} className='border border-cyan-200/40 rounded px-3 py-2 bg-white/70 surface-text' type="text" placeholder='Education/Degree' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Address</p>
                            <input onChange={(e) => setAddress1(e.target.value)} value={address1} className='border border-cyan-200/40 rounded px-3 py-2 bg-white/70 surface-text' type="text" placeholder='Address 1' required />
                            <input onChange={(e) => setAddress2(e.target.value)} value={address2} className='border border-cyan-200/40 rounded px-3 py-2 mt-2 bg-white/70 surface-text' type="text" placeholder='Address 2' required />
                        </div>
                    </div>
                </div>

                <div>
                    <p className='mt-4 mb-2'>About Doctor</p>
                    <textarea onChange={(e) => setAbout(e.target.value)} value={about} className='w-full px-4 pt-2 border border-cyan-200/40 rounded bg-white/70 surface-text' placeholder='Write about doctor...' rows={6} required />
                </div>

                <button type='submit' className='aqua-button px-10 py-3 mt-4 text-deep rounded-full'>Add Doctor</button>
            </div>
        </form>
    )
}

export default AddDoctor
