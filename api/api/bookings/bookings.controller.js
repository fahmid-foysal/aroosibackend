const { validationResult } = require("express-validator");
const { createGuest, searchGuests, createBooking, createBookingMembers, getBookings, addRoomService, addPayment, addRooms, updateCheckout, migrate, checkout, getSingleBooking, bookingDetails, dueList, getAllGuest, addImages, bookingImages } = require("./bookings.service");

module.exports = {
  addGuest: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
    }

    if (!req.files.sig_path || !req.files.img_path || !req.files.id_back || !req.files.id_front) {
      return res.status(400).json({
        status: "error",
        message: "sig_path, img_path, id_back, and id_front images are required"
      });
    }

    const body = {
      id_type: req.body.id_type,
      id_no: req.body.id_no,
      father_name: req.body.father_name,
      profession: req.body.profession,
      age: req.body.age,
      gender: req.body.gender,
      phone: req.body.phone,
      emergency_name: req.body.emergency_name,
      emergency_phone: req.body.emergency_phone,
      country: req.body.country,
      address: req.body.address,
      name: req.body.name,
      visa_no: req.body.visa_no,
      visa_expiry_date: req.body.visa_expiry_date,
      visa_type: req.body.visa_type,
      spouse_name: req.body.spouse_name,
      email: req.body.email,
      sig_path: req.files.sig_path[0].path,
      img_path: req.files.img_path[0].path,
      id_back: req.files.id_back[0].path,
      id_front: req.files.id_front[0].path,
      spouse_id_back: req.files.spouse_id_back ? req.files.spouse_id_back[0].path : null,
      spouse_id_front: req.files.spouse_id_front ? req.files.spouse_id_front[0].path : null
    };

    createGuest(body, (err, results) => {
      if (err) {
        console.error("DB Insert Error:", err);
        return res.status(500).json({
          status: "error",
          message: "Database error"
        });
      }

      return res.status(201).json({
        status: "success",
        message: "Guest added successfully",
        guest_id: results.insertId,
        name : body.name
      });
    });
  },

  searchGuest: (req, res) => {
    const search = req.query.search || "";
    if (!search) {
      return res.status(400).json({
        status: "error",
        message: "Search parameter is required"
      });
    }

    searchGuests(search, (err, results) => {
      if (err) {
        console.error("DB Search Error:", err);
        return res.status(500).json({
          status: "error",
          message: "Database error"
        });
      }

      return res.status(200).json({
        status: "success",
        data: results
      });
    });
  },

createBooking: (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "error", message: errors.array() });
  }

  if (!req.files.sig_path) {
    return res.status(400).json({
      status: "error",
      message: "sig_path and id_front image is required"
    });
  }

  let {
    date,
    company_id,
    agent_id,
    source_id,
    purpose_id,
    paid,
    plan_id,
    guest_id,
    method_id,
    reference_name,
    drop_address,
    pickup_address,
    pickup_flight,
    drop_flight,
    total_pax,
    adult_pax,
    child_pax,
    notes,
    rooms
  } = req.body;

  const sig_path = req.files?.sig_path?.[0]?.path || null;
  const user_id = req.user.user.id;
  
  

//   if (!date || !purpose_id || !guest_id || !method_id || !total_pax) {
//     return res.status(400).json({
//       status: "error",
//       message: "date, purpose_id, guest_id, method_id, and total_pax are required"
//     });
//   }

  // ✅ Fix: parse if rooms is a string
  if (typeof rooms === "string") {
    try {
      rooms = JSON.parse(rooms);
    } catch (e) {
      return res.status(400).json({
        status: "error",
        message: "Invalid rooms format"
      });
    }
  }

  if (!Array.isArray(rooms) || rooms.length === 0) {
    return res.status(400).json({
      status: "error",
      message: "At least one room is required"
    });
  }

  for (let room of rooms) {
    if ( room.discount === undefined || !room.rate || !room.check_in_date || !room.check_out_date || !room.room_id) {
      return res.status(400).json({
        status: "error",
        message: "Each booking room must have discount, rate, check_in_date, check_out_date, and room_id"
      });
    }
  }

  const bookingData = {
    date, company_id, agent_id, source_id, purpose_id, paid, plan_id, guest_id, method_id,
    reference_name, drop_address, pickup_address, pickup_flight, drop_flight, total_pax, adult_pax, child_pax,
    sig_path,  user_id, notes
  };

  createBooking(bookingData, rooms, (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({
        status: "error",
        message: "Database error",
        detail: err
      });
    }

    return res.status(201).json({
      status: "success",
      message: "Booking created successfully",
      booking_id: result.booking_id
    });
  });
},




createMembers: (req, res) => {
  try {
    if (!req.body.members) {
      return res.status(400).json({
        status: "error",
        message: "members field is required as JSON string"
      });
    }

    if (!req.body.booking_id) {
      return res.status(400).json({
        status: "error",
        message: "booking_id is required"
      });
    }

    let members;
    try {
      members = JSON.parse(req.body.members);
    } catch (err) {
      return res.status(400).json({
        status: "error",
        message: "Invalid JSON in members field"
      });
    }


  const bookingId = parseInt(req.body.booking_id, 10);
  



    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "members must be a non-empty array"
      });
    }

    const membersData = [];

    for (let i = 0; i < members.length; i++) {
      const m = members[i];

      if (!m.name || !m.phone || !m.gender || !m.id_type || !m.id_no || !m.relation) {
        return res.status(400).json({
          status: "error",
          message: `Member at index ${i} is missing required fields`
        });
      }

      // Find files by fieldname + index
      const frontFile = req.files.find(f => f.fieldname === `front_path[${i}]`);
      const backFile = req.files.find(f => f.fieldname === `back_path[${i}]`);
      const imgFile = req.files.find(f => f.fieldname === `img_path[${i}]`);
      const sigFile = req.files.find(f => f.fieldname === `sig_path[${i}]`);

      if (!frontFile || !backFile) {
        return res.status(400).json({
          status: "error",
          message: `Member at index ${i} must have front_path[${i}] and back_path[${i}] files`
        });
      }

      membersData.push([
        m.name,
        m.phone,
        m.email || null,
        m.age || null,
        m.id_type,
        m.id_no,
        m.gender,
        m.relation,
        imgFile ? imgFile.path : null,
        sigFile ? sigFile.path : null,
        backFile.path,
        frontFile.path,
        bookingId
      ]);
    }

    createBookingMembers(membersData, (err, results) => {
      if (err) {
        console.error("DB Insert Error:", err);
        return res.status(500).json({
          status: "error",
          message: "Database error"
        });
      }

      return res.status(201).json({
        status: "success",
        message: "Booking members added successfully",
        inserted_count: results.affectedRows
      });
    });

  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
},

showBookings: (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const data = {
    branch_id: req.query.branch_id,   // required
    booking_id: req.query.booking_id || null,
    guest_id: req.query.guest_id || null,
    category_id: req.query.category_id || null,
    room_no: req.query.room_no || null,
    check_in_date: req.query.check_in_date || null,
    check_out_date: req.query.check_out_date || null,
    booking_date_from: req.query.booking_date_from || null,
    booking_date_to: req.query.booking_date_to || null
  };
  
  if(!data.branch_id){
            return res.status(400).json({
        status: "error",
        message: "Branch id is required"
      });
  }

  getBookings(data, page, limit, (err, results, totalRecords, totalPages) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }

    res.json({
      status: "success",
      currentPage: page,
      totalPage: totalPages,
      totalRecord: totalRecords,
      limit: limit,
      data: results
    });
  });
},





  addService: (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }

    const body = req.body;

        addRoomService(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Room Service added successfully"
            });
        });
},



makePayment: (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }

  const body = req.body;
  const user_id = req.user.user.id;
  body.user_id = user_id;



  addPayment(body, (err, results, today) => {
      if (err) {
          console.log(err);
          return res.status(500).json({
              status: "error",
              message: "Database connection error"
          });
      }

     let response_body = []

     paymentId = results.insertId
     let totalAmount = 0

    body.payments.forEach(element => {
      element.voucher_no = paymentId
      response_body.push(element)

      paymentId +=1;
      totalAmount +=element.amount

    });


      return res.status(200).json({
          status: "success",
          message: "Payments added successfully",
          data: response_body,
          date : today,
          total_amount: totalAmount
      });
  });
},





 addBookingRooms: (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }

    const body = req.body;
    body.rooms.forEach(room => {

          if ( room.discount === undefined || !room.rate || !room.check_in_date || !room.check_out_date || !room.room_id) {
      return res.status(400).json({
        status: "error",
        message: "Each booking room must have discount, rate, check_in_date, check_out_date, and room_id"
      });
    }
      
    });

        addRooms(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Room added successfully"
            });
        });
},

 editCheckout: (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }

    const body = req.body;

        updateCheckout(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }
            if(results.rowCount == 0){
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Room not found or not checked_in"
                });

            }

            return res.status(200).json({
                status: "success",
                message: "Checkout date updated successfully"
            });
        });
},





 migrateRooms: (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }

    const body = req.body;

        migrate(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: err.message
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Room migrated successfully"
            });
        });
},

 checkoutRooms: (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }

    const body = req.body;

        checkout(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            if(results.changedRows == 0){
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Room not found or not checked_in"
                });

            }

            return res.status(200).json({
                status: "success",
                message: "Checkout Successful",
                results: results
            });
        });
},


 bookingGuestInfo: (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }

    const body = req.params;

        getSingleBooking(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: err
                });
            }

            return res.status(200).json({
                status: "success",
                data: results
            });
        });
},

 detailedBooking: (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }

    const booking_id = req.params.booking_id;

        bookingDetails(booking_id, (err, booking, rooms, members, services, res_items, payments, totals) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: err
                });
            }
            const baseUrl = "https://api.hotelerp.xyz/"

            members.forEach(element => {
              element.img_path = baseUrl+element.img_path
            });
            booking[0].sig_path = baseUrl+booking[0].sig_path
            booking[0].guest_img = baseUrl+booking[0].guest_img

            return res.status(200).json({
                status: "success",
                bookingInfo: booking,
                rooms: rooms,
                members: members,
                services: services,
                restuarant_items: res_items,
                payments: payments,
                totals: totals
            });
        });
},


 bookingDueList: (req, res) => {
     


        dueList( (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: err
                });
            }

            return res.status(200).json({
                status: "success",
                data: results
            });
        });
},



showGuests: (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;



  getAllGuest(page, limit, (err, results, totalRecords, totalPages) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }
    const baseUrl = "https://api.hotelerp.xyz/"


    results.forEach(element => {
      element.sig_path = baseUrl+element.sig_path
      element.img_path = baseUrl+element.img_path
      element.id_front = baseUrl+element.id_front
      element.id_back = baseUrl+element.id_back
      element.spouse_id_back = baseUrl+element.spouse_id_back
      element.spouse_id_front = baseUrl+element.spouse_id_front
    });

    res.json({
      status: "success",
      currentPage: page,
      totalPage: totalPages,
      totalRecord: totalRecords,
      limit: limit,
      data: results
    });
  });
},





 addBookingImages: (req, res) => {

    const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }

    const imageFile = req.file; 

    if (!imageFile) {
      return res.status(400).json({
        status: "error",
        message: `image_file is required`
      });
    }

    const body = {
        image_path : imageFile.path,
        booking_id :  req.body.booking_id
    }


        addImages(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: err
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Image added successfully"
            });
        });
},



 getBookingImages: (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }

    const body = req.params.booking_id;

        bookingImages(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: err
                });
            }


            const baseUrl = "https://api.hotelerp.xyz/"


          results.forEach(element => {
            element.image_path = baseUrl+element.image_path
          });



            return res.status(200).json({
                status: "success",
                data: results
            });
        });
},




};
