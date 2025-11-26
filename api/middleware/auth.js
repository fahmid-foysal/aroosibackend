const jwt = require("jsonwebtoken");
const pool = require("../config/database");

module.exports = {
    checkToken: (req, res, next) => {
        let token = req.get("authorization");
        if (token) {
            token = token.slice(7); // Remove "Bearer " prefix
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).json({
                        success: 0,
                        message: "Invalid Token"
                    });
                } else {
                    req.user = decoded;
                    next();
                }
            });
        } else {
            return res.status(403).json({
                success: 0,
                message: "Access Denied! Unauthorized user"
            });
        }
    },

        checkUser: (req, res, next) => {
        let token = req.get("authorization");
        if (token) {
            token = token.slice(7); // Remove "Bearer " prefix
            jwt.verify(token, process.env.JWT_USER, (err, decoded) => {
                if (err) {
                    return res.status(401).json({
                        success: 0,
                        message: "Invalid Token"
                    });
                } else {
                    req.user = decoded;
                    next();
                }
            });
        } else {
            return res.status(403).json({
                success: 0,
                message: "Access Denied! Unauthorized user"
            });
        }
    },

   authorize(moduleName, permissionType) {
    return (req, res, next) => {
        const userId = req.user.user.id;

        pool.query(
            'SELECT ?? AS allowed FROM user_permissions WHERE user_id = ? AND module = ?',
            [`${permissionType}_permission`, userId, moduleName],
            (err, results) => {
                if (err) return res.status(500).json({status: 'error', message: 'DB error' });

                if (!results.length || results[0].allowed !== 1) {
                    return res.status(403).json({status: "error", message: 'Permission denied' });
                }

                next();
            }
        );
    };
}


};
