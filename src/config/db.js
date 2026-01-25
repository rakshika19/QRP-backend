import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({
    path:'../.env'
})
const connectDB=async ()=>{
    try{
        

        const connectionInstance=await mongoose.connect(process.env.MONGO_DB_URI,{
            dbName:process.env.DB_NAME ,
            useNewUrlParser:true,
            useUnifiedTopology:true,
        });
        console.log(`\n MongoDB connected!! DB HOST: ${connectionInstance.connection.host}`);
        
    }
    catch(error){
        console.log("MONGODB CONNECTION ERROR" , error);
        process.exit(1)
    }
}

export default connectDB