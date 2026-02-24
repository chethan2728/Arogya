import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Docters from "./pages/Docters";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./pages/MyProfile";
import MyAppointments from "./pages/MyAppointments";
import Appointment from "./pages/Appointment";
import HealthTracker from "./pages/HealthTracker";
import NavBar from "./components/Navbar";
import Footer from "./components/Footer";
import AiAssistant from "./components/AiAssistant";
import IntroSplash from "./components/IntroSplash";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const App = () => {
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 1600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="mx-4 sm:mx-[10%] min-h-screen text-slate-900 relative scene-3d">
      <div className="backdrop-grid"></div>
      <div className="fixed left-[-120px] top-24 w-72 h-72 rounded-full bg-cyan-300/20 blur-3xl orb-float pointer-events-none -z-10"></div>
      <div className="fixed right-[-90px] bottom-24 w-72 h-72 rounded-full bg-sky-400/20 blur-3xl orb-float pointer-events-none -z-10"></div>
      {showIntro && <IntroSplash />}
      <ToastContainer />
      <NavBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/docters' element={<Docters />} />
        <Route path='/docters/:speciality' element={<Docters />} />
        <Route path='/doctors' element={<Docters />} />
        <Route path='/doctors/:speciality' element={<Docters />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/my-profile' element={<MyProfile />} />
        <Route path='/my-appointments' element={<MyAppointments />} />
        <Route path='/health-tracker' element={<HealthTracker />} />
        <Route path='/appointment/:docId' element={<Appointment />} />
      </Routes>
      <AiAssistant />
      <Footer />
    </div>
  )
}

export default App;
