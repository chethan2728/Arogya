import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Docters from "./pages/Docters";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./pages/MyProfile";
import MyAppointments from "./pages/MyAppointments";
import Appointment from "./pages/Appointment";
import NavBar from "./components/Navbar";
import Footer from "./components/Footer";



const App = () => {
  return (
    <div className="mx-4 sm:mx-[10%]">
      <NavBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/docters' element={<Docters />} />
        <Route path='/docters/:speciality' element={<Docters />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/my-profile' element={<MyProfile />} />
        <Route path='/my-appointments' element={<MyAppointments />} />
        <Route path='/appointment/:docId' element={<Appointment />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App;