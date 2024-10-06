const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const eventRouter = require("./routes/events");
const dotenv = require("dotenv");
const cors = require("cors"); 

dotenv.config();
const app = express();

const port = process.env.PORT || 8000;

// Middleware
app.use(cors()); 
app.use(bodyParser.json()); 


const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Connected to MongoDB");
})
.catch(err => {
    console.error("Failed to connect to MongoDB", err.message);
});

// Routes
app.get("/", (req, res) => {
    res.send("Welcome to the Event API!");
});
app.use("/api/events", eventRouter);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
