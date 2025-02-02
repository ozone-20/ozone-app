import { Route, Routes, BrowserRouter } from "react-router-dom"
import Home from "./pages/Home.jsx"
import Signin from "./pages/Signin.jsx"
import Signout from "./pages/Signout.jsx"
import Signup from "./pages/signup.jsx"
import Profile from "./pages/profile.jsx"
import About from "./pages/About.jsx"
import Header from "./component/Header.jsx"
import PrivateRoute from "./component/privateRoute.jsx"

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route element={<PrivateRoute />} >
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter >
  )
}
