const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const cors = require("cors");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const user = require("./models/user.js");

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

app.use(passport.initialize());
app.use(passport.session()); //ability to persist login sessions
passport.use(new LocalStrategy(User.authenticate())); //use the local strategy for authentication

passport.serializeUser(User.serializeUser()); //serialize user to store in session - save krna info ko 
passport.deserializeUser(User.deserializeUser()); //deserialize user from session - delete krna info ko


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

// app.get("/demouser",async(req,res) => {
//     const fakeuser = new User({
//         email: "student@gmail.com",
//         username: "student"
//     });
//     let registerUser = await User.register(fakeuser, "password"); //register is static method and it automatically the password is unique
//     res.send(registerUser);
// })


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

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