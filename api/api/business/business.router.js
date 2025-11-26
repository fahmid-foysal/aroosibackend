const { createBusiness, getBusinesses, addReview, getBusinessReviews } = require("./business.controller");
const { checkUser } = require("../../middleware/auth");
const { body, param } = require("express-validator");
const multer = require("multer");
const path = require("path");
const router = require("express").Router();

// === Multer Setup ===
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

// === Routes ===

// Create Business
router.post(
  "/create",
  upload.fields([{ name: "cover_path", maxCount: 1 }]),
  [
    body("shop_name").notEmpty().withMessage("shop_name is required"),
    body("one_liner").notEmpty().withMessage("one_liner is required"),
    body("about_us").notEmpty().withMessage("about_us is required"),
    body("services").notEmpty().withMessage("services is required"),
    body("category").notEmpty().withMessage("category is required"),
  ],
  checkUser,
  createBusiness
);


router.get("/get-businesses", checkUser, getBusinesses);


router.post(
  "/add-review",
  [
    body("business_id").notEmpty().withMessage("business_id is required").isInt(),
    body("review_text").notEmpty().withMessage("review_text is required")
  ],
  checkUser,
  addReview
);

router.get(
  "/reviews/:business_id",
  [
    param("business_id").notEmpty().withMessage("business_id is required").isInt()
  ],
  checkUser,
  getBusinessReviews
);

module.exports = router;
