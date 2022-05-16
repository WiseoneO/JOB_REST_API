const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDatabse = require("./config/database");
const errorMiddleware = require("./middlwweares/errors");
const ErrorHandler = require("./utils/errorHandler")
const cookieParser = require("cookie-parser");

// setting config.env files variables
dotenv.config({path : "./config/config.env"})

// setup bodyparser
app.use(express.json())

// Handling unchaught exception
process.on("uncaughtException", err =>{
    console.log(`Error : ${err.message}`);
    console.log("Shutting down due to uncaught exception");
    process.exit(1);
})

// connnecting database
connectDatabse();

// Setting cookie parser
app.use(cookieParser());


// importing routes
const jobs = require("./routes/jobs");
const authRoute = require("./routes/auth")

app.use("/api/v1", jobs);
app.use("/api/v1", authRoute);

// Handle unhandel routes
app.all("*", (req, res, next)=>{
    next(new ErrorHandler(`${req.originalUrl} Route not found`, 404))
})

// Middlewares to handle error

app.use(errorMiddleware);


const PORT = 3000;
const server = app.listen(PORT, ()=>{
    console.log(`currently running on ${PORT} in ${process.env.NODE_ENV} mode.`)
});


// Handling unhandled promise rejection
process.on("unhandledRejection", err =>{
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to Unhandled promise rejection.");
    server.close(()=>{
        process.exit(1);
    })
});