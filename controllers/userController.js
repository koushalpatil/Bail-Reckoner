const Judge = require('../models/judge');
const Convict = require('../models/convict');
const Prosecutor = require('../models/prosecutor');
const Steagnographer = require('../models/steagnographer');
const Lawyer = require('../models/lawyer');
const Supervisor = require('../models/supervisor');
const ExpressError = require('../utils/ExpressError');
const isLogedIn = require('../middleware');
const Chargesheet = require('../models/chargesheet');
const Case = require('../models/case');
const lawyer = require('../models/lawyer');



//Handle this for case submit
// Function to handle case submission
module.exports.handleCaseSubmit = async (req, res) => {
    try {
        let {
            caseTitle,
            caseType,
            appeals,
            filingDate,
            verdict,
            court,
            status,
            courtDates,
            judge,
            accussed,  // This is the username for the accused
            defendant,  // This is the username for the defendant
            lawyer1,  // This is the username for the first lawyer
            lawyer2,  // This is the username for the second lawyer
            judgementTold,
            judgementDate,
            judgementJudge,
            caseProceedings,
            signed,
          
            natureOfOffense,
            chargesPressed,
            dateOfArrest,
            investigationStatus,
            sentenceServed,
            convictionStatus,
            documents
        } = req.body;

       

        // Lookup accused, lawyers, judge, and stenographer by username
        const [accusedUser, lawyer1User, lawyer2User, judgeUser] = await Promise.all([
            Convict.findOne({ username: accussed }),
            Lawyer.findOne({ username: lawyer1 }),
            Lawyer.findOne({ username: lawyer2 }),
            Judge.findOne({ username: judge }),
           
        ]);

        
        
        

        // Check if all required users are found
        if (!accusedUser || !lawyer1User || !lawyer2User || !judgeUser) {
            return res.redirect("/signup");
        }

        console.log("user is - ",req.user._id);
        

        let stenographerUser = await Steagnographer.findById(req.user._id);
        console.log("Steagnographer is - ",stenographerUser);
        

        // Create a new Case document
        const newCase = new Case({
            caseTitle,
            caseType,
            appeals,
            filingDate,
            verdict,
            court,
            status,
            courtDates,
            judge: judgeUser._id,
            accussed: accusedUser._id,
            defendant,
            lawyer1: lawyer1User._id,
            lawyer2: lawyer2User._id,
            judgementPassed: {
                date: judgementDate,
                judge: judgeUser._id,
                judgement: judgementTold
            },
            caseProceedings,
            signed,
            stenographer: stenographerUser._id,
            natureOfOffense,
            chargesPressed,
            dateOfArrest,
            investigationStatus,
            sentenceServed,
            convictionStatus,
            documents
        });

        // Save the case to the database
        const savedCase = await newCase.save();

        // Update related entities
        await Promise.all([
            // Update stenographer's assigned cases
            Steagnographer.findByIdAndUpdate(stenographerUser._id, { $addToSet: { assignedCases: savedCase._id } }),

            // Update other related entities
            Judge.findByIdAndUpdate(judgeUser._id, { $addToSet: { cases: savedCase._id } }),
            Convict.findByIdAndUpdate(accusedUser._id, { $addToSet: { cases: savedCase._id } }),
            Lawyer.findByIdAndUpdate(lawyer1User._id, { $addToSet: { cases: savedCase._id } }),
            Lawyer.findByIdAndUpdate(lawyer2User._id, { $addToSet: { cases: savedCase._id } })
        ]);

        // Respond with a redirect or success message
        res.redirect("/");
    } catch (error) {
        console.error('Error handling case submission:', error);
        res.status(500).json({ success: false, message: 'Error handling case submission' });
    }
};


module.exports.viewAllCases = async(req,res)=>{
    const cases = await Case.find({})
    .populate('lawyer1')
    .populate('lawyer2')
    .populate('judge')
    .populate('accussed')
    .exec();
    res.render("users/allCases.ejs",{cases});
}

module.exports.individualCase = async(req,res)=>{
    const {id} = req.params;
    const case1 = await Case.findById(id)
            .populate('lawyer1')
            .populate('lawyer2')
            .populate('judge')
            .populate('accussed')
            .exec();
    res.render("users/individualCase.ejs",{case1});
}

module.exports.handleChargeSheet = async (req, res) => {
    try {
        console.log("REQUEST BODY - ", req.body);
        console.log("REQUEST FILES - ", req.files);

        let { convict, charges, evidenceDescription, witnessName, witnessPhone, witnessEmail, witnessTestimony, prosecutorName, prosecutorPhone, prosecutorEmail, policeStation, status } = req.body;

        // Handling evidence as an array
        let evidenceDocument = [];
        if (req.files && req.files.length > 0) {
            evidenceDocument = req.files.map(file => ({
                description: evidenceDescription,
                documentURL: file.path
            }));
        }

        // Find the convict by username
        let convictObj = await Convict.findOne({ username: convict });

        if (!convictObj) {
            console.log("Convict does not exist. Please register.");
            req.flash("error", "Convict does not exist. Please register.");
            return res.redirect("/signup");  // Prevent further execution
        }

        // Handling witnesses as an array
        let witnesses = [{
            name: witnessName,
            contactDetails: {
                phone: witnessPhone,
                email: witnessEmail
            },
            testimony: witnessTestimony
        }];

        // Prosecutor information
        let prosecutor = {
            name: prosecutorName,
            contactDetails: {
                phone: prosecutorPhone,
                email: prosecutorEmail
            }
        };

        // Creating the Chargesheet object
        let obj = {
            convict: convictObj._id,
            charges,
            evidence: evidenceDocument,
            witnesses,
            prosecutor,
            dateFiled: Date.now(),
            policeStation,
            status
        };
        let chargeSheetObj = new Chargesheet(obj);

        // Save the chargesheet and associate it with the convict
        await chargeSheetObj.save();
        convictObj.chargeSheet = chargeSheetObj._id;
        await convictObj.save();

        res.redirect("/");
    } catch (err) {
        console.error("Error in handling charge sheet: ", err);
        res.status(500).send("An error occurred while processing the charge sheet.");
    }
};



// make formatting of date





module.exports.renderLoginForm = (req, res) => {
    res.render('users/login.ejs');
};

module.exports.login = async(req,res)=>{
    if(req.user.role == 'Lawyer')
    {
        let lawyer = await Lawyer.findById(req.user._id).populate('cases');
        return res.render("users/lawyerProfile.ejs",{lawyer});
    }
    else
    if(req.user.role == 'Judge')
    {
        let judge = await Judge.findById(req.user._id).populate('cases');
        return res.render("users/judgeProfile.ejs",{judge});
    }
    else
    if(req.user.role == 'Convict')
    {
        let convict = await Convict.findById(req.user._id).populate('cases').populate('chargeSheet');
        return res.render("users/convictProfile.ejs",{convict});
    }
    else
    if(req.user.role == 'Steagnographer')
    {
        let stenographer = await Steagnographer.findById(req.user._id).populate('assignedCases');
        return res.render("users/steagnographerProfile.ejs",{stenographer});
    }
    else
    if(req.user.role == 'Prosecutor')
    {
        let prosecutor = await Prosecutor.findById(req.user._id);
        return res.render("users/prosecutorProfile.ejs",{prosecutor});
    }
}

module.exports.renderSignUpForm = (req, res) => {
    res.render('users/signup.ejs');
};


module.exports.handleLogout = (req, res, next) => {
    req.logout((err) => { // Correct method name is 'logout' instead of 'logOut'
        if (err) {
            return next(err);
        }

        console.log("Logged out successfully");

        req.flash("success", "You logged out successfully.");
        res.redirect("/");
    });
};


module.exports.chargeSheet = async(req,res)=>{
    
    res.render('users/chargesheet');
}

module.exports.handleSignUp = (req,res)=>{
    let { username, email, password,role,legalAidRole} = req.body;
    if(!req.session.tempData)
    {
        req.session.tempData = {};
    }
    req.session.tempData = {
        username,email,password,role,legalAidRole
    }
    console.log("Username is - ",username);
    console.log("email is - ",email);
    console.log("password is - ",password);
    console.log("role is - ",role);
    console.log("sub - role is - ",legalAidRole);
    
    if(role=='convict')
    {
        res.render('users/convictSignUpForm.ejs')
    }
    else
    if(role == 'legal_aid_provider' && legalAidRole=='lawyer')
    {
        res.render('users/lawyerSignUpForm.ejs')
    }
    else
    if(role == 'legal_aid_provider' && legalAidRole=='judge')
    {
        res.render('users/judgeSignUpForm.ejs')
    }
    else
    if(role=='legal_aid_provider' && legalAidRole=='stenographer')
    {
        res.render('users/stenographerSignUpForm.ejs')
    }
    else
    if(role == 'legal_aid_provider' && legalAidRole=='prosecutor')
    {
        res.render('users/prosecutorSignUpForm.ejs')
    }
    else
    if(role == 'legal_aid_provider' && legalAidRole=='supervisor')
    {
        res.render('users/home.ejs',{isLogedIn})
    }
};


module.exports.handleLawyerSubmit = async (req, res, next) => {
    try {
        let { username, password, email } = req.session.tempData;
        delete req.session.tempData;
        let { name, educationStatus, experience, specialty, age, phone, address, availabilityStatus } = req.body;
        let role = 'Lawyer';

        // Create new lawyer object
        let newUser = new Lawyer({
            username,
            name,
            contactDetails: {
                email,
                phone,
                address
            },
            educationStatus,
            experience,
            specialty,
            age,
            availabilityStatus,
            role
        });

        // Register the new lawyer (hash password)
        await Lawyer.register(newUser, password);

        // Log in the newly created user
        req.login(newUser, async (err) => {
            if (err) {
                return next(err);
            }

            // Populate the lawyer's cases
            await Lawyer.findById(newUser._id).populate('cases').exec(function (err, populatedLawyer) {
                if (err) {
                    return next(err);
                }
                
                // Flash success message and render the profile with populated cases
                req.flash("success", "Welcome to LegalAid portal.");
                res.render("/");
            });
        });

    } catch (error) {
        console.error('Error inserting lawyer:', error);
        next(new ExpressError(error));
    }
};


module.exports.handleConvictSubmit = async (req, res, next) => {
    try {
        let { username, password, email } = req.session.tempData;
        delete req.session.tempData;
        let { name, phone, address, identityProof, age, employmentStatus, parentsName, parentsPhoneno, parentsAddress, parentsHighlights, chargesheetNo } = req.body;
        let role = 'Convict';
        let newUser = new Convict({
            username,
            name,
            contactDetails: {
                phone,
                address
            },
            email,
            identityProof,
            age,
            employmentStatus,
            familyBackground: {
                parentsInfo: {
                    name: parentsName,
                    phoneno: parentsPhoneno,
                    address: parentsAddress
                },
                highlights: parentsHighlights
            },
            chargeSheetNos: chargesheetNo,
            role
        });

        await Convict.register(newUser, password);

        req.login(newUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success","Welcome to LegalAid portal.");
            res.redirect("/");
        });

    } catch (error) {
        console.error('Error inserting convict:', error);
        next(new ExpressError(error));
    }
};

module.exports.handleSteagnographerSubmit = async (req, res, next) => {
    try {
        let { username, password, email } = req.session.tempData;
        delete req.session.tempData;
        let { name, phone } = req.body;
        let role = 'Steagnographer';

        let newUser = new Steagnographer({
            username,
            name,
            contactDetails: {
                phone,
                email
            },
            role
        });

        await Steagnographer.register(newUser, password);

        req.login(newUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success","Welcome to LegalAid portal.")
            res.redirect("/");
        });

    } catch (error) {
        console.error('Error inserting stenographer:', error);
        next(new ExpressError(error));
    }
};

module.exports.handleProsecutorSubmit = async (req, res, next) => {
    try {
        let { username, password, email } = req.session.tempData;
        delete req.session.tempData;

        let { name, phone, policeStation, policeId } = req.body;

        let role = 'Prosecutor';
        let profilePictureURL = req.file ? req.file.path : null; // Use the Cloudinary URL if file is uploaded

        let newUser = new Prosecutor({
            username,
            name,
            contactDetails: {
                phone,
                email
            },
            policeStation,
            profilePictureURL,
            role,
            policeId
        });

        await Prosecutor.register(newUser, password);

        req.login(newUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to LegalAid portal.");
            res.redirect("/");
        });

    } catch (error) {
        console.error('Error inserting prosecutor:', error);
        next(new ExpressError(error));
    }
};

module.exports.handleJudgeSubmit = async (req, res, next) => {
    try {
        let { username, password, email } = req.session.tempData;
        delete req.session.tempData;
        let { name, phone, position } = req.body;
        let role = 'Judge';

        let newUser = new Judge({
            username,
            name,
            contactDetails: {
                phone,
                email
            },
            position,
            role
        });

        await Judge.register(newUser, password);

        req.login(newUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success","Welcome to LegalAid portal.")
            res.redirect("/");
        });

    } catch (error) {
        console.error('Error inserting judge:', error);
        next(new ExpressError(error));
    }
};
