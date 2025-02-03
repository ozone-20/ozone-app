import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { app } from '../firebase'
import { useDispatch } from "react-redux"
import { signInFailure, signInSuccess } from "../redux/user/userSlice"
import { useNavigate } from "react-router-dom"

export default function Aouth() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const handleGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider()
            const auth = getAuth(app)

            const result = await signInWithPopup(auth, provider)

            console.log(result.user.photoURL)
            const res = await fetch("https://ozone-website-inky.vercel.app/api/auth/google", {
                method: "POST",
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: result.user.displayName,
                    email: result.user.email,
                    photo: result.user.photoURL
                })
            })
            const data = await res.json()

            if (data.success == false) {
                // setLoading(false)
                // setError(data.message)
                dispatch(signInFailure(data.message))
                return;
            }
            // console.log(data)
            dispatch(signInSuccess(data))
            navigate("/")
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <button onClick={handleGoogle} type='button'
            className='bg-red-700 text-white rounded-lg p-3 uppercase hover:opacity-95'>Continue with google</button>
    )
}
