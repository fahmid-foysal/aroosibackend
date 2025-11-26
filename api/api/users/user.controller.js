const { create, getUserByPhone, sendOtp, verifyOtp, getProfile, updateProfile, getFilteredUsers, friendReq, updateReq, receivedRequests, sentRequests, allfriends, getFriend, unfriend, blockUser } = require("./user.service");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

module.exports = {
  createUser: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ status: "error", message: errors.array() });
    }

    if(!req.files.pro_path){
        return res.status(400).json({
        status: "error",
        message: "Profile image is required"
      });
    }

    const body = req.body;
    body.pro_path = req.files.pro_path[0].path
    body.image_one = req.files.image_one ? req.files.image_one[0].path : null
    body.image_two = req.files.image_two ? req.files.image_two[0].path : null
    const otp = req.headers['otp'];
    const filePath = path.join(__dirname, "grouped_countries_cities.json");
    const rawData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(rawData);

    body.latitude =  data[body.country][body.city].lat
    body.longitude =  data[body.country][body.city].long

    if(!otp){
        return res.status(400).json({
        status: "error",
        message: "Otp is required"
      });
    }

    getUserByPhone(body.email, (err, user) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ status: "error", message: err });
      }

      if (user) {
        return res
          .status(409)
          .json({ status: "error", message: "User already exists" });
      }

      const salt = genSaltSync(10);
      body.password = hashSync(body.password, salt);

      create(body, otp, (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            status: "error",
            message: err.message || "Database connection error",
          });
        }

        return res.status(200).json({
          status: "success",
          message: "User created successfully"
        });
      });
    });
  },


  loginUser: (req, res) => {
    const body = req.body;
    if (!body.email || !body.password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password required"
      });
    }

    getUserByPhone(body.email, (err, user) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }

      if (!user) {
        return res.status(404).json({ status: "error", message: "User not found" });
      }

      const isPasswordCorrect = compareSync(body.password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ status: "error", message: "Invalid password" });
      }

      user.password = undefined; // remove hashed password from response
      const token = jwt.sign({ user }, process.env.JWT_USER, {
        expiresIn: "30d"
      });

      return res.json({
        status: "success",
        message: "Login successful",
        token: token,
        user: user
      });
    });
  },

  getUserProfile: (req, res) => {
    const user_id = req.user.user.id;

    getProfile(user_id, (err, user) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          status: "error",
          message: "Database error"
        });
      }

      user.password = undefined; // hide password
      return res.status(200).json({
        status: "success",
        data: user
      });
    });
  },
  
  
    sendMail: (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }

  const body = req.body;

      sendOtp(body, (err, results) => {
          if (err) {
              console.log(err);
              return res.status(500).json({
                  status: "error",
                  message: "Database connection error"
              });
          }

          return res.status(200).json({
              status: "success",
              message: "Verification email sent successfully"
          });
      });
  },
  
  otpVerification: (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }

  const body = req.body;

      verifyOtp(body, (err, results) => {
          if (err) {
              console.log(err);
              return res.status(500).json({
                  status: "error",
                  message: err.message
              });
          }

          return res.status(200).json({
              status: "success",
              message: "Verification successful"
          });
      });
  },
  
  
  
    getAllCountries: (req, res) => {
    try {
        
          const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }

        
        
        
      const filePath = path.join(__dirname, "grouped_countries_cities.json");
      const rawData = fs.readFileSync(filePath, "utf8");
      const data = JSON.parse(rawData);

      const countries = Object.keys(data);

      return res.status(200).json({
        status: "success",
        total: countries.length,
        countries: countries,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: "error",
        message: "Failed to load country list",
      });
    }
  },
  
  
getCities: (req, res) => {
      const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }

    
  try {
    const filePath = path.join(__dirname, "grouped_countries_cities.json");
    const rawData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(rawData);

    const country = req.params.country; // assuming route: /getCities/:country

    if (!data[country]) {
      return res.status(404).json({
        status: "error",
        message: `Country '${country}' not found`,
      });
    }

    const cities = Object.keys(data[country]).map(cityName => ({
      city_name: cityName,
      city_id: data[country][cityName].city_id
    }));

    return res.status(200).json({
      status: "success",
      total: cities.length,
      country: country,
      cities: cities,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Failed to load city list",
    });
  }
},



  editUserProfile: (req, res) => {
    const body = req.body;
    body.id = req.user.user.id;

    updateProfile(body, (err, user) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          status: "error",
          message: err.message
        });
      }


      return res.status(200).json({
        status: "success",
        message: "user details updated"
      });
    });
  },
  
  
  
   getFilteredUsersController: (req, res) => {
    const user_id = req.user.user.id;
    const filters = req.query;

    // ✅ Pagination defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    getFilteredUsers(filters, user_id, { page, limit }, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          status: "error",
          message: "Database error",
        });
      }

      return res.status(200).json({
        status: "success",
        total: results.pagination.total,
        page: results.pagination.page,
        totalPages: results.pagination.totalPages,
        limit: results.pagination.limit,
        data: results.data,
      });
    });
  },
  
  
  
 friendRequest: (req, res) => {
     
               const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }
         
    const body = req.body;
         
    body.user_id = req.user.user.id;


    friendReq(body, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          status: "error",
          message: "Database error",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Friend request sent",
      });
    });
  },
  
  
  
   acceptRequest: (req, res) => {
     
               const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }
         
    const body = req.body.id;



    updateReq(body, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          status: "error",
          message: "Database error",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Friend request accepted",
      });
    });
  },
  
  
  
     receivedRequest: (req, res) => {
         
    const body = req.user.user.id;



    receivedRequests(body, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          status: "error",
          message: "Database error",
        });
      }

      return res.status(200).json({
        status: "success",
        data: results,
      });
    });
  },
  
       sentRequest: (req, res) => {
         
    const body = req.user.user.id;



    sentRequests(body, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          status: "error",
          message: err.message,
        });
      }

      return res.status(200).json({
        status: "success",
        data: results,
      });
    });
  },
  
  
  
  
         getAllFriends: (req, res) => {
         
    const body = req.user.user.id;



    allfriends(body, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          status: "error",
          message: "Database error",
        });
      }

      return res.status(200).json({
        status: "success",
        data: results,
      });
    });
  },
  
  
  
           friendProfile: (req, res) => {
               
                         const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }
         
    const body = req.params.user_id;



    getFriend(body, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          status: "error",
          message: "Database error",
        });
      }
      results[0].password = undefined;

      return res.status(200).json({
        status: "success",
        data: results,
      });
    });
  },
  
  
  
  
  
   unfriendUser: (req, res) => {
     
   const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }
         
    const body = req.body;
         
    body.user_id = req.user.user.id;


    unfriend(body, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          status: "error",
          message: "Database error",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Unfriended",
      });
    });
  },
  
  
  
  
  
     block: (req, res) => {
     
   const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", "message": errors.array() });
  }
         
    const body = req.body;
         
    body.user_id = req.user.user.id;


    blockUser(body, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          status: "error",
          message: "Database error",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "blocked",
      });
    });
  },
  
  
  
  


};