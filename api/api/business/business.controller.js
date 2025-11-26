const fs = require("fs");
const path = require("path");
const { create, getBusinesses, review, getReviews } = require("./business.service");
const { validationResult } = require("express-validator");

module.exports = {
  createBusiness: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: errors.array(),
      });
    }

    if (!req.files.cover_path) {
      return res.status(400).json({
        status: "error",
        message: "Cover image is required",
      });
    }

    const body = req.body;
    body.user_id = req.user.user.id;
    body.cover_path = req.files.cover_path[0].path;

    const filePath = path.join(__dirname, "../users/grouped_countries_cities.json");
    const rawData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(rawData);
    if(body.latitude === null || body.latitude === null){
    body.latitude = data[body.country][body.city].lat;
    body.longitude = data[body.country][body.city].long;        
    }
        


    create(body, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          status: "error",
          message: err.message || "Database connection error",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Business profile created successfully",
      });
    });
  },

  // 🆕 Controller for GET businesses
  getBusinesses: (req, res) => {
    const { latitude, longitude, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const filters = {
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      search: search ? search.trim() : null,
      limit,
      offset,
    };

    getBusinesses(filters, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          status: "error",
          message: "Database query failed",
        });
      }

      return res.status(200).json({
        status: "success",
        page: parseInt(page),
        limit: parseInt(limit),
        businesses: results,
      });
    });
  },
  
  
    addReview: (req, res) => {
        
            const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: errors.array(),
      });
    }

    const body = req.body;

    body.user_id = req.user.user.id;

      review(body, (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            status: "error",
            message: err.message || "Database connection error",
          });
        }

        return res.status(200).json({
          status: "success",
          message: "Review created successfully"
        });
      });
  },
  
  
      getBusinessReviews: (req, res) => {
        
            const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: errors.array(),
      });
    }

    const body = req.params.business_id;
    
      getReviews(body, (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            status: "error",
            message: err.message || "Database connection error",
          });
        }

        return res.status(200).json({
          status: "success",
          data: results
        });
      });
  },
  
  
  
};
