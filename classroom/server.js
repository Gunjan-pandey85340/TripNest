const express = require("express");
const app = express();
const users = require("./routes/user.js");
const posts = require("./routes/post.js");
const cookieParser = require("cookie-parser");

app.use(cookieParser("secretkey"));

app.get("/getsignedcookie", (req, res) => {
    res.cookie("made-in" ,"India", {signed:true});
    res.send("signed cookie send!");
});

app.get("/verify", (req, res) => {
    console.log(req.signedCookies);
    res.send("verified");
});

app.get("greet", (req,res) =>{
    let {name = "Guest"} = req.query;
    res.send(`Hello ${name}`); 
})

app.get("/", (req, res) => {
    res.send("hi, I am root!");      
});


app.use("/users" , users);
app.use("/posts",posts);


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});