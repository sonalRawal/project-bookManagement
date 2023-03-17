const express = require('express');
const router = express.Router();

const eventController= require('../controllers/eventController')
const userController= require('../controllers/userController')
const middleware = require('../middleware/loginmiddle')


//user api 
  router.post("/register", userController.createUser)
  router.post("/login", userController.loginUser)
 router.put("/logOut",middleware.userAuth ,userController.logOutUser)
 router.put("/changePassword",userController.changeUserPassword)
 router.put("/resetPassword/:userId",userController.resetUserPassword)
 router.put("/updatePassword/:userId", middleware.userUpdatePasswordAuth ,userController.updateUserpassword)

// // //event api
  router.post("/event", middleware.userAuth ,eventController.createEvent)
  router.get("/event", middleware.userAuth, eventController.geteventsByUserID)
  router.get("/event/allInvitedEventes",middleware.userAuth, eventController.inviteEventDetails)


module.exports = router;