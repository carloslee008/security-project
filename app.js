//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({
  extended:true
}));

app.use(session({
  secret: "Big secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/userDB");

  const userSchema = new mongoose.Schema({
    email: String,
    password: String
  });

  userSchema.plugin(passportLocalMongoose);

  const User = mongoose.model('User', userSchema);

  passport.use(User.createStrategy());

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  app.get("/", function(req, res){
    res.render("home");
  });

  app.route("/login")
    .get((req, res) => {
      res.render("login");
    })
    .post(passport.authenticate("local", {failureRedirect: "/login"}),
      function(req, res) {
        res.redirect("/secrets");
      });


  // Register //
  app.route("/register")
    .get((req, res) => {
      res.render("register");
    })
    .post((req, res) => {

      User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          res.redirect("/");
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets");
          });
        }
      });

    });


  app.get("/secrets", function(req, res){
    res.set(
      'Cache-Control',
      'no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0'
    );
    if (req.isAuthenticated()){
      res.render("secrets");
    } else {
      res.redirect("/login");
    }
  });

  app.get("/logout", function(req, res){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

  app.listen(3000, function(req, res){
    console.log("Server started on port 3000.");
  });
};
