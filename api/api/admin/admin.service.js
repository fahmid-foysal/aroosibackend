const pool = require("../../config/database");

module.exports = {
    create: (data, callBack) => {
        pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [data.name, data.email, data.password, "admin"],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },

    getUserByPhone: (email, callBack) => {
        pool.query(
            'SELECT * FROM users WHERE email = ? AND role = ?',
            [email, "admin"],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results[0]);
            }
        );
    },


    createBranch: (data, logo_path, callBack) => {
        pool.query(
            'INSERT INTO branches (branch_name, address, phone_one, phone_two, email, bin, trade_lin, logo_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [data.branch_name, data.address, data.phone_one, data.phone_two, data.email, data.bin, data.trade_lin, logo_path],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    
        editBranch: (data, logo_path, callBack) => {
        pool.query(
            'UPDATE branches SET branch_name = ?, address = ?, phone_one = ?, phone_two = ?, email = ?, bin = ?, trade_lin = ?, logo_path = ? WHERE id = ?',
            [data.branch_name, data.address, data.phone_one, data.phone_two, data.email, data.bin, data.trade_lin, logo_path, data.id],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    
    
    

    getAllBranch: (callBack) => {
        pool.query(
            'SELECT id, branch_name, address, phone_one, phone_two, email, bin, trade_lin, logo_path FROM branches',
            [],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },







deleteItem: (data, callBack) => {
    const tableMap = {
        audios: 'audios',
        quotes: 'quotes',
        featured: 'featured',
        visuals: 'visual_assets'
    };

    const tableName = tableMap[data.table];
    if (!tableName) {
        return callBack(new Error('Invalid table name'));
    }

    pool.query(
        `DELETE FROM ${tableName} WHERE id = ?`,
        [data.id],
        (error, results) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results); // or results.affectedRows
        }
    );
},



deleteKeyword: (data, callBack) => {
    const tableMap = {
        audio: 'audio_keywords',
        quote: 'quote_keywords',
        visual: 'visual_keywords'
    };

        const columnMap = {
        audio: 'audio_id',
        quote: 'quote_id',
        visual: 'visual_id'
    };

    const tableName = tableMap[data.table];
    const columnName = columnMap[data.table];


    if (!tableName) {
        return callBack(new Error('Invalid table name'));
    }

    pool.query(
        `DELETE FROM ${tableName} WHERE ${columnName} = ? AND keyword = ?`,
        [data.item_id, data.keyword],
        (error, results) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results); // or results.affectedRows
        }
    );
}


};
