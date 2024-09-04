module.exports.isLogedIn = (req,res,next)=>{
    if(!req.isAuthenticated())
    {
        req.session.redirectUrl = req.originalUrl ;
        
        
       
        //this is used beacause as we login then i should enter into the webpage i wanted i.e
        //suppose i click on new listing and i was not loggedin then it will redirect me to the login page and as i succesfully logged in i was redirecting
        // to the listings page but actually after succesfully loggedin it should go the new listing url 
        console.log("Redirection URL- ",req.session.redirectUrl);
        
        req.flash("error","You must be logged-in.");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl)
    {
    res.locals.redirectUrl = req.session.redirectUrl;
    }
    else
    {
        console.log("hii");
        
        res.locals.redirectUrl="/";
    }
       
    next();
}