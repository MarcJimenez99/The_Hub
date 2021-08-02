const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/UserSchema');
const passport = require('passport');
const bcrypt = require('bcrypt');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
      done(err, user);
  });
});

// Local Strategy
passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Match User
      User.findOne({ email: email })
          .then(user => {
              if (!user) {
                return done(null, false, { message: "Wrong user" });
                  // Return other user
              } else {
                  // Match password
                  if (user.isLoggedIn == true) {
                      // not implemented yet
                    return done(null, false, { message: "User already logged in" })
                  } else {
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;
  
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: "Wrong password" });
                        }
                    });
                  } 
              }
          })
          .catch(err => {
              return done(null, false, { message: err });
          });
  })
);
module.exports = passport;