import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom"

import React from 'react'
import { useSelector } from "react-redux";



export default function header() {
    const { currentUser } = useSelector((state) => state.user)
    return (<>
        <header className=" sticky p-2 top-0 font-sans">
            <div className=' bg-slate-500  shadow-xl flex justify-between items-center max-w-6xl mx-auto p-3 rounded-xl'>
                <Link to="/">
                    <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
                        <span className='text-slate-900'>Ozone</span>
                        <span className='text-slate-400'>Website</span>
                    </h1>
                </Link>
                <form className='bg-slate-200 p-3 rounded-xl flex items-center'>
                    <input type="text" placeholder='search...' className='bg-transparent focus:outline-none text-slate-800 w-24 sm:w-64' />
                    <FaSearch className="text-slate-500" />
                </form>
                <ul className="flex gap-2 font-semibold">
                    <Link to="/">
                        <li className="text-slate-800 hidden sm:inline hover:underline">home</li>
                    </Link>
                    <Link to="/about">
                        <li className="text-slate-800 hidden sm:inline hover:underline">about</li>
                    </Link>
                    <Link to="/profile">
                        {
                            currentUser ? (
                                <img className="rounded-full w-7 h-7 object-cover" src={currentUser.avatar} alt="" />
                            ) : <li className="text-slate-800 hover:underline">signin</li>
                        }
                    </Link>
                </ul>
            </div>
        </header >
    </>
    )
}
