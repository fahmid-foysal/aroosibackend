const { createPurpose, createMethod, createSource, createPlan, getConfig, createAgent, createAffiliatedCompany, createDisType, createRoomService, deleteConfig, editPurpose, editPlan, editSource, editAgent, editAffiliatedCompany, editMethod, editDisType, editRoomService } = require("./booking-config.service");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult, body } = require("express-validator");

module.exports = {
  
    addPurpose: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;

        createPurpose(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Purpose addedd successfully"
            });
        });
    },


    updatePurpose: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;

        editPurpose(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Purpose updated successfully"
            });
        });
    },







    addPlan: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;

        createPlan(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Plan addedd successfully"
            });
        });
    },






    updatePlan: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;

        editPlan(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Plan updated successfully"
            });
        });
    },





    addMethod: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;

        createMethod(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Payment method addedd successfully"
            });
        });
    },



    updateMethod: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;

        editMethod(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Payment method updated successfully"
            });
        });
    },


    addSource: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;

        createSource(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Source addedd successfully"
            });
        });
},




   updateSource: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;

        editSource(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Source updated successfully"
            });
        });
},






    addCompany: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;

        createAffiliatedCompany(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Company addedd successfully"
            });
        });
    },



    updateCompany: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;

        editAffiliatedCompany(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Company updated successfully"
            });
        });
    },





    addAgent: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;

        createAgent(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Agent addedd successfully"
            });
        });
    },



    updateAgent: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;

        editAgent(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Agent updated successfully"
            });
        });
    },


    addDisType: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;

        createDisType(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Discount type added successfully"
            });
        });
},



    updateDisType: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;

        editDisType(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Discount type updated successfully"
            });
        });
},






    addRoomService: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;

        createRoomService(body, (err, results) => {
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



    updateRoomService: (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = req.body;

        editRoomService(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Room Service updated successfully"
            });
        });
    },






 showConfig: (req, res) => {
     
     
         const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = {
        item : req.params.item
    }


        getConfig(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                status: "success",
                data: results
            });
        });
},




 delConfig: (req, res) => {
     
              const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", "message": errors.array() });
    }

    const body = {
        item : req.params.item,
        id :  req.params.id
    }


        deleteConfig(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Delete restricted! This item might be used somewhere",
                    message2: err
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Deleted successfully"
            });
        });
},




};
