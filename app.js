const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const cors = require("cors");

const MONGO_URL = "mongodb://localhost:27017/wanderlust";
//mongodb connection
async function main() {
    await mongoose.connect(MONGO_URL);
}
main ()
    .then(() => console.log("connected to DB"))
    .catch((err) => console.log(err));


//App configuration
app.engine('ejs',ejsMate);
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(cors());

//Session and Flash configuration
const sessionOptions= {
    secret: "mySupersecretcode",
    resave:false,
    saveUnintialized: true,
    cookie: {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true, // prevents client-side scripts from accessing the cookie

    },
};

app.use(session(sessionOptions));
app.use(flash());

//flash messages middleware
app.use((req,res,next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

//Routes
app.get("/",(req,res) => {
    res.send("Hi,I am root");
});

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);

//404 error handler
app.all(/.*/ , (req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
})

//Error handling middleware
app.use((err,req,res,next) =>{
    let {statusCode =500, message="Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message});
    // res.status(statusCode).send(message);
   
});

//Server listening
app.listen(8080 ,()=> {
    console.log("server is listening to port 8080");
    
});