const express = require("express");
const router = express.Router();
const { body, query, param } = require("express-validator");
const { addGuest, searchGuest, createBooking, createMembers, showBookings, addService, makePayment, addBookingRooms, editCheckout, migrateRooms, checkoutRooms, bookingGuestInfo, detailedBooking, bookingDueList, showGuests, addBookingImages, getBookingImages } = require("./bookings.controller");
const multer = require("multer");
const path = require("path");
const { checkUser, authorize } = require("../../middleware/auth");

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

router.post(
  "/guests/upload",
  upload.fields([
    { name: "sig_path", maxCount: 1 },
    { name: "img_path", maxCount: 1 },
    { name: "id_back", maxCount: 1 },
    { name: "id_front", maxCount: 1 },
    { name: "spouse_id_back", maxCount: 1 }, 
    { name: "spouse_id_front", maxCount: 1 } 
  ]),
  [
    body("id_type").notEmpty(),
    body("name").notEmpty(),
    body("id_no").notEmpty(),
    body("father_name").notEmpty(),
    body("profession").notEmpty(),
    body("age").notEmpty(),
    body("gender").notEmpty(),
    body("phone").notEmpty(),
    body("emergency_name").notEmpty(),
    body("emergency_phone").notEmpty(),
    body("country").notEmpty(),
    body("address").notEmpty(),
  ],
  checkUser, authorize("front_office", "create"),
  addGuest
);

router.get(
  "/guests/search",
  [query("search").notEmpty().withMessage("Search query required")],
  checkUser, authorize("front_office", "view"),
  searchGuest
);

// NEW booking creation route
router.post(
  "/create",
    upload.fields([
    { name: "sig_path", maxCount: 1 }
  ]),
  [
    body("date").notEmpty(),
    body("paid").notEmpty(),
    body("purpose_id").notEmpty(),
    body("guest_id").notEmpty(),
    body("plan_id").notEmpty(),
    body("source_id").notEmpty(),
    body("total_pax").notEmpty(),
    body("rooms").notEmpty()
  ],
  checkUser, authorize("front_office", "create"),
  createBooking
);

router.post(
  "/members/create",
  upload.any(), // accept any file
  checkUser, authorize("front_office", "create"),
  createMembers
);

router.get(
  "/",
  checkUser, authorize("front_office", "view"),
  showBookings
);

router.post("/add/service", 
  [
    body('booking_id').notEmpty().withMessage("Booking Id is required"),
    body('service_id').notEmpty().withMessage("Service Id is required"),
    body('amount').notEmpty().withMessage("Amount required"),
  ],
  checkUser, authorize("front_office", "create"),

  addService

);




router.post("/add/payment", 
  [
    body('booking_id')
      .notEmpty().withMessage("Booking Id is required")
      .isInt().withMessage("Booking Id must be integer"),

    body('payments')
      .notEmpty().withMessage("payments is required")
      .isArray({ min: 1 }).withMessage("payments must be a non-empty array"),

    body('payments.*.method_id')
      .not().isEmpty().withMessage("Each payment must have a method_id")
      .isInt().withMessage("Method Id must be integer"),

    body('payments.*.amount')
      .not().isEmpty().withMessage("Each payment must have a amount")
      .isNumeric().withMessage("amount must be a number"),


    body('payments.*.type')
      .not().isEmpty().withMessage("Each payment must have a type"),
  ],
  checkUser, authorize("front_office", "create"),

  makePayment

);




router.post(
  "/add/rooms",
  [
    body('booking_id')
      .notEmpty().withMessage("Booking Id is required")
      .isInt().withMessage("Booking Id must be integer"),

    body('rooms')
      .notEmpty().withMessage("rooms is required")
      .isArray({ min: 1 }).withMessage("rooms must be a non-empty array"),

    body('rooms.*.discount')
      .not().isEmpty().withMessage("Each room must have a discount"),

    body('rooms.*.rate')
      .not().isEmpty().withMessage("Each room must have a rate")
      .isNumeric().withMessage("Rate must be a number"),

    body('rooms.*.check_in_date')
      .not().isEmpty().withMessage("Each room must have a check_in_date")
      .isISO8601().withMessage("check_in_date must be a valid date"),

    body('rooms.*.check_out_date')
      .not().isEmpty().withMessage("Each room must have a check_out_date")
      .isISO8601().withMessage("check_out_date must be a valid date"),

    body('rooms.*.room_id')
      .not().isEmpty().withMessage("Each room must have a room_id")
      .isInt().withMessage("room_id must be integer"),
  ],
  checkUser,
  authorize("front_office", "create"),
  addBookingRooms
);


router.put("/update/checkout", 
  [
    body('check_out_date').notEmpty().withMessage("check_out_date is required"), 
    body('room_id').notEmpty().withMessage("room_id is required").isInt().withMessage("Room Id must be an Integer"), 
  ],
  checkUser, authorize("front_office", "edit"),

  editCheckout

);


router.post("/migrate", 
  [
    body('rate').notEmpty().withMessage("Rate is required").isNumeric().withMessage("Rate must be numeric"), ,
    body('room_id').notEmpty().withMessage("room_id is required").isInt().withMessage("Room Id must be an Integer"),
    body('room_id_next').notEmpty().withMessage("room_id_next is required").isInt().withMessage("Room Id next must be an Integer")
  ],
  checkUser, authorize("front_office", "edit"),
  migrateRooms
);



router.put("/checkout", 
  [
    body('room_id').notEmpty().withMessage("room_id is required").isInt().withMessage("Room Id must be an Integer"), 
  ],
  checkUser, authorize("front_office", "edit"),

  checkoutRooms

);


router.get("/guest-info/:room_id", 
  [
    param('room_id').notEmpty().withMessage("room_id is required").isInt().withMessage("Room Id must be an Integer"), 
  ],
  checkUser, authorize("front_office", "view"),

  bookingGuestInfo

);


router.get("/details/:booking_id", 
  [
    param('booking_id').notEmpty().withMessage("booking_id is required").isInt().withMessage("booking_id must be an Integer"), 
  ],
  checkUser, authorize("front_office", "view"),

  detailedBooking

);


router.get("/due-list", [],

  checkUser, authorize("front_office", "view"),

  bookingDueList

);


router.get("/guest-list", [],

  checkUser, authorize("front_office", "view"),

  showGuests

);


router.post(
  "/add-image",
  upload.single("image_path"),
  [
    body("booking_id").notEmpty().withMessage("booking_id is required").isInt().withMessage("Booking Id must be an integer")
  ],
  checkUser, authorize("front_office", "create"),
  addBookingImages
);




router.get("/images/:booking_id", 
  [
    param('booking_id').notEmpty().withMessage("booking_id is required").isInt().withMessage("booking_id must be an Integer"), 
  ],
  checkUser, authorize("front_office", "view"),

  getBookingImages

);


module.exports = router;
