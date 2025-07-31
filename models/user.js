const mongoose = require("mongoose");
const schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new schema({
    email: {
        type: String,
        required: true,
    },
});

userSchema.plugin(passportLocalMongoose); // this line automatically adds username and password fields to the schema

module.exports = mongoose.model("User", userSchema);
