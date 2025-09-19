const express=require('express');
const cors = require('cors');
const dotenv=require('dotenv');
const mlRoutes = require('./routes/mlRoutes');

dotenv.config({ debug: false });

const port = process.env.PORT || 3000;
const app=express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

// Base route for ML services
app.use('/api/ml', mlRoutes);

//test route
app.get("/",(req,res)=>{
    res.send("🚀 The API Avengers Backend is Running...");
});


//import routes
const cropRoutes=require('./routes/cropRoutes');
const priceRoutes=require('./routes/priceRoutes');
const forecastRoutes=require('./routes/forecastRoutes');
const userRoutes = require('./routes/userRoutes');

// Import auth middleware
const authenticate = require('./middlewares/auth');

//routes
app.use("/api/crops", cropRoutes);
app.use("/api/prices", priceRoutes);
app.use('/api/users', userRoutes);

// Protected route (requires JWT login)
app.use('/api/forecast', authenticate, forecastRoutes);

app.listen(port,function(req,res){
    console.log(`🚀 Server running on http://localhost:${port}`);
})