import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom"
import Aouth from '../component/Aouth'
import { useDispatch, useSelector } from 'react-redux'
import { signInStart, signInFailure, signUpSuccess } from "../redux/user/userSlice"

export default function signup() {
    const [formData, setFormData] = useState({ username: "", email: "", password: "" })

    const { loading, error } = useSelector((state) => state.user)

    // const [loading, setLoading] = useState(false)
    // const [error, setError] = useState(null);
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        })

        console.log(formData)
    }
    // console.log(Object.keys(formData))

    const handleSubmit = async (e) => {
        e.preventDefault();

        // handle to fill all boxess
        for (const x of Object.keys(formData)) {
            if (!formData[x]) {
                dispatch(signInFailure("fill all boxes"))
                return
            }
        }

        try {
            dispatch(signInStart())

            const res = await fetch("https://ozone-website-inky.vercel.app/api/auth/signup", {
                credentials: "include",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            // console.log(data)
            if (data.success == false) {
                // setLoading(false)
                // setError(data.message)
                dispatch(signInFailure(data.message))
                return;
            }
            // setLoading(false)
            // setError(null)
            dispatch(signUpSuccess())
            navigate("/signin")
        } catch (error) {
            // setLoading(false)
            // setError(error.message)
            dispatch(signInFailure(error.message))

        }


    }
    return (
        <div className='p-3 max-w-lg mx-auto '>
            <h1 className='text-3xl text-center font-semibold my-7'>Signup</h1>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <input className='p-3 border rounded-lg'
                    type="text" placeholder='Username' id='username' onChange={handleChange} />
                <input className='p-3 border rounded-lg'
                    type="text" placeholder='Email' id='email' onChange={handleChange} />
                <input className='p-3 border rounded-lg'
                    type="text" placeholder='Password' id='password' onChange={handleChange} />
                <button disabled={loading} className='p-3 bg-slate-700 text-slate-100 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
                >{loading ? 'loading...' : "signup"}</button>
                <Aouth />
            </form>
            <div className='flex gap-2 mt-5'>
                <p>already have account?</p>
                <Link to="/signin">
                    <span className='text-blue-500'>signin</span>
                </Link>
            </div>
            {error && <p className='text-red-600'>{error}</p>}
        </div>
    )
}
