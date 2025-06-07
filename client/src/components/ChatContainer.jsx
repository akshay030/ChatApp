import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMeassageTime } from '../lib/utils'
import { ChatContext } from '../context/ChatContext'
import { AuthContext } from '../context/AuthContext'
import toast from 'react-hot-toast'

const ChatContainer = () => {
  const scrollEnd = useRef()
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages, setMessages } = useContext(ChatContext)
  const { authUser, onlineUsers } = useContext(AuthContext)
  const [input, setInput] = useState('')

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (input.trim() === '') return
    await sendMessage({ text: input.trim() })
    setInput('')
  }

  const handleSendImage = (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result })
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

 useEffect(() => {
  if (selectedUser) {
    getMessages(selectedUser._id);
  } else {
    setMessages([]);
  }
}, [selectedUser]);


  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500">
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-8 rounded-full" />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500" />}
        </p>
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="arrow" className="md:hidden w-5 cursor-pointer" />
        <img src={assets.help_icon} alt="help" className="max-md:hidden w-5" />
      </div>

      {/* Messages */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages?.map((msg, index) => {
          const isSender = msg.senderId === authUser._id
          return (
            <div key={index} className={`flex items-end gap-2 mb-4 ${isSender ? 'justify-end' : 'justify-start'}`}>
              {!isSender && (
                <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className="w-7 rounded-full" />
              )}
              <div className="max-w-[70%]">
                {msg.image ? (
                  <img src={msg.image} alt="sent" className="rounded-lg border border-gray-700 max-w-[230px]" />
                ) : (
                  <p className={`p-2 text-sm font-light rounded-lg break-words text-white
                    ${isSender ? 'bg-violet-500/30 rounded-br-none' : 'bg-gray-700/30 rounded-bl-none'}`}>
                    {msg.text}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1 text-right">{formatMeassageTime(msg.createdAt)}</p>
              </div>
              {isSender && (
                <img src={authUser?.profilePic || assets.avatar_icon} alt="" className="w-7 rounded-full" />
              )}
            </div>
          )
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-black/10 backdrop-blur-md">
        <div className="flex-1 flex items-center bg-gray-100/10 px-3 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
            type="text"
            placeholder="Type a message..."
            className="flex-1 text-sm p-3 bg-transparent text-white outline-none placeholder-gray-400"
          />
          <input onChange={handleSendImage} type="file" id="image" accept="image/*" hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="gallery" className="w-5 mr-2 cursor-pointer" />
          </label>
        </div>
        <img onClick={handleSendMessage} src={assets.send_button} alt="send" className="w-7 cursor-pointer" />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} className="w-16" alt="logo" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  )
}

export default ChatContainer
