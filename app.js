if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const axios = require('axios');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; // Ensure to use .Strategy

const Judge = require('./models/judge');
const Convict = require('./models/convict');
const Prosecutor = require('./models/prosecutor');
const Steagnographer = require('./models/steagnographer');
const Lawyer = require('./models/lawyer');
const Supervisor = require('./models/supervisor');
const ExpressError = require('./utils/ExpressError');
const userRouter = require('./routes/userRoute');

const instance = axios.create({
    timeout: 20000, // Increase timeout to 20 seconds
});

const app = express();

// Configure EJS and static files
app.engine('ejs', ejsMate);
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");
app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure session middleware
const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    autoRemove: 'native',
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600
});

store.on("error", (err) => {
    console.log("Error in MongoDB session store:", err);
});

app.use(session({
    store,
    secret: process.env.SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}));

app.use(flash());

// Initialize Passport and restore authentication state
app.use(passport.initialize());
app.use(passport.session());

// Define a generic LocalStrategy for all user types
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        let user = await Convict.findOne({ username });
        if (user && await user.authenticate(password)) return done(null, user);

        user = await Judge.findOne({ username });
        if (user && await user.authenticate(password)) return done(null, user);

        user = await Steagnographer.findOne({ username });
        if (user && await user.authenticate(password)) return done(null, user);

        user = await Lawyer.findOne({ username });
        if (user && await user.authenticate(password)) return done(null, user);

        user = await Prosecutor.findOne({ username });
        if (user && await user.authenticate(password)) return done(null, user);

        user = await Supervisor.findOne({ username });
        if (user && await user.authenticate(password)) return done(null, user);

        return done(null, false, { message: 'Invalid username or password.' });
    } catch (err) {
        return done(err);
    }
}));

// Serialize user (store user id and model in session)
passport.serializeUser((user, done) => {
    done(null, { id: user.id, model: user.constructor.modelName });
});

// Deserialize user (retrieve user from database)
passport.deserializeUser(async (obj, done) => {
    try {
        let user;
        switch (obj.model) {
            case 'Convict':
                user = await Convict.findById(obj.id);
                break;
            case 'Judge':
                user = await Judge.findById(obj.id);
                break;
            case 'Stenographer':
                user = await Steagnographer.findById(obj.id);
                break;
            case 'Lawyer':
                user = await Lawyer.findById(obj.id);
                break;
            case 'Prosecutor':
                user = await Prosecutor.findById(obj.id);
                break;
            case 'Supervisor':
                user = await Supervisor.findById(obj.id);
                break;
            default:
                return done(new Error('Unknown user model'));
        }

        if (!user) {
            return done(new Error('User not found'));
        }

        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Configure global res.locals
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.isLogedIn = req.isAuthenticated(); // Check if user is logged in

    // Initialize role as an empty string by default
    res.locals.role = "";

    if (req.isAuthenticated() && req.user) {
        // Assign the role to res.locals if available
        res.locals.role = req.user.role || ""; // Ensure that role exists
    }

    next();
});


// Define routes
app.get("/", async (req, res) => {
    let convicts = await Convict.find({});
    res.render('users/home.ejs', { convicts });
});

app.use("/", userRouter);

// Connect to MongoDB
async function main() {
    await mongoose.connect(process.env.ATLASDB_URL);
    console.log("DB connection successful.");
}

main().catch(err => {
    console.log(err);
});

const port = 8080;
app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
});

// Handle 404 errors
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found."));
});

app.use((err, req, res, next) => {
    const { status = 500, message } = err;
    console.log(err);
    res.status(status);
    res.render("users/error.ejs", { err });
});
