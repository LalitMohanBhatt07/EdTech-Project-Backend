const express=require("express")
const app=express()

const userRoutes=require("./routes/User")
const profileRoutes=require("./routes/Profile")
const paymentRoutes=require("./routes/Payments")
const courseRoutes=require("./routes/Course")

require("dotenv").config()

const database=require("./config/database")
const cookieParser=require("cookie-parser") //npm install cookie-parser
const cors=require("cors") // we want to run our backend to port 4000 and frontend to 3000 thus to coordiante we need cors
const {cloudinaryConnect}=require("./config/cloudinary")
const fileUpload=require("express-fileupload") //npm i express-fileupload

const PORT=process.env.PORT||4000

//database connect
database.connect()

//middleware
app.use(express.json())
app.use(cookieParser())
app.use(
    cors({
        origin:"http://localhost:3000",
        credentials:true
    })
)
app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp"
    })
)

//cloudinary connect
cloudinaryConnect()

//route mount
app.use("/api/v1/auth",userRoutes)
app.use("/api/v1/profile",profileRoutes)
app.use("/api/v1/payment",paymentRoutes)
app.use("/api/v1/course",courseRoutes)

//default route
app.get("/",(req,res)=>{
    return res.json({
        success:true,
        message:"Your server is up and running"
    })
})

app.listen(PORT,()=>{
    console.log(`App is running at http://localhost:${PORT}`)
})