//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

// const bodyParser = require("body-parser");

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({
  extended:true
}));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/userDB");

  const userSchema = new mongoose.Schema({
    email: String,
    password: String
  });

  userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

  const User = mongoose.model('User', userSchema);

  app.get("/", function(req, res){
    res.render("home");
  });

  app.route("/login")
    .get((req, res) => {
      res.render("login");
    })
    .post((req, res) => {
      const username = req.body.username;
      const password = req.body.password;

      User.findOne({email: username}, function(err, user){
        if (user){
          if (user.password === password) {
            res.render("secrets");
          }
        } else {
          console.log(err);
        }
      });
    });

// Register //
  app.route("/register")
    .get((req, res) => {
      res.render("register");
    })
    .post((req, res) => {
      const newUser = new User({
        email: req.body.username,
        password: req.body.password
      });

      newUser.save(function(err){
        if (!err){
          res.render("secrets");
        } else {
          console.log(err);
        }
      });
    });

  app.listen(3000, function(req, res){
    console.log("Server started on port 3000.");
  });
};
