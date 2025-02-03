import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { supabase } from '../supabase.js'
import {
    updateUserStart,
    updateUserSuccess,
    updateUserFailure,
    deleteUserStart,
    deleteUserSuccess,
    deleteUserFailure,
    signOutUserStart,
    signOutUserSuccess,
    signOutUserFailure
} from "../redux/user/userSlice"
// import { Auth } from '@supabase/auth-ui-react'
// import { ThemeSupa } from "@supabase/auth-ui-shared"

export default function profile() {
    const { currentUser, loading, error } = useSelector((state) => state.user); // for current user
    const dispatch = useDispatch()

    // dispatch(errorNull())

    const fileRef = useRef();
    const [file, setFile] = useState(undefined);
    const [fileLoading, setFileloading] = useState(false);
    const [formData, setFormData] = useState({});
    const [faild, setFaild] = useState(false)
    const [updateSuccess, setUpdateSuccess] = useState(false)

    let exitt = false
    // const [exitt, setExitt] = useState(false)

    // undefined
    // console.log(file)


    useEffect(() => {
        if (file) {
            handleFileUpload()
        }
    }, [file])

    const handleFileUpload = async () => {

        try {
            const filepath = `${new Date().getTime()}.${file.name.split(".").pop()}`
            setFileloading(true);
            setFaild(false);
            exitt = false;

            await supabase.storage
                .from("ozoneBucket")
                .upload(filepath, file)
                .then((res) => {
                    // console.log(res
                    try {
                        if (res.error.statusCode == 413) {
                            setFileloading(false);
                            setFaild(true);
                            exitt = true;
                        }
                    } catch (error) {
                    }
                })
            // console.log(exitt, faild, loading)
            if (exitt) {
                return
            }

            let { data: url } = await supabase.storage
                .from("ozoneBucket")
                .getPublicUrl(filepath)

            setFileloading(false)

            // setAvatar(url.publicUrl)

            setFormData({ ...formData, avatar: url.publicUrl })
            // console.log(`eslam  ${url.publicUrl}`)
        } catch (error) {
            setFileloading(false)
            setFaild(true)
            console.error(`upload faild \n${error}`)
        }
        // console.log(url.publicUrl)
    }

    const handleChange = async (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            dispatch(updateUserStart())

            const res = await fetch(`https://ozone-website-inky.vercel.app/api/user/update/${currentUser._id}`, {
                credentials: "include",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (data.success == false) {

                dispatch(updateUserFailure(data.message))
                return;
            }

            dispatch(updateUserSuccess(data))
            setUpdateSuccess(true)
        } catch (error) {
            dispatch(updateUserFailure(error.message))
        }
    }

    const handleDelete = async () => {
        try {
            dispatch(deleteUserStart())

            const res = await fetch(`https://ozone-website-inky.vercel.app/api/user/delete/${currentUser._id}`, {
                credentials: "include",
                method: 'DELETE',
            })

            const data = await res.json()

            if (data.success === false) {
                dispatch(deleteUserFailure(data.message));
                return;
            }

            dispatch(deleteUserSuccess())

        } catch (error) {
            dispatch(deleteUserFailure(error.message))
        }
    }

    const handleSignOut = async () => {
        try {
            dispatch(signOutUserStart())

            const res = await fetch("https://ozone-website-inky.vercel.app/api/auth/signout");
            const data = await res.json();
            if (data.success === false) {
                dispatch(signOutUserFailure(data.message));
                return;
            }
            dispatch(signOutUserSuccess(data));


        } catch (error) {
            dispatch(signOutUserFailure(error.message))
        }
    }

    return (
        <div className='p-3 max-w-lg mx-auto'>
            <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
            {/* <button onClick={eslam}>eslam</button> */}
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <input onChange={(e) => setFile(e.target.files[0])} type="file" ref={fileRef} hidden accept='image/*' />
                <img onClick={() => fileRef.current.click()} src={formData.avatar ? formData.avatar : currentUser.avatar} alt="profile"
                    className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2' />
                {

                    faild
                        ? <span className='self-center text-red-700' >upload failed (check the image bellow 2MB)</span>
                        : <span className="self-center" hidden={!fileLoading}>
                            <div className="flex justify-center items-center space-x-1 text-sm text-gray-700">
                                <svg fill='none' className="w-6 h-6 animate-spin" viewBox="0 0 32 32" xmlns='http://www.w3.org/2000/svg'>
                                    <path clipRule='evenodd'
                                        d='M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z'
                                        fill='currentColor' fillRule='evenodd' />
                                </svg>
                                <div>Loading ...</div>
                            </div>
                        </span>}
                <input type="text" placeholder='username' id='username'
                    defaultValue={currentUser.username}
                    onChange={handleChange}
                    className='border p-3 rounded-lg' />
                <input type="text" placeholder='email' id='email'
                    defaultValue={currentUser.email}
                    onChange={handleChange}
                    className='border p-3 rounded-lg' />
                <input type="password" placeholder='password' id='password'
                    onChange={handleChange}
                    className='border p-3 rounded-lg' />
                <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>
                    {loading ? 'Loading...' : 'Update'}
                </button>
            </form>
            <div className='flex justify-between mt-5'>
                <span onClick={handleDelete} className='text-rose-700 cursor-pointer'>Delete Account</span>
                <span onClick={handleSignOut} className='text-rose-700 cursor-pointer'>Sign Out</span>
            </div>

            <p className='text-red-700 mt-5'>{error ? error : ''}</p>
            <p className='text-green-700 mt-5'>{updateSuccess ? 'User Updated Successfully' : ''}</p>

        </div>
    )
}
