import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
const app=express()


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
})
)

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))



app.use(cookieParser())

//routes
import userRouter from "./routes/user.routes.js"
import projectRouter from "./routes/project.routes.js"
import stageRouter from "./routes/stage.routes.js"
//routes declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1",projectRouter)
app.use("/api/v1",stageRouter)


export {app}