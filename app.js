const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const cors = require("cors");
const MONGO_URL = "mongodb://localhost:27017/wanderlust";
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const { log } = require("console");

app.use(cors());
main()
.then(()=> {
    console.log("connected to DB");
    
})
.catch((err)=> {
    console.log(err);
    
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/",(req,res) => {
    res.send("Hi,I am root");
});

//index route
app.get("/listings",async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index",{allListings});
    });

app.get("/listings/new" , (req ,res)=>{
    res.render("listings/new.ejs");
});
//Show Route
app.get("/listings/:id",async(req , res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs" , {listing});
});

//Create Route
app.post("/listings",
     wrapAsync(async(req,res,next) => {
        let result = listingSchema.validateAsync(req.body);
        console.log(result);
        if (result.error) {
            throw new ExpressError(400, result.error);
        }
    // let {title,description,image,price,country ,location } = req.body;
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");

}));

//Edit Route
app.get("/listings/:id/edit" , async(req ,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs" , { listing });
});

//Update Route
app.put("/listings/:id" , async(req,res) =>{
    if(!req.body.listing){
        throw new ExpressError(400,"Invalid Listing Data");
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id , {...req.body.listing});
    res.redirect(`/listings/${id}`);
});
//Delete Route
app.delete("/listings/:id" ,
    wrapAsync(async(req,res) => {
    let {id} =req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
    })
);

// app.get("/testListing", async(req,res) => {
//     let sampleListing = new Listing({
//         title:"My New Villa",
//         description:"By the beach",
//         // image:"https://unsplash.com/photos/mountains-and-water-meet-under-a-hazy-sky-BbRRJzYDGoM",
//         price:1200,
//         location:"Calangute,Goa",
//         country:"India",

//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
    
// });
app.all(/.*/ , (req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
})
app.use((err,req,res,next) =>{
    let {statusCode =500, message="Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message});
    // res.status(statusCode).send(message);
    // res.send("something went wrong");
});

app.listen(8080 ,()=> {
    console.log("server is listening to port 8080");
    
});