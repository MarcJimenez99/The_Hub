if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
// import dependencies
const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const cookieParser = require('cookie-parser');
const hbs = require('express-handlebars');
const path = require('path');
const fs = require('fs');
const parse = require('node-html-parser').parse;
const db = config.get('mongoURI');
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('./passport-config');
const methodOverride = require('method-override'); 

// import handlers
const homeHandler = require('./controllers/home.js');
const roomHandler = require('./controllers/room.js');
const loginHandler = require('./controllers/login.js');
const editHandler = require('./controllers/editProfile.js');
const likedHandler = require('./controllers/likedEvents.js');
const Room = require('./models/RoomSchema.js');
const User = require('./models/UserSchema');
const RoomMessage = require('./models/MessageSchema');
const roomGenerator = require('./util/roomIdGenerator.js');
const { request } = require('http');
const MessageSchema = require('./models/MessageSchema');

const app = express();

mongoose
  .connect(db, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(session({
  secret: 'Secret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(methodOverride('_method'));

// If you choose not to use handlebars as template engine, you can safely delete the following part and use your own way to render content
// view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// set up stylesheets route

// TODO: Add server side code


app.post('/create', async function(req, res) {
  Room.exists({name: req.body.inputName}, function(err, result){
    if(err){
      console.log(err);
    } else {
      console.log("Room Create Result: ", result);
      if(result == true) { //room with inputName already exists
        return res.render("home", {error_room: "<p class='error_text'> Room already exists! Please re-enter a valid input. </p>"});
      } else {
        const newRoom = new Room({
          name: req.body.inputName,
          roomID: roomGenerator.roomIdGenerator(),
          description: req.body.inputDescription,
          category: req.body.category,
          owner: req.user.username,
          arr_createdMessages: new Array()
        });
        newRoom.save().then(console.log("room added"))
          .catch(e => {
            if (e) {
              console.log(e);
            }
            else {
              res.redirect("/" + newRoom.name);
            }
          });
      }
    }
  });
});

app.get("/getAllRooms", function(req, res){
  Room.find().lean().then(items => {
      res.json(items);
  });
});

app.post('/register', checkNotAuthenticated, async function(req, res) {
  if (!req.body.username || typeof req.body.username !== 'string'){
    return res.render("register", {error_name: "<p class='error_text'> Not a valid name! Please re-enter a valid input. </p>"});
  }
  User.findOne({username: req.body.username}, function(err, user) {
    if (user) {
      return res.render("register", {error_name: "<p class='error_text'> Name already exists! Please re-enter a valid input. </p>"});
    }
  });
  if (!req.body.email || typeof req.body.email !== 'string') {
    return res.render("register", {error_email: "<p class='error_text'> Not a valid email! Please re-enter a valid input. </p>"});
  }
  User.findOne({email: req.body.email}, function(err, user) {
    if (user) {
      return res.render("register", {error_email: "<p class='error_text'> Email already exists! Please re-enter a valid input. </p>"});
    }
  });
  if (!req.body.password || typeof req.body.password !== 'string') {
    return res.render("register", {error_password: "<p class='error_text'> Not a valid password! Please re-enter a valid input. </p>"});
  }
  if (req.body.password.length < 4 || req.body.password.length > 18) {
    return res.render("register", {error_password: "<p class='error_text'> Password must be longer than 4 characters and shorter than 18! Please re-enter a valid input. </p>"});
  }
  const hashPassword = await bcrypt.hash(req.body.password, 10);
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashPassword,
    userID: Date.now(),
    isLoggedIn: false
  });
  newUser.save().then(console.log("User added")).catch(e => {
    if (e) {
      console.log(e)
    }
  });
  res.redirect('/login');
});

app.post('/:roomName/update', function(req, res) {
  Room.findOneAndUpdate({name: req.body.roomUsed },
    //{$set: {$inc:{upvote: 1}}, arr_upvote: req.body.reg_arr}, 
    {$set: {upvote: req.body.upvote_num, arr_upvote: req.body.reg_arr}},
    {new: true}, function(err, docs) {
      if (err) {
        console.log(err);
      } else {
        //console.log("Checking name param: ", this.name);
        console.log("UPDATE DOC: ", docs);
      }
    });
});

app.post('/:roomName/edit', function(req, res) {
  RoomMessage.findOneAndUpdate({messageID: req.body.messageID },
    {$set: {message: req.body.message, editFlag: req.body.editFlag}}, {new: true}, function(err, docs) {
      if (err) {
        console.log(err);
      } else {
        console.log("UPDATE DOC Edit: ", docs);
      }
    });
  Room.findOneAndUpdate({ roomID: req.body.roomID },
  { $set: {arr_createdMessages: req.body.createdMessages }},
  {new: true}, function(err, room) {
    if (err) {
      console.log("Error in edit:" + err);
    }
    else {
      console.log("Edited Values in array" + room);
    }
  });
});
 
 app.post('/:roomName/delete', function(req, res) {
  RoomMessage.remove({messageID: req.body.messageID })
    .then(console.log("sucesssful delete", req.body.messageID))
    .catch(console.log("error and delete", req.body.messageID));

  Room.findOneAndUpdate({ roomID: req.body.roomID },
    { $set: {arr_createdMessages: req.body.createdMessages }},
      {new: true}, function(err, room) {
        if (err) {
          console.log("Error in delete:" + err);
        }
        else {
          console.log("Deleted values in array" + room);
        }
      });
});

app.get('/:roomName/currUser', function(req, res) {
  User.findOne({email: req.user.email}).lean().then(items => {
    res.json(items);  
    console.log("success");
    console.log(items)
  })
});

app.get('/:roomName/messages', function(req, res) {
  RoomMessage.find({roomID: req.params.roomName}).lean().then(items => {
    res.json(items);
  })
});

app.post('/:roomName/messages', function(req, res) {
  const newMessage = new RoomMessage({
    roomID: req.body.roomUsed,
    username: req.body.person,
    dateOfEntry: req.body.timeSent,
    message: req.body.userInput,
    messageID: req.body.messageID,
    editFlag: false
  });
  newMessage.save().then(console.log("Message for room added"))
    .catch(e => console.log(e));
  Room.findOneAndUpdate({ name: req.body.roomUsed },
    {$push: {arr_createdMessages: newMessage}},
      {new: true}, function(err, room) {
        if (err) {
          console.log("Error in delete:" + err);
        }
        else {
          console.log("Updated " + room);
        }
      });
});

app.get('/:roomName/messages/updateArrays', function(req, res) {
  Room.findOne({name: req.params.roomName}).lean().then(items => {
    res.json(items);
  });
});

app.get('/likedEvents/currUser', function(req, res) {
  User.findOne({email: req.user.email}).lean().then(items => {
    res.json(items);  
    console.log("success - likedevents");
    console.log(items)
  })
});



app.post('/editProfile/user', function(req,res) {
  if (!req.body.ProfileUsernameInput || typeof req.body.ProfileUsernameInput !== 'string') {
    return res.render("editProfile", {error_user: "<p class='error_text'> Not a valid user! Please re-enter a valid input. </p>"});
  }
  User.findOne({username: req.body.ProfileUsernameInput}, function(err, user) {
    if (user) {
      return res.render("editProfile", {error_user: "<p class='error_text'> User already exists! Please re-enter a valid input. </p>"});
    }
    else {
      User.findOneAndUpdate({ username: req.user.username },
        { $set: { username: req.body.ProfileUsernameInput } },
        {new: true}, function(err, user){
          if (err) {
            res.send(err);
          }
          if (user) {
            console.log("Updated User");
          } else {
            console.log("User does not exist");
          }
        });
      res.redirect("/editProfile");
    }
  });
}); 

app.post('/editProfile/email', function(req,res) {
  if (!req.body.ProfileEmailInput || typeof req.body.ProfileEmailInput !== 'string') {
    return res.render("editProfile", {error_email: "<p class='error_text'> Not a valid email! Please re-enter a valid input. </p>"});
  }
  User.findOne({email: req.body.ProfileEmailInput}, function(err, email) {
    if (email) {
      return res.render("editProfile", {error_email: "<p class='error_text'> Email already exists! Please re-enter a valid input. </p>"});
    }
    else {
      User.findOneAndUpdate({ username: req.user.username },
        { $set: { email: req.body.ProfileEmailInput, } },
        {new: true}, function(err, user){
          if (err) {
            res.send(err);
          }
          if (user) {
            console.log("Updated User");
          } else {
            console.log("User does not exist");
          }
        });
      res.redirect("/editProfile");
    }
  });
  
}); 

app.post('/editProfile/age', function(req,res) {
  if (!req.body.ProfileAgeInput) {
    return res.render("editProfile", {error_age: "<p class='error_text'> Not a valid age! Please re-enter a valid input. </p>"});
  }
  User.findOneAndUpdate({ username: req.user.username },
    { $set: { age: req.body.ProfileAgeInput }},
    {new: true}, function(err, user){
      if (err) {
        res.send(err);
      }
      if (user) {
        console.log("Updated User");
      } else {
        console.log("User does not exist");
      }
    });
  res.redirect("/editProfile");
}); 

app.post('/editProfile/address', function(req,res) {
  if (!req.body.ProfileAddressInput || typeof req.body.ProfileAddressInput !== 'string') {
    return res.render("editProfile", {error_address: "<p class='error_text'> Not a valid address! Please re-enter a valid input. </p>"});
  }
  User.findOneAndUpdate({ username: req.user.username },
    { $set: { address: req.body.ProfileAddressInput }},
    {new: true}, function(err, user){
      if (err) {
        res.send(err);
      }
      if (user) {
        console.log("Updated User");
      } else {
        console.log("User does not exist");
      }
    });
  res.redirect("/editProfile");
}); 

app.delete('/logout', function(req, res) {
  User.findOneAndUpdate({ username: req.user.username },
    { $set: { isLoggedIn: false } },
    {new: true}, function(err, user){
      if (err) {
        res.send(err);
      }
    });
  req.logOut();
  res.redirect('/login');
});

app.post('/login', (req, res, next) => {
  passport.authenticate("local", function(err, user, info) {
    if (err) {
      return res.status(400).json({ errors: err });
    }
    if (info) {
      if (info.message == "User already logged in") {
        return res.render("login", {error_email: "<p class='error_text'> User already logged in! Please re-enter a valid input. </p>"});
      }
      if (info.message == "Wrong password") {
        return res.render("login", {error_password: "<p class='error_text'> Wrong Password! Please re-enter a valid input. </p>"});
      }
    }
    if (!user) {
      return res.render("login", {error_email: "<p class='error_text'> Invalid email! Please re-enter a valid input. </p>"});
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(400).json({ errors:err });
      }
      else {
        User.findOneAndUpdate({ username: req.user.username },
          { $set: { isLoggedIn: true } },
          {new: true}, function(err, user){
            if (err) {
              res.send(err);
            }
            if (user) {
              console.log("User is logged in");
            } else {
              console.log("User does not exist");
            }
          });
        res.redirect('/');
      }
    });
  })(req, res, next);
});


function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // console.log("User is logged in");
    return next();
  }
  console.log("User isn't logged in. Send them to log-in.");
  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("User is logged in send them to home.");
    return res.redirect('/');
  }
  console.log("User is not logged in.");
  next();
}

app.get('/', checkAuthenticated, homeHandler.getHome);
app.get('/login', checkNotAuthenticated, loginHandler.getLogin);
app.get('/register', checkNotAuthenticated, loginHandler.getRegistrar);
app.get('/editProfile', checkAuthenticated, editHandler.getProfile);
app.get('/likedEvents', checkAuthenticated, likedHandler.getLiked);
app.get('/:roomName', checkAuthenticated, roomHandler.getRoom);

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

