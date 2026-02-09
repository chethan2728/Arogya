import { createContext, use, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { doctorImages } from "../assets/assets";

export const AppContext = createContext()

const AppContextProvider = (props) => {


    const currencySymbol = '₹'
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [doctors, setDoctors] = useState([])

    const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token') : false)
    const [userData, setUserData] = useState(null)


    const mapDoctorsWithAssets = (docs) => {
        return docs.map((doc, index) => ({
            ...doc,
            image: (doc.image && doc.image.trim()) ? doc.image : doctorImages[index % doctorImages.length],
        }))
    }

    const getDoctorsData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/doctor/list')
            if(data.success){
                setDoctors(mapDoctorsWithAssets(data.doctors))
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

        const loadUserProfileData = async() => {
            try {
                const {data} = await axios.post(backendUrl + '/api/user/get-profile',{},{ headers:{token}})
                if (data.success) {
                    setUserData(data.data)
                } else {
                    toast.error(data.message)
                }
            } catch (error) {
                console.log(error)
                toast.error(error.message) 
            }
        }

        const value = {
        doctors,getDoctorsData,
        currencySymbol,
        token,
        setToken,
        backendUrl,
        userData,
        setUserData,
        loadUserProfileData
    }

    useEffect(() => {
        getDoctorsData()
    }, [])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
        } else {
            setUserData(false)
        }
    }
    , [token])

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>

    )
}

export default AppContextProvider
