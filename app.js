//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

// const bodyParser = require("body-parser");

const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({
  extended:true
}));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/userDB");

  const userSchema = new mongoose.Schema({
    email: String,
    password: String
  });

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
          bcrypt.compare(password, user.password, function(err, result) {
            if (result === true) {
              res.render("secrets");
            }
          });
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
      bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new User({
          email: req.body.username,
          password: hash
        });

        newUser.save(function(err){
          if (!err){
            res.render("secrets");
          } else {
            console.log(err);
          }
        });
      });
    });

  app.listen(3000, function(req, res){
    console.log("Server started on port 3000.");
  });
};
