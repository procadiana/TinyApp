const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const morgan = require("morgan");
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')


app.use(cookieSession({name: 'session',
  keys: ['key']}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.set('view engine', 'ejs');

const urlDatabase = {};
const users = {};

function generateRandomString() {
  let randomURL= Math.random().toString(36).replace('0.', '').slice(0,6);
  return randomURL;
};

function urlsForUser(id) {
  let links = {};
  for (i in urlDatabase){
    if (urlDatabase[i].userID === id){
      links[i] = urlDatabase[i];
    }
  }
  return links;
};


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    urlDatabase: {longURL: urlDatabase[req.params], userID: req.session.user_id},
    users: users[req.session.user_id]
  };
    res.render("urls_new", templateVars);
});

app.post("/urls/new", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect("/urls/" + shortURL);
});


app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id),
    users: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});


app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id};
    res.redirect("/urls/" + shortURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    longURL: urlDatabase[req.params], userID: req.session.user_id,
    shortURL: req.params.shortURL,
    urls: urlDatabase,
    users: users[req.session.user_id],
  };
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID){
    templateVars.owner = true
  }
  else {
    templateVars.owner = false
  }
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
      urlDatabase[req.params.shortURL] = {};
      urlDatabase[req.params.shortURL].longURL = req.body.longURL;
      urlDatabase[req.params.shortURL].userID = req.session.user_id;
      res.redirect("/urls/" + req.params.shortURL);
});

app.post("/login", (req, res) =>{
  let userFound;
  for (i in users){
    if (bcrypt.compareSync(req.body.password, users[i].password) && users[i].email === req.body.email ){
      userFound = users[i].id;
      req.session.user_id = userFound;
      res.redirect("/urls");
    }
  }
  if (!userFound) {
    res.send("User not found, please create an account")
  }
});

app.post("/logout", (req,res) =>{
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req,res) =>{
  let templateVars = {
    users: users[req.session.user_id]
  };
  res.render("register", templateVars);
});

app.post("/register", (req,res) =>{
  for (i in users){
    if (req.body.email === users[i].email  || !req.body.password){
      res.send("User already exists");
    }
  }
  if ( req.body.email && req.body.password ){
  let userID = generateRandomString();
  let hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[userID] = {'id': userID, 'email': req.body.email, 'password': hashedPassword};
  req.session.user_id = userID;
  res.redirect("/urls");
  } else{
    res.send("Please insert valid Email and Password")
  }
});

app.get("/login", (req,res) =>{
  let templateVars = {
    users: users[req.session.user_id]
  };
  res.render("login", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
