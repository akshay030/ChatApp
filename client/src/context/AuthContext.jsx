import { useEffect, useState } from "react";
import { createContext } from "react";
import toast from "react-hot-toast";
import {io} from "socket.io-client"
import axios from 'axios'
const backendUrl=import.meta.env.VITE_BACKEND_URL
axios.defaults.baseURL=backendUrl


export const AuthContext=createContext()

export const AuthProvider=({children})=>{
    const [token,setToken]=useState(localStorage.getItem("token"))
    const[authUser,setAuthUser]=useState(null)
    const [onlineUsers,setOnlineUsers]=useState([])
    const [socket,setSocket]=useState()
        


    const checkAuth = async()=>{
        try {
            const {data}=await axios.get("/api/auth/check")
            if(data.success){
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

  const login = async (state, credentials) => {
  try {
    const { data } = await axios.post(`/api/auth/${state}`, credentials);
    if (data.success) {
      setAuthUser(data.userData);
      connectSocket(data.userData);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`; // ✅ Fix
      setToken(data.token);
      localStorage.setItem("token", data.token);
      toast.success(data.message);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};


    const logout= ()=>{
  localStorage.removeItem("token")
  setToken(null)
  setAuthUser(null)
  setOnlineUsers([])
  axios.defaults.headers.common["Authorization"]=null
  socket?.disconnect()  // safer with optional chaining
}


    const updateProfile = async(body)=>{
        try {
            const {data}=await axios.put("/api/auth/update-profile",body)
            if(data.success){
                setAuthUser(data.user)
                toast.success("Profile updated successfully")
            }
        } catch (error) {
            toast.error(error.message,"update erroe")

            
        }
    }



    const connectSocket=(userData)=>{
        if(!userData ||socket?.connected) return
        const newSocket = io(backendUrl,{
            query:{
                userId:userData._id,
            }
        })
        newSocket.connect()
        setSocket(newSocket)

        newSocket.on("getOnlineUsers",(userIds)=>{
            setOnlineUsers(userIds)
        })
    }



  useEffect(() => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    checkAuth();
  } else {
    delete axios.defaults.headers.common["Authorization"];
    setAuthUser(null);
  }
}, [token]);




    const value={
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile

    }
    return(
        <AuthContext.Provider value={value}>
        {children}
        </AuthContext.Provider>
    )
}