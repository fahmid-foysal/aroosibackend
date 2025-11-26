const pool = require("../../config/database");
const sendMail = require("../../utils/mailer");


module.exports = {
  create: (data, otp, callBack) => {
        pool.query(
      `SELECT id FROM verification WHERE email = ? AND otp = ? AND is_verified = 1 AND expired_at > NOW()`,
      [data.email, otp],
      (error, verification_status) => {
        if (error) {
          return callBack(error);
        }
        if(verification_status.length === 0){
            return callBack(new Error("Please verify your email first"));
        }

        pool.query(
          `INSERT INTO users (name, phone, email, password, gender, dob, country, city, latitude, longitude, ethnicity, education, profession, 
          body_type, height, weight, hair_color, eye_color, skin_color, religion, religion_section, prayer_frequency, dress_code, dietary_preference, 
          marital_status, marital_duration, have_child, want_child, prefered_partner_age_start, prefered_partner_age_end, prefered_partner_distance_range, prefered_partner_religion, 
          prefered_partner_religion_section, prefered_partner_occupation, prefered_partner_education, pro_path, image_one, image_two, prefered_partner_marital_status, prefered_partner_ethnicity) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [data.name, data.phone, data.email, data.password, data.gender, data.dob, data.country, data.city, data.latitude, data.longitude,
            data.ethnicity, data.education, data.profession, data.body_type, data.height, data.weight, data.hair_color, data.eye_color,
            data.skin_color, data.religion, data.religion_section, data.prayer_frequency, data.dress_code, data.dietary_preference,
            data.marital_status, data.marital_duration, data.have_child, data.want_child, data.partner_age_start, data.partner_age_end, 
            data.partner_distance_range, data.partner_religion, data.partner_religion_section, data.partner_occupation, data.partner_education,
            data.pro_path, data.image_one, data.image_two, data.partner_marital_status, data.partner_ethnicity
          ],
          (error, results) => {
            if (error) {
              return callBack(error);
            }

            return callBack(null, results);

          }
        );  
     }
    );
  },

  
  getUserByPhone: (email, callBack) => {
    pool.query(
      `SELECT 
          u.id, u.name, u.email, u.password
       FROM users u 
       WHERE u.email=?`,
      [email],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        if (results.length === 0) {
          return callBack(null, null);
        }
        
        return callBack(null, results[0]);
      }
    );
  },



  getBranchPermissions: (id, callBack) => {
    pool.query(
      `SELECT b.id as branch_id, b.branch_name, b.address, b.phone_one, b.phone_two, b.email, b.bin, b.trade_lin, b.logo_path FROM assigned_branches ab
      INNER JOIN branches b ON b.id = ab.branch_id
      WHERE ab.user_id = ?`,
      [id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      }
    );
  },

  getModulePermissions: (data, callBack) => {
    pool.query(
      `SELECT create_permission, view_permission, edit_permission, del_permission FROM user_permissions WHERE user_id = ? AND module = ?`,
      [data.user_id, data.module],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      }
    );
  },

  getModules: (id, callBack) => {
    pool.query(
      `SELECT module FROM user_permissions WHERE view_permission = ? AND user_id = ?`,
      [1, id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      }
    );
  },

  changePassword: (data, callBack) => {
    pool.query(
      `UPDATE users SET password = ? WHERE email = ?`,
      [data.password, data.email],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      }
    );
  },


sendOtp: (data, callBack) => {
  const email = data.email;
  const otpMethod = data.otp_method || "reset";

  if (!email) {
    return callBack(new Error("Email is required"));
  }

  pool.query("SELECT id FROM users WHERE email = ?", [email], (err, rows) => {
    if (err) return callBack(err);

    const existingUser = rows.length > 0;

    if (otpMethod === "signup" && existingUser) {
      return callBack(new Error("User already exists! Please login."));
    } else if (otpMethod === "reset" && !existingUser) {
      return callBack(new Error("User not found."));
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const saveOtp = (callback) => {
      pool.query("SELECT id FROM verification WHERE email = ?", [email], (err, verRows) => {
        if (err) return callBack(err);

        if (verRows.length > 0) {
          pool.query(
            "UPDATE verification SET otp=?, expired_at=?, is_verified=0 WHERE email=?",
            [otp, expiresAt, email],
            callback
          );
        } else {
          pool.query(
            "INSERT INTO verification (email, otp, is_verified, expired_at) VALUES (?, ?, 0, ?)",
            [email, otp, expiresAt],
            callback
          );
        }
      });
    };

    saveOtp(async (err) => {
      if (err) return callBack(err);

      try {
        const mailSent = await sendMail(
          email,
          "Verify Your Email Address",
          `Hello,<br><br>Your verification code is: <strong>${otp}</strong><br><br>This code will expire in 24 hours.`,
          `Hello,\n\nYour verification code is: ${otp}\n\nThis code will expire in 24 hours.`
        );

        if (!mailSent) {
          return callBack(new Error("Failed to send OTP email"));
        }

        return callBack(null, { message: "OTP sent successfully to your email" });
      } catch (error) {
        return callBack(error);
      }
    });
  });
},







  verifyOtp: (data, callBack) => {

    pool.query(
        `SELECT * FROM verification WHERE email = ? AND otp = ? AND expired_at > NOW()`,
        [data.email, data.otp],
        (error, check) => {
            if (error) {
                return callBack(error);
            }
            if(check.length==0){
              return callBack(new Error("Invalid or expired otp"));
            }

            pool.query(
                `UPDATE verification SET is_verified = 1 WHERE id = ?`,
                [check[0].id],
                (error, results) => {
                    if (error) {
                        return callBack(error);
                    }
                    return callBack(null, results);
                }
            );
        }
    );
},




  getProfile: (user_id, callBack) => {
    pool.query(
      `SELECT * FROM users WHERE id = ?`,
      [user_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results[0]);
      }
    );
  },



  updateProfile: (data, callBack) => {
  const allowedFields = [
    "name", "gender", "dob", "country", "city", "latitude", "longitude",
    "ethnicity", "education", "profession", "body_type", "height", "weight",
    "hair_color", "eye_color", "skin_color", "religion", "religion_section",
    "prayer_frequency", "dress_code", "dietary_preference", "marital_status",
    "marital_duration", "have_child", "want_child",
    "prefered_partner_age_start", "prefered_partner_age_end",
    "prefered_partner_distance_range", "prefered_partner_religion",
    "prefered_partner_religion_section", "prefered_partner_occupation",
    "prefered_partner_education", "prefered_partner_marital_status", "prefered_partner_ethnicity"
  ];

  const updates = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key) && value !== undefined && value !== null) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (updates.length === 0) {
    return callBack(new Error("No valid fields to update"));
  }

  if (!data.id) {
    return callBack(new Error("User ID is required for update"));
  }

  const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
  values.push(data.id);

  pool.query(sql, values, (error, results) => {
    if (error) {
      return callBack(error);
    }
    return callBack(null, results);
  });
},






getFilteredUsers: (filters, user_id, pagination, callBack) => {
  const { page, limit } = pagination;
  const offset = (page - 1) * limit;

  let query = `
    SELECT SQL_CALC_FOUND_ROWS id, name, country, city, pro_path
    FROM users
    WHERE id != ?`;
  const params = [user_id];

  // ✅ Apply optional filters
  if (filters.gender) {
    query += " AND gender = ?";
    params.push(filters.gender);
  }
  if (filters.country) {
    query += " AND country = ?";
    params.push(filters.country);
  }
  if (filters.city) {
    query += " AND city = ?";
    params.push(filters.city);
  }
  if (filters.religion) {
    query += " AND religion = ?";
    params.push(filters.religion);
  }
  if (filters.religion_section) {
    query += " AND religion_section = ?";
    params.push(filters.religion_section);
  }
  if (filters.marital_status) {
    query += " AND marital_status = ?";
    params.push(filters.marital_status);
  }
  if (filters.profession) {
    query += " AND profession = ?";
    params.push(filters.profession);
  }
  if (filters.education) {
    query += " AND education = ?";
    params.push(filters.education);
  }
  if (filters.ethnicity) {
    query += " AND ethnicity = ?";
    params.push(filters.ethnicity);
  }
  if (filters.body_type) {
    query += " AND body_type = ?";
    params.push(filters.body_type);
  }
  if (filters.hair_color) {
    query += " AND hair_color = ?";
    params.push(filters.hair_color);
  }
  if (filters.eye_color) {
    query += " AND eye_color = ?";
    params.push(filters.eye_color);
  }
  if (filters.skin_color) {
    query += " AND skin_color = ?";
    params.push(filters.skin_color);
  }

  // ✅ Load user preferences for sorting
  const prefQuery = `
    SELECT prefered_partner_age_start, prefered_partner_age_end, prefered_partner_distance_range,
           prefered_partner_religion, prefered_partner_religion_section,
           prefered_partner_occupation, prefered_partner_education,
           latitude, longitude
    FROM users WHERE id = ?`;

  pool.query(prefQuery, [user_id], (err, prefResult) => {
    if (err) return callBack(err);

    const pref = prefResult[0] || {};

    // ✅ Sort results to show preferred ones first
    query += `
      ORDER BY 
        (religion = ?) DESC,
        (religion_section = ?) DESC,
        (profession = ?) DESC,
        (education = ?) DESC
      LIMIT ? OFFSET ?`;

    params.push(
      pref.prefered_partner_religion || "",
      pref.prefered_partner_religion_section || "",
      pref.prefered_partner_occupation || "",
      pref.prefered_partner_education || "",
      parseInt(limit),
      parseInt(offset)
    );

    pool.query(query, params, (error, results) => {
      if (error) return callBack(error);

      // ✅ Get total count for pagination
      pool.query("SELECT FOUND_ROWS() AS total", (countErr, countResult) => {
        if (countErr) return callBack(countErr);
        const total = countResult[0].total;

        return callBack(null, {
          data: results,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        });
      });
    });
  });
},




  friendReq: (data, callBack) => {
    pool.query(
      `INSERT INTO friend_requests (sender_id, receiver_id) VALUES(?, ?)`,
      [data.user_id, data.receiver_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      }
    );
  },
  
  
    updateReq: (id, callBack) => {
    pool.query(
      `UPDATE friend_requests SET status = 'accepted' WHERE id = ?`,
      [id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      }
    );
  },


    receivedRequests: (id, callBack) => {
    pool.query(
      `SELECT fr.id AS request_id, u.name, u.pro_path 
       FROM friend_requests fr 
       INNER JOIN users u ON u.id = fr.sender_id
       WHERE fr.receiver_id = ? AND fr.status = 'pending'`,
      [id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      }
    );
  },
  
      sentRequests: (id, callBack) => {
    pool.query(
      `SELECT fr.id AS request_id, u.name, u.pro_path 
       FROM friend_requests fr 
       INNER JOIN users u ON u.id = fr.receiver_id
       WHERE fr.sender_id = ? AND fr.status = 'pending'`,
      [id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      }
    );
  },
  
  
        allfriends: (id, callBack) => {
    pool.query(
      `SELECT 
        u.id AS user_id, 
        u.name, 
        u.pro_path 
     FROM friend_requests fr
     INNER JOIN users u 
        ON (u.id = fr.sender_id AND fr.receiver_id = ?) 
        OR (u.id = fr.receiver_id AND fr.sender_id = ?)
     WHERE fr.status = 'accepted'`,
      [id, id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      }
    );
  },
  
  
  
          getFriend: (id, callBack) => {
    pool.query(
      `SELECT * FROM users WHERE id = ?`,
      [id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      }
    );
  },
  


  


    blockUser: (data, callBack) => {
    pool.query(
      `DELETE FROM friend_requests WHERE sender_id = ? AND receiver_id = ?`,
      [data.user_id, data.blocked_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

      pool.query(
        `INSERT INTO blocked_users (user_id, blocked_id) VALUES(?, ?)`,
        [data.user_id, data.blocked_id],
        (error, results) => {
          if (error) {
            return callBack(error);
          }

          return callBack(null, results);
        }
      );
    
    }
    );


  },




    unfriend: (data, callBack) => {
    pool.query(
      `DELETE FROM friend_requests WHERE sender_id = ? AND receiver_id = ?`,
      [data.user_id, data.receiver_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      }
    );
  },






};
