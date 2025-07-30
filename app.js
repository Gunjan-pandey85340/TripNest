const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const cors = require("cors");
const MONGO_URL = "mongodb://localhost:27017/wanderlust";



const { log } = require("console");
const { valid } = require("joi");
const Review = require("./models/review.js");

const listings = require("./routes/listing.js");

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

//Post Route for Reviews
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req,res) => {
   let = listing= await Listing.findById(req.params.id);
   let newReview = new Review(req.body.review);
   listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

//Delete Route for Reviews
app.delete(
    "/listings/:id/reviews/:reviewId", 
    wrapAsync(async(req,res) => {
    let { id,reviewId } = req.params;
    await Listing.findByIdAndUpdate(id , {$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    
    res.redirect(`/listings/${id}`);
    })
);




const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400 , result.errMsg);
    }else {
        next();
    }
};
app.use("/listings", listings);



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