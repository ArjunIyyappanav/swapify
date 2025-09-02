import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose';

dotenv.config()
const app = express()
app.use(cors(
    {origin:process.env.FRONTEND_URL}
))
app.use(express.json())

// app.use('/api',routes);

mongoose.connect(process.env.MONGODB_URI).
then(app.listen(process.env.PORT, () => {
    console.log(`MongoDB Connection successful\nServer running on port ${process.env.PORT}`)
}))
