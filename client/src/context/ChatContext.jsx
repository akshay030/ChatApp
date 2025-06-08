import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";



export const ChatContext = createContext()

export const ChatProvider=({children})=>{
    const [messages,setMessages]=useState([])
    const [users,setUsers]=useState([])
    const [selectedUser,setSelectedUser]=useState(null)
const [unseenMessages, setUnseenMessages] = useState({})
    const {socket,axios} = useContext(AuthContext)

    const getUsers = async () => {
  try {
    const { data } = await axios.get("/api/messages/users");
    if (data.success) {
      setUsers(data.users); // ✅ Make sure this matches
      setUnseenMessages(data.unseenMessages || {}); 
    }
  } catch (error) {
    toast.error(error.message);
  }
};

 const getMessages = async (userId) => {
  try {
    const { data } = await axios.get(`/api/messages/${userId}`);
    if (data.success) {
setMessages(Array.isArray(data.messages) ? data.messages : []);
    }
  } catch (error) {
    toast.error(error.message);
  }
};





    const sendMessage= async(messageData)=>{
        try {
            const {data}=await axios.post(`/api/messages/send/${selectedUser._id}`,messageData)
            if(data.success){
                setMessages((prevMessages)=>[...prevMessages,data.newMessage])
            }else{
                toast.error(data.error)
            }
            
        } catch (error) {
            toast.error(error.message)

            
        }
    }

    const subscribeToMessages =async()=>{
        if(!socket) return

        socket.on("newMessage",(newMessage)=>{
            if(selectedUser && newMessage.senderId===selectedUser._id){
                newMessage.seen = true
                setMessages((prevMessages)=>[...prevMessages,newMessage])
                axios.put(`/api/messages/mark/${newMessage._id}`)
            }else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages,[newMessage.senderId]:prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId]+1 : 1
                }))
            }
        })

    }
    const unsubscribeToMessages = ()=>{
        if(socket) socket.off("newMessage")
    }

    useEffect(()=>{
        subscribeToMessages();
        return ()=>unsubscribeToMessages()
    },[socket,selectedUser])





    const value={

        messages,          // ✅ must be here
        setMessages,       // ✅ must be here
        users,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getMessages,
        sendMessage,
        getUsers


    }
    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}