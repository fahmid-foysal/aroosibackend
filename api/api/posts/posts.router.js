const { addPost, usersPosts, getFeed, addReact, addComment, showReacts, showComments, reportPost } = require("./posts.controller");
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
    { name: "image_path", maxCount: 1 }
  ]),
  [
  ],
  checkUser,
  addPost
);



router.post(
  "/react/:post_id",
  [
    param('post_id').notEmpty().withMessage('post_id is required').isInt().withMessage("Post is is an integer field")
  ],
  checkUser,
  addReact
);


router.post(
  "/add-comment",
  [
    body('post_id').notEmpty().withMessage('post_id is required').isInt().withMessage("Post is is an integer field"),
    body('comment').notEmpty().withMessage('comment is required')
  ],
  checkUser,
  addComment
);



router.post(
  "/add-comment",
  [
    body('post_id').notEmpty().withMessage('post_id is required').isInt().withMessage("Post is is an integer field"),
    body('comment').notEmpty().withMessage('comment is required')
  ],
  checkUser,
  addComment
);




router.post(
  "/report",
  [
    body('post_id').notEmpty().withMessage('post_id is required').isInt().withMessage("Post is is an integer field"),
    body('report_text').notEmpty().withMessage('report text is required')
  ],
  checkUser,
  reportPost
);



router.get(
  "/my",
  [
  ],
  checkUser,
  usersPosts
);



router.get(
  "/feed",
  [
  ],
  checkUser,
  getFeed
);

router.get(
  "/get-reacts",
  [
  ],
  checkUser,
  showReacts
);

router.get(
  "/get-comments",
  [
  ],
  checkUser,
  showComments
);


module.exports = router;