const { createUser, loginUser, getUserProfile, sendMail, otpVerification, getAllCountries, getCities, editUserProfile, getFilteredUsersController, friendRequest, acceptRequest, receivedRequest, sentRequest, getAllFriends, friendProfile, unfriendUser, block } = require("./user.controller");
const { checkUser, checkToken } = require("../../middleware/auth");
const router = require("express").Router();
const { body, param } = require("express-validator");
const multer = require("multer");
const path = require("path");



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});



const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) cb(null, true);
  else cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed"));
};

const upload = multer({ storage, fileFilter });



router.post(
  "/create",
    upload.fields([
    { name: "pro_path", maxCount: 1 },
    { name: "image_one", maxCount: 1 }, 
    { name: "image_two", maxCount: 1 } 
  ]),
  [
    body("email").notEmpty().withMessage("email is required"),
    body("phone").notEmpty().withMessage("phone is required"),
    body("name").notEmpty().withMessage("name is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("gender").notEmpty().withMessage("gender is required"),
    body("dob").notEmpty().withMessage("dob is required"),
    body("country").notEmpty().withMessage("country is required"),
    body("city").notEmpty().withMessage("city is required"),
    body("partner_age_start").notEmpty().withMessage("partner_age_start is required").isInt().withMessage("partner_age_start must be integer"),
    body("partner_age_end").notEmpty().withMessage("partner_age_end is required").isInt().withMessage("partner_age_end must be integer"),
  ],
  createUser
);

router.post("/login", loginUser);

// Protected routes
router.get("/profile", checkUser, getUserProfile);


router.post("/send-otp", 
  [
    body('email').notEmpty().withMessage("Email is required"),
    body('otp_method').notEmpty().withMessage('Otp method is required')    .isIn(['signup', 'reset'])
    .withMessage("Item must be one of: signup, reset")

  ],

  sendMail

);

router.post("/verify-otp", 
  [
    body('email').notEmpty().withMessage("Email is required"),
    body('otp').notEmpty().withMessage('Otp is required')
  ],
  otpVerification

);


router.get("/countries", 
  [],
  getAllCountries

);

router.get("/cities/:country", 
  [param('country').notEmpty().withMessage('country is required')],
  getCities

);


router.put("/update", 
  [],
  checkUser,
  editUserProfile

);

router.get("/friend-suggestions", checkUser, getFilteredUsersController);



router.post("/send-request", 
  [
    body('receiver_id').notEmpty().withMessage("User id of receiver is required").isInt()
  ],
    checkUser,
  friendRequest

);


router.post("/unfriend", 
  [
    body('receiver_id').notEmpty().withMessage("User id of receiver is required").isInt()
  ],
    checkUser,
  unfriendUser

);





router.post("/block", 
  [
    body('blocked_id').notEmpty().withMessage("Blocked user id is required").isInt()
  ],
    checkUser,
  block

);





router.put("/accept-request", 
  [
    body('id').notEmpty().withMessage("id of request is required").isInt()
  ],
    checkUser,
  acceptRequest

);

router.get("/friend-requests", checkUser, receivedRequest);


router.get("/sent-requests", checkUser, sentRequest);

router.get("/all-friends", checkUser, getAllFriends);


router.get("/friend-profile/:user_id", 
  [
    param('user_id').notEmpty().withMessage("id of user is required").isInt()
  ],
    checkUser,
  friendProfile

);


module.exports = router;