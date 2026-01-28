import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import morgan from "morgan"
const app=express()


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
})
)
app.use(morgan("dev"))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))



app.use(cookieParser())

// //routes
import userRouter from "./routes/user.routes.js"
import errorHandler  from "./middleware/errorHandler.js";
// import roleRoutes from './routes/role.routes.js';
import projectRoutes from './routes/project.routes.js';
import projectMembershipRoutes from './routes/projectMembership.routes.js';
// import checklistRoutes from './routes/checklist.routes.js';
import stageRouter from "./routes/stage.routes.js"
// import checkPointRoutes from "./routes/checkpoint.route.js"
import templateRoutes from "./routes/template.route.js"
// //routes declaration
app.use("/api/v1/stages",stageRouter)
// app.use('/api/v1', checklistRoutes);
app.use("/api/v1/users",userRouter)
// app.use('/api/v1/roles', roleRoutes);
// app.use("/api/v1/checkpoint",checkPointRoutes);
app.use("/api/v1/template",templateRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/projects-membership', projectMembershipRoutes);





















//keep erro handler at last 

app.use(errorHandler);




export {app}