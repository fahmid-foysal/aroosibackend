const pool = require("../../config/database");

module.exports = {
    createPurpose: (data, callBack) => {
        pool.query(
            'INSERT INTO booking_purposes (purpose) VALUES (?)',
            [data.purpose_name],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },

    editPurpose: (data, callBack) => {
        pool.query(
            'UPDATE booking_purposes SET purpose = ? WHERE id = ?',
            [data.purpose_name, data.id],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },







    createPlan: (data, callBack) => {
        pool.query(
            'INSERT INTO booking_plan (plan_name, description) VALUES (?, ?)',
            [data.plan_name, data.description],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },


    editPlan: (data, callBack) => {
        pool.query(
            'UPDATE booking_plan SET plan_name = ?, description = ? WHERE id = ?',
            [data.plan_name, data.description, data.id],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },






    createSource: (data, callBack) => {
        pool.query(
            'INSERT INTO booking_source (source_name) VALUES (?)',
            [data.source_name],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },


    editSource: (data, callBack) => {
        pool.query(
            'UPDATE booking_source SET source_name = ?  WHERE id = ?',
            [data.source_name, data.id],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },





    createAgent: (data, callBack) => {
        pool.query(
            'INSERT INTO agents (name, phone, address, commission) VALUES (?, ?, ?, ?)',
            [data.name, data.phone, data.address, data.commission],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },


    editAgent: (data, callBack) => {
        pool.query(
            'UPDATE agents SET name = ?, phone = ?, address = ?, commission = ? WHERE id = ?',
            [data.name, data.phone, data.address, data.commission, data.id],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },







    createAffiliatedCompany: (data, callBack) => {
        pool.query(
            'INSERT INTO affiliated_companies (company_name, phone, address, discount_rate) VALUES (?, ?, ?, ?)',
            [data.company_name, data.phone, data.address, data.discount_rate],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },



    editAffiliatedCompany: (data, callBack) => {
        pool.query(
            'UPDATE affiliated_companies SET company_name = ?, phone = ?, address = ?, discount_rate = ? WHERE id = ?',
            [data.company_name, data.phone, data.address, data.discount_rate, data.id],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },








    createMethod: (data, callBack) => {
        pool.query(
            'INSERT INTO payment_methods (method, acc_no, description) VALUES (?, ?, ?)',
            [data.method, data.acc_no, data.description],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },




    editMethod: (data, callBack) => {
        pool.query(
            'UPDATE payment_methods SET method = ?, acc_no = ?, description = ? WHERE id = ?',
            [data.method, data.acc_no, data.description, data.id],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },




    createDisType: (data, callBack) => {
        pool.query(
            'INSERT INTO discount_types (type, amount, description) VALUES (?, ?, ?)',
            [data.type, data.amount, data.description],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },



    editDisType: (data, callBack) => {
        pool.query(
            'UPDATE discount_types SET type = ?, amount = ?, description = ? WHERE id = ?',
            [data.type, data.amount, data.description, data.id],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },    




    
    createRoomService: (data, callBack) => {
        pool.query(
            'INSERT INTO room_services (service_name, unit, description, price) VALUES (?, ?, ?, ?)',
            [data.service_name, data.unit, data.description, data.price],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },


    editRoomService: (data, callBack) => {
        pool.query(
            'UPDATE room_services SET service_name = ?, unit = ?, description = ?, price = ? WHERE id = ?',
            [data.service_name, data.unit, data.description, data.price, data.id],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    
    
    



    getConfig: (data, callBack) => {
        
        const dict = {
            purpose: "booking_purposes",
            plan: "booking_plan",
            source: "booking_source",
            paymentmethod: "payment_methods",
            agent: "agents",
            affiliates: "affiliated_companies",
            discounttypes: "discount_types",
            roomservice: "room_services",
            branch: "branches"
        };


        pool.query(
            `SELECT * FROM ${dict[data.item]}`,
            [],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    
    
    
        deleteConfig: (data, callBack) => {
        
        const dict = {
            purpose: "booking_purposes",
            plan: "booking_plan",
            source: "booking_source",
            paymentmethod: "payment_methods",
            agent: "agents",
            affiliates: "affiliated_companies",
            discounttypes: "discount_types",
            bookings : "bookings",
            rooms : "rooms",
            categories: "categories",
            room_services: "room_services"
        }


        pool.query(
            `DELETE FROM ${dict[data.item]} WHERE  id = ?`,
            [data.id],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    
    
    



    

  


};
