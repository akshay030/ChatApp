import 'dotenv/config'
import express from 'express'

import cors from 'cors'
import http from 'http'
import connectDB from './lib/db.js'
import userRouter from './routes/userRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import { Server } from 'socket.io'



const app=express()

const server=http.createServer(app)


export const io= new Server(server,{
    cors:{origin:"*"}

})

export const userSocketMap={}

io.on("connection",(socket)=>{
    const userId=socket.handshake.query.userId
  //  console.log("user connected",userId);
    if(userId) userSocketMap[userId]=socket.id

    io.emit("getOnlineUsers",Object.keys(userSocketMap))

    socket.on("disconnect",()=>{
   //     console.log("User disconnected",userId);
        delete userSocketMap[userId]
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
        
    })
    
})




app.use(express.json({limit:'4mb'}))
app.use(cors())


app.get('/', (req, res) => {
    res.send('Welcome to the server!');
})
app.use("/api/status",(req,res)=>res.send("Srever is live !"))
app.use("/api/auth",userRouter)
app.use("/api/messages",messageRouter)

await connectDB()
//const PORT = process.env.PORT || 5000


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


export default server