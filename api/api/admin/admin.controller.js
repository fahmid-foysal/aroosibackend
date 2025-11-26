const { create, getUserByPhone, createBranch, getAllBranch, editBranch } = require("./admin.service");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

module.exports = {
    createUser: (req, res) => {
        const body = req.body;

        if (!body.password) {
            return res.status(400).json({
                success: 0,
                message: "Password is required"
            });
        }

        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);

        create(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                success: 1,
                data: results
            });
        });
    },

    loginUser: (req, res) => {

            return res.json({
                status: "success",
                message: "Login successful"
            });

    },
        getUserProfile: (req, res) => {
        const userData = req.user.user; // because you wrapped it as { user } during jwt.sign()

        getUserByPhone(userData.phone, (err, user) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database error"
                });
            }

            if (!user) {
                return res.status(404).json({
                    success: 0,
                    message: "User not found"
                });
            }

            user.password = undefined; // hide password
            return res.status(200).json({
                success: 1,
                data: user
            });
        });
    },       

    addBranch: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;
    const imageFile = req.file; 
    if(!imageFile){
                    return res.status(400).json({
                status: "error",
                message: "logo_path is required"
            });
    }
    const logo = imageFile.path;
    
        createBranch(body, logo, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Branch addess successfully"
            });
        });
},


    updateBranch: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;
    const imageFile = req.file; 
    if(!imageFile){
                    return res.status(400).json({
                status: "error",
                message: "logo_path is required"
            });
    }
    const logo = imageFile.path;
    
        editBranch(body, logo, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Branch updated successfully"
            });
        });
},



 showBranch: (req, res) => {


        getAllBranch((err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }
            
                        const baseUrl = "https://api.hotelerp.xyz/"


          results.forEach(element => {
            element.logo_path = baseUrl+element.logo_path
          });

            
            

            return res.status(200).json({
                status: "success",
                data: results
            });
        });
},





};
