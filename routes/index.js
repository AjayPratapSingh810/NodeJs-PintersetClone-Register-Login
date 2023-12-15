var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./posts');
const passport = require('passport');
const upload = require('./multer');

// check password and username during login process
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));
// Configure the local strategy with the email as the username field
// passport.use(new LocalStrategy({ usernameField: 'email' }, userModel.authenticate()));


router.get('/', function (req, res, next) {
  res.render('index');
});
router.get('/login', function (req, res, next) {
  res.render('login', { error: req.flash("error") });
});
router.get('/feed', function (req, res, next) {
  res.render('feed');
});

router.post('/upload', isLoggedIn, upload.single('file'), async function (req, res, next) {
  if (!req.file) {
    return res.status(404).send('No Files Are Uploaded');
  }
  const user = await userModel.findOne({ username: req.session.passport.user });

  const postData = await postModel.create({
    postText: req.body.postText,
    image: req.file.filename,
    user: user._id,
  });

  await user.posts.push(postData._id);
  user.save();
  res.redirect("/profile");

});

router.get('/profile', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
    .populate('posts');
  // console.log(user);
  res.render('profile', { user });
});

router.post("/register", function (req, res) {
  const { username, email } = req.body;
  const userData = new userModel({ username, email });

  userModel.register(userData, req.body.password).then(function (registereduser) {
    passport.authenticate('local')(req, res, function () {
      res.redirect("/profile");
    })
  })
})

// Define login route using Passport's authenticate middleware
router.post("/login", passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: "/login",
  failureFlash: true
}), function (req, res) { });

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
})

// Middleware to check if the user is authenticated
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}


module.exports = router;
