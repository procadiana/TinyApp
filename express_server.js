const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: 'userRandomID'},
  "9sm5xK": {longURL: "http://www.google.com", userID: 'userRandomID' }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

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
    urlDatabase: {longURL: urlDatabase[req.params], userID: req.cookies['user_id']},
    users: users[req.cookies['user_id']]
  };
    res.render("urls_new", templateVars);
});

app.post("/urls/new", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies['user_id']};
  console.log(urlDatabase)
  res.redirect("/urls/" + shortURL);
});


app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.cookies['user_id']),
    users: users[req.cookies['user_id']]
  };
  res.render("urls_index", templateVars);
});


app.post("/urls", (req, res) => {
    let userLinks = {};
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies['user_id']};
    res.redirect("/urls/" + shortURL);
});


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    longURL: urlDatabase[req.params], userID: req.cookies['user_id'],
    shortURL: req.params.shortURL,
    urls: urlDatabase,
    users: users[req.cookies['user_id']],
    // test: 0
  };
  if (req.cookies['user_id'] === urlDatabase[req.params.shortURL].userID){
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
      urlDatabase[req.params.shortURL].userID = req.cookies['user_id'];
      console.log(req.cookies['user_id'])
      res.redirect("/urls/" + req.params.shortURL);
});

app.post("/login", (req, res) =>{
  let userFound;
  for (i in users){
    if (users[i].password === req.body.password && users[i].email === req.body.email ){
      userFound = users[i].id;
      res.cookie('user_id', userFound);
      res.redirect("/urls");
    }
  }
  if (!userFound) {
    console.log("Error 403");
    res.redirect("register")
  }
});

app.post("/logout", (req,res) =>{
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get("/register", (req,res) =>{
  let templateVars = {
    users: users[req.cookies['user_id']]
  };
  res.render("register", templateVars);
});

app.post("/register", (req,res) =>{
  for (i in users){
    if (req.body.email !== users[i].email  && req.body.password){
    let userID = generateRandomString();
    users[userID] = {'Id': userID, 'email': req.body.email, 'password': req.body.password};
    res.cookie('user_id', userID);
  }else{
    console.log("404 Error")
  }
}
  res.redirect("/urls");
});

app.get("/login", (req,res) =>{
  let templateVars = {
    users: users[req.cookies['user_id']]
  };
  res.render("login", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
