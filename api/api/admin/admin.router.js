const { createUser, loginUser, getUserProfile, addBranch, showBranch, updateBranch } = require("./admin.controller");
const { checkToken } = require("../../middleware/auth");
const router = require("express").Router();
const { param, body } = require("express-validator");
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/booking_members");
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





router.post("/register", createUser);
router.post("/login", loginUser);

// Protected route
router.get("/profile", checkToken, getUserProfile);
router.get("/branches", checkToken, showBranch);

router.post("/create/branch", 
    upload.single("logo_path"),
  [
    body('branch_name').notEmpty().withMessage("Branch name is required"),
    body('address').notEmpty().withMessage("Branch address is required"),
  ],
  checkToken,

  addBranch


);


router.put("/update/branch", 
    upload.single("logo_path"),
  [
    body('branch_name').notEmpty().withMessage("Branch name is required"),
    body('address').notEmpty().withMessage("Branch address is required"),
    body('phone_one').notEmpty().withMessage("Branch phone_one is required"),
    body('phone_two').notEmpty().withMessage("Branch phone_two is required"),
    body('email').notEmpty().withMessage("Branch email is required"),
    body('bin').notEmpty().withMessage("Branch bin is required"),
    body('trade_lin').notEmpty().withMessage("Branch trade_lin is required"),
    body('id').notEmpty().withMessage('Branch id is required').isInt().withMessage('id is a integer field')
  ],
  checkToken,

  updateBranch


);




module.exports = router;
