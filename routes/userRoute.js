const express = require('express');
const router = express.Router({mergeParams:true});
const mongoose = require('mongoose');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const passport = require('passport');
const {isLogedIn} = require('../middleware.js');
const userController = require('../controllers/userController.js');
const {saveRedirectUrl} = require('../middleware');



const multer  = require('multer');
const {storage} = require('../cloudConfig');//here we have extracted the location from clodConfig file where to save our images in cloudinary
// const upload = multer({ storage });//this will upload the files to the storage(cloudinary location where the files will be stored)
const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 1024 * 1024 * 50 }, // Optional: set file size limit (5MB here)
}); // Expect 'images' field with a max of 30 files
//Display all listings


router.get("/login", userController.renderLoginForm );
router.post("/login",saveRedirectUrl,passport.authenticate('local',{failureRedirect:'/login',failureFlash:true}),wrapAsync(userController.login));

router.get("/signup", userController.renderSignUpForm);

router.post("/signup", userController.handleSignUp);

router.post("/logout",userController.handleLogout);

router.post("/submit-convict",(wrapAsync(userController.handleConvictSubmit)));
router.post("/submit-judge",(wrapAsync(userController.handleJudgeSubmit)));
router.post("/submit-lawyer",(wrapAsync(userController.handleLawyerSubmit)));
router.post("/submit-prosecutor", upload.single('profilePictureURL'), wrapAsync(userController.handleProsecutorSubmit));
router.post("/submit-stenographer",(wrapAsync(userController.handleSteagnographerSubmit)));
router.get("/chargesheet",upload.array('image', 30),wrapAsync(userController.chargeSheet));

router.get("/cases/:id",userController.individualCase);

router.post("/file-chargesheet", upload.array('evidence[]', 10),wrapAsync(userController.handleChargeSheet));

router.get("/allcases",wrapAsync(userController.viewAllCases));
router.get("/case",(req,res)=>{res.render("users/caseDetailsForm.ejs")});
router.post("/cases",userController.handleCaseSubmit)



module.exports = router;