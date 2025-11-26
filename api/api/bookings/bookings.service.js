const pool = require("../../config/database");

const moment = require("moment-timezone");

let today = moment().tz("Asia/Dhaka").format("YYYY-MM-DD");
let now = moment().tz("Asia/Dhaka").format("HH:mm:ss");

module.exports = {
  createGuest: (data, callBack) => {
    pool.query(
      `INSERT INTO guests 
      (
        id_type, id_no, father_name, profession, age, gender, phone, 
        emergency_name, emergency_phone, country, address, sig_path, img_path, 
        id_back, id_front, spouse_id_back, spouse_id_front, name, visa_no, visa_expiry_date, visa_type, spouse_name, email
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id_type,
        data.id_no,
        data.father_name,
        data.profession,
        data.age,
        data.gender,
        data.phone,
        data.emergency_name,
        data.emergency_phone,
        data.country,
        data.address,
        data.sig_path,
        data.img_path,
        data.id_back,
        data.id_front,
        data.spouse_id_back,
        data.spouse_id_front,
        data.name,
        data.visa_no,
        data.visa_expiry_date,
        data.visa_type,
        data.spouse_name,
        data.email
      ],
      (error, results) => {
        if (error) return callBack(error);
        return callBack(null, results);
      }
    );
  },

  searchGuests: (search, callBack) => {
    const like = `%${search}%`;
    pool.query(
      `SELECT id, name, phone 
       FROM guests 
       WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?`,
      [like, like, like],
      (error, results) => {
        if (error) return callBack(error);
        return callBack(null, results);
      }
    );
  },





  createBooking: (bookingData, rooms, callBack) => {
    pool.getConnection((err, connection) => {
      if (err) return callBack(err);

      connection.beginTransaction(err => {
        if (err) {
          connection.release();
          return callBack(err);
        }

        const bookingSql = `
          INSERT INTO bookings 
          (date, company_id, agent_id, source_id, purpose_id, plan_id, guest_id, reference_name, drop_address, pickup_address, pickup_flight, drop_flight, total_pax, adult_pax, child_pax, sig_path, user_id, notes) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        connection.query(
          bookingSql,
          [
            bookingData.date,
            bookingData.company_id || null,
            bookingData.agent_id || null,
            bookingData.source_id || null,
            bookingData.purpose_id,
            bookingData.plan_id || null,
            bookingData.guest_id,
            bookingData.reference_name || null,
            bookingData.drop_address || null,
            bookingData.pickup_address || null,
            bookingData.pickup_flight || null,
            bookingData.drop_flight || null,
            bookingData.total_pax,
            bookingData.adult_pax || null,
            bookingData.child_pax || null,
            bookingData.sig_path, 
            bookingData.user_id,
            bookingData.notes || null
          ],
          (err, result) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                return callBack(err);
              });
            }

            const bookingId = result.insertId;

            const paymentSql = `INSERT INTO booking_payments (user_id, payment_method_id, booking_id, amount, type) VALUES(?, ?, ?, ?, ?)`;

            connection.query(paymentSql, [bookingData.user_id, bookingData.method_id, bookingId, bookingData.paid, 'rent'],
              (err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  return callBack(err);
                });
              }
              
            const roomSql = `
              INSERT INTO booking_rooms (bf_qty, discount, rate, check_in_date, check_out_date, booking_id, room_id, discount_type_id, check_in_time)
              VALUES ?
            `;


            const roomValues = rooms.map(room => [
              room.bf_qty,
              room.discount,
              room.rate,
              room.check_in_date,
              room.check_out_date,
              bookingId,
              room.room_id,
              room.discount_type_id,
              now
            ]);

            const room_ids = rooms.map(room => room.room_id);

            connection.query(roomSql, [roomValues], (err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  return callBack(err);
                });
              }

              const updateRoomSql = `UPDATE rooms SET status = 'checked_in' WHERE id IN (?)`;

              connection.query(updateRoomSql, [room_ids], (err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    return callBack(err);
                  });
                }

                connection.commit(err => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      return callBack(err);
                    });
                  }

                  connection.release();
                  return callBack(null, { booking_id: bookingId });
                });
              });
            });

              }
            )
          }
        );
      });
    });
  },







  createBookingMembers: (membersData, callBack) => {
    const sql = `
      INSERT INTO booking_members 
      (name, phone, email, age, id_type, id_no, gender, relation, img_path, sig_path, back_path, front_path, booking_id)
      VALUES ?
    `;
    pool.query(sql, [membersData], (error, results) => {
      if (error) return callBack(error);
      return callBack(null, results);
    });
  },
  
  
  
getBookings: (data, page, limit, callBack) => {
  const offset = (page - 1) * limit;


  let countSql = `
    SELECT COUNT(DISTINCT b.id) AS total
    FROM bookings b
    INNER JOIN booking_rooms br ON b.id = br.booking_id
    INNER JOIN rooms r ON br.room_id = r.id
    WHERE r.branch_id = ?
  `;
  const countParams = [data.branch_id];

  if (data.booking_id) {
    countSql += " AND b.id = ? ";
    countParams.push(data.booking_id);
  }
  if (data.guest_id) {
    countSql += " AND b.guest_id = ? ";
    countParams.push(data.guest_id);
  }
  if (data.category_id) {
    countSql += " AND r.category_id = ? ";
    countParams.push(data.category_id);
  }
  if (data.room_no) {
    countSql += " AND r.room_no = ? ";
    countParams.push(data.room_no);
  }
  if (data.check_in_date) {
    countSql += " AND br.check_in_date = ? ";
    countParams.push(data.check_in_date);
  }
  if (data.check_out_date) {
    countSql += " AND br.check_out_date = ? ";
    countParams.push(data.check_out_date);
  }
  if (data.booking_date_from && data.booking_date_to) {
    countSql += " AND b.date BETWEEN ? AND ? ";
    countParams.push(data.booking_date_from, data.booking_date_to);
  } else if (data.booking_date_from) {
    countSql += " AND b.date >= ? ";
    countParams.push(data.booking_date_from);
  } else if (data.booking_date_to) {
    countSql += " AND b.date <= ? ";
    countParams.push(data.booking_date_to);
  }

  pool.query(countSql, countParams, (countErr, countResults) => {
    if (countErr) return callBack(countErr);

    const totalRecords = countResults[0].total;
    const totalPages = Math.ceil(totalRecords / limit);


    let sql = `
      SELECT 
        b.id AS booking_id,
        b.date AS booking_date,
        u.name AS user_name,
        bs.source_name,
        (SELECT IFNULL(SUM(amount), 0) FROM booking_payments WHERE booking_id = b.id ) AS total_paid,
        (
          (SELECT IFNULL(SUM(brii.rate * brii.amount), 0) 
              FROM booking_res_invoice_items brii 
              INNER JOIN booking_res_invoices bri ON bri.id=brii.invoice_id 
              WHERE bri.booking_id = b.id ) +
          (SELECT IFNULL(SUM(DATEDIFF(check_out_date, check_in_date) * (rate - discount)), 0) 
              FROM booking_rooms 
              WHERE booking_id = b.id ) +
          (SELECT IFNULL(SUM(rs.price*sc.amount), 0) 
              FROM service_charges sc
              INNER JOIN room_services rs ON rs.id = sc.service_id
              WHERE sc.booking_id = b.id)
        ) AS total_payable,
        g.id AS guest_id,
        g.name AS guest_name,
        g.phone AS guest_phone,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'room_id', r.id,
                'status', br.status,
                'rate', br.rate,
                'discount', br.discount,
                'discount_type', dt.type,
                'check_in_date', br.check_in_date,
                'check_in_time', br.check_in_time,
                'check_out_date', br.check_out_date,
                'check_out_time', br.check_out_time,
                'room_no', r.room_no,
                'category_id', c.id,
                'category', c.category,
                'current_price', c.price
            )
        ) AS rooms
      FROM bookings b
      INNER JOIN guests g ON b.guest_id = g.id
      INNER JOIN booking_rooms br ON b.id = br.booking_id
      INNER JOIN rooms r ON br.room_id = r.id
      INNER JOIN categories c ON r.category_id = c.id
      INNER JOIN users u ON u.id = b.user_id
      LEFT JOIN discount_types dt ON dt.id = br.discount_type_id
      INNER JOIN booking_source bs ON bs.id = b.source_id
      WHERE b.id IN (
        SELECT DISTINCT b2.id
        FROM bookings b2
        INNER JOIN booking_rooms br2 ON b2.id = br2.booking_id
        INNER JOIN rooms r2 ON br2.room_id = r2.id
        WHERE r2.branch_id = ?
    `;

    const params = [data.branch_id];

    if (data.booking_id) {
      sql += " AND b2.id = ? ";
      params.push(data.booking_id);
    }
    if (data.guest_id) {
      sql += " AND b2.guest_id = ? ";
      params.push(data.guest_id);
    }
    if (data.category_id) {
      sql += " AND r2.category_id = ? ";
      params.push(data.category_id);
    }
    if (data.room_no) {
      sql += " AND r2.room_no = ? ";
      params.push(data.room_no);
    }
    if (data.check_in_date) {
      sql += " AND br2.check_in_date = ? ";
      params.push(data.check_in_date);
    }
    if (data.check_out_date) {
      sql += " AND br2.check_out_date = ? ";
      params.push(data.check_out_date);
    }
    if (data.booking_date_from && data.booking_date_to) {
      sql += " AND b2.date BETWEEN ? AND ? ";
      params.push(data.booking_date_from, data.booking_date_to);
    } else if (data.booking_date_from) {
      sql += " AND b2.date >= ? ";
      params.push(data.booking_date_from);
    } else if (data.booking_date_to) {
      sql += " AND b2.date <= ? ";
      params.push(data.booking_date_to);
    }

    sql += `
      )
      GROUP BY b.id, b.date, g.id, g.name, g.phone
      ORDER BY b.id DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    pool.query(sql, params, (error, results) => {
      if (error) return callBack(error);

      results.forEach(row => {
        if (typeof row.rooms === "string") {
          row.rooms = JSON.parse(row.rooms);
        }
      });

      return callBack(null, results, totalRecords, totalPages);
    });
  });
},



      addRoomService: (data, callBack) => {
        pool.query(
            'INSERT INTO service_charges (booking_id, service_id, amount, description) VALUES (?, ?, ?, ?)',
            [data.booking_id, data.service_id, data.amount, data.description],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },



addPayment: (data, callBack) => {

    paySql = 'INSERT INTO booking_payments (user_id, payment_method_id, booking_id, type, amount) VALUES ?'

    const payValues = data.payments.map(pay => [
      data.user_id, 
      pay.method_id, 
      data.booking_id,
      pay.type,
      pay.amount   
    ]);          
    pool.query(
      paySql,
      [payValues],
      (error, results) => {
          if (error) {
              return callBack(error);
          }
          return callBack(null, results, today);
      }
    );
},




    addRooms: (data, callBack) => {

    pool.getConnection((err, connection) => {


            const roomSql = `
              INSERT INTO booking_rooms (bf_qty, discount, rate, check_in_date, check_out_date, booking_id, room_id, discount_type_id, check_in_time)
              VALUES ?
            `;


            const roomValues = data.rooms.map(room => [
              room.bf_qty,
              room.discount,
              room.rate,
              room.check_in_date,
              room.check_out_date,
              data.booking_id,
              room.room_id,
              room.discount_type_id,
              now
            ]);

            const room_ids = data.rooms.map(room => room.room_id);

            connection.query(roomSql, [roomValues], (err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  return callBack(err);
                });
              }

              const updateRoomSql = `UPDATE rooms SET status = 'checked_in' WHERE id IN (?)`;

              connection.query(updateRoomSql, [room_ids], (err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    return callBack(err);
                  });
                }

                connection.commit(err => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      return callBack(err);
                    });
                  }

                  connection.release();
                  return callBack(null);
                });
              });
            });

                });

    },

    


    updateCheckout: (data, callBack) => {
        pool.query(
            `UPDATE booking_rooms 
            SET check_out_date = ? 
            WHERE id = (
                SELECT MAX(br.id) 
                FROM booking_rooms br
                INNER JOIN rooms r ON br.room_id = r.id 
                WHERE br.room_id = ? 
                AND r.status = "checked_in"
            )`,
            [data.check_out_date, data.room_id],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },



        getSingleBooking: (data, callBack) => {
        pool.query(
            `SELECT g.name, g.phone, br.check_in_date, br.check_in_time, br.check_out_date
            FROM booking_rooms br
            INNER JOIN bookings b ON b.id = br.booking_id
            INNER JOIN guests g ON g.id = b.guest_id
            WHERE br.id = (
                SELECT MAX(br.id) 
                FROM booking_rooms br
                INNER JOIN rooms r ON br.room_id = r.id 
                WHERE br.room_id = ? 
            )`,
            [data.room_id],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },



        checkout: (data, callBack) => {
        pool.query(
            `UPDATE booking_rooms 
            SET check_out_date = ?, check_out_time = ?, status = 'checked_out'
            WHERE id = (
                SELECT MAX(br.id) 
                FROM booking_rooms br
                INNER JOIN rooms r ON br.room_id = r.id 
                WHERE br.room_id = ? 
                AND r.status = "checked_in"
            ) AND status = 'checked_in'`,
            [today, now, data.room_id],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                
                pool.query(
                    `UPDATE rooms 
                    SET status = 'dirty' 
                    WHERE id = ?`,
                    [data.room_id],
                    (error, results) => {
                        if (error) {
                            return callBack(error);
                        }
                        return callBack(null, results);
                    }
                );                
                return callBack(null, results);
            }
        );
    },







  migrate: (data, callBack) => {
    pool.getConnection((err, connection) => {
      if (err) return callBack(err);

      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          return callBack(err);
        }

        connection.query(
          `SELECT * FROM booking_rooms 
           WHERE id = (
             SELECT MAX(br.id) 
             FROM booking_rooms br
             INNER JOIN rooms r ON br.room_id = r.id 
             WHERE br.room_id = ? 
             AND r.status = "checked_in"
           ) AND status = 'checked_in'`,
          [data.room_id],
          (error, currentBr) => {
            if (error) {
              return connection.rollback(() => {
                connection.release();
                callBack(error);
              });
            }
            if (!currentBr || currentBr.length === 0) {
              return connection.rollback(() => {
                connection.release();
                callBack(new Error("No active booking found for this room"));
              });
            }

            connection.query(
              `UPDATE booking_rooms 
               SET check_out_date = ?, check_out_time = ?, status = 'checked_out'
               WHERE id = ?`,
              [today, now, currentBr[0].id],
              (error) => {
                if (error) {
                  return connection.rollback(() => {
                    connection.release();
                    callBack(error);
                  });
                }

                connection.query(
                  `UPDATE rooms SET status = 'checked_in' WHERE id = ?`,
                  [currentBr[0].room_id],
                  (error) => {
                    if (error) {
                      return connection.rollback(() => {
                        connection.release();
                        callBack(error);
                      });
                    }

                    connection.query(
                      `INSERT INTO booking_rooms 
                       (bf_qty, discount, rate, check_in_date, check_out_date, booking_id, room_id, discount_type_id, check_in_time) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                      [
                        currentBr[0].bf_qty,
                        data.discount ?? 0.0,
                        data.rate,
                        today,
                        currentBr[0].check_out_date, 
                        currentBr[0].booking_id,
                        data.room_id_next,
                        data.discount_type_id,
                        now,
                      ],
                      (error, results) => {
                        if (error) {
                          return connection.rollback(() => {
                            connection.release();
                            callBack(error);
                          });
                        }

                        connection.query(
                          `UPDATE rooms SET status = 'checked_in' WHERE id = ?`,
                          [data.room_id_next],
                          (error) => {
                            if (error) {
                              return connection.rollback(() => {
                                connection.release();
                                callBack(error);
                              });
                            }

                            connection.commit((err) => {
                              if (err) {
                                return connection.rollback(() => {
                                  connection.release();
                                  callBack(err);
                                });
                              }
                              connection.release();
                              return callBack(null, results);
                            });
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    });
  },



    bookingDetails: (booking_id, callBack) => {

        pool.query(
            `SELECT 
        b.id AS booking_id,
        b.date AS booking_date,
        u.name AS user_name,
        bs.source_name,
        ac.company_name,
        ba.name AS agent_name,
        bp.purpose,
        bp2.plan_name,
        b.reference_name,
        b.drop_address,
        b.pickup_address,
        b.drop_flight,
        b.pickup_flight,
        b.total_pax,
        b.adult_pax,
        b.child_pax,
        b.sig_path,
        g.id_type,
        g.id_no,
        g.name,
        g.phone,
        g.emergency_phone,
        g.img_path AS guest_img
      FROM bookings b
      INNER JOIN users u ON u.id = b.user_id
      INNER JOIN booking_source bs ON bs.id = b.source_id
      INNER JOIN guests g ON g.id = b.guest_id
      LEFT JOIN affiliated_companies ac ON ac.id = b.company_id
      LEFT JOIN agents ba ON ba.id = b.agent_id
      LEFT JOIN booking_purposes bp ON bp.id = b.purpose_id
      LEFT JOIN booking_plan bp2 ON bp2.id = b.plan_id
      WHERE b.id  = ?`,
            [booking_id],
            (error, booking) => {
                if (error) {
                    return callBack(error);
                }

                pool.query(
                `SELECT r.room_no, br.bf_qty, br.discount, br.rate, c.price AS current_price, c.category, br.check_in_date, br.check_in_time,
                br.check_out_date, br.check_out_time, r.status, dt.type
                FROM booking_rooms br
                INNER JOIN rooms r ON r.id = br.room_id
                INNER JOIN categories c ON c.id = r.category_id
                LEFT JOIN discount_types dt ON dt.id = br.discount_type_id
                WHERE br.booking_id = ?`,
                [booking_id],
                (error, rooms) => {
                    if (error) {
                        return callBack(error);
                    }
                    pool.query(
                              `SELECT name, phone, age, id_type, id_no, gender, relation, img_path
                              FROM booking_members WHERE booking_id = ?`,
                              [booking_id],
                              (error, members) => {
                                  if (error) {
                                      return callBack(error);
                                  }
                                  pool.query(
                                      `SELECT rs.service_name, rs.price, sc.amount AS quantity, sc.description, DATE(sc.created_at) AS date
                                      FROM service_charges sc
                                      INNER JOIN room_services rs ON rs.id = sc.service_id
                                      WHERE sc.booking_id = ?`,
                                      [booking_id],
                                      (error, services) => {
                                          if (error) {
                                              return callBack(error);
                                          }
                                          
                                          pool.query(
                                              `SELECT ri.item_name, brii.rate, brii.amount AS quantity, brii.invoice_id, DATE(bri.created_at) AS date
                                              FROM booking_res_invoice_items brii 
                                              INNER JOIN booking_res_invoices bri ON bri.id = brii.invoice_id
                                              INNER JOIN restaurant_items ri ON ri.id = brii.item_id
                                              WHERE bri.booking_id = ?`,
                                              [booking_id],
                                              (error, res_items) => {
                                                  if (error) {
                                                      return callBack(error);
                                                  }



                                                  pool.query(
                                                      `SELECT pm.method, pm.acc_no, u.name, bp.id, bp.type, bp.amount, DATE(bp.created_at) AS date
                                                      FROM booking_payments bp
                                                      INNER JOIN payment_methods pm ON pm.id = bp.payment_method_id
                                                      INNER JOIN users u ON u.id = bp.user_id
                                                      WHERE bp.booking_id = ?`,
                                                      [booking_id],
                                                      (error, payments) => {
                                                          if (error) {
                                                              return callBack(error);
                                                          }

                                                        pool.query(
                                                            `SELECT (SELECT IFNULL(SUM(amount), 0) FROM booking_payments WHERE booking_id = ? ) AS total_paid,
                                                              (SELECT IFNULL(SUM(brii.rate * brii.amount), 0) 
                                                                  FROM booking_res_invoice_items brii 
                                                                  INNER JOIN booking_res_invoices bri ON bri.id=brii.invoice_id 
                                                                  WHERE bri.booking_id = ? ) AS total_res_bill,
                                                              (SELECT IFNULL(SUM(DATEDIFF(check_out_date, check_in_date) * (rate - discount)), 0) 
                                                                  FROM booking_rooms 
                                                                  WHERE booking_id = ? ) AS total_rent,
                                                              (SELECT IFNULL(SUM(rs.price*sc.amount), 0) 
                                                                  FROM service_charges sc
                                                                  INNER JOIN room_services rs ON rs.id = sc.service_id
                                                                  WHERE sc.booking_id = ?) AS total_service_charge
                                                              `,
                                                            [booking_id, booking_id, booking_id, booking_id],
                                                            (error, totals) => {
                                                                if (error) {
                                                                    return callBack(error);
                                                                }
                                                                return callBack(null, booking, rooms, members, services, res_items, payments, totals);
                                                            }
                                                        );

                                                      }
                                                  );

                                              }
                                          );                                       

                                      }
                                  );                                  
                                  

                              }
                          );

                }
            );

            }
        );
    },



        dueList: (callBack) => {
      
        pool.query(
            `SELECT 
            g.phone, 
            b.id,
            
            (SELECT rrr.room_no FROM booking_rooms brrr INNER JOIN rooms rrr ON rrr.id = brrr.room_id WHERE brrr.booking_id = b.id LIMIT 1) AS name,

            (
                (SELECT IFNULL(SUM(brii.rate * brii.amount), 0) 
                FROM booking_res_invoice_items brii 
                INNER JOIN booking_res_invoices bri ON bri.id = brii.invoice_id 
                WHERE bri.booking_id = b.id
                )
                - 
                (SELECT IFNULL(SUM(amount), 0) 
                FROM booking_payments 
                WHERE booking_id = b.id AND type = 'resturant')
            ) AS res_due,

            (
                (SELECT IFNULL(SUM(DATEDIFF(check_out_date, check_in_date) * (rate - discount)), 0) 
                FROM booking_rooms 
                WHERE booking_id = b.id
                )
                -
                (SELECT IFNULL(SUM(amount), 0) 
                FROM booking_payments 
                WHERE booking_id = b.id AND type = 'rent')
            ) AS rent_due,

            (
                (SELECT IFNULL(SUM(rs.price * sc.amount), 0) 
                FROM service_charges sc
                INNER JOIN room_services rs ON rs.id = sc.service_id
                WHERE sc.booking_id = b.id
                )
                -
                (SELECT IFNULL(SUM(amount), 0) 
                FROM booking_payments 
                WHERE booking_id = b.id AND type = 'service')
            ) AS service_due

        FROM bookings b
        INNER JOIN guests g ON g.id = b.guest_id
        WHERE 
            (
                (SELECT IFNULL(SUM(brii.rate * brii.amount), 0) 
                FROM booking_res_invoice_items brii 
                INNER JOIN booking_res_invoices bri ON bri.id = brii.invoice_id 
                WHERE bri.booking_id = b.id
                )
                - 
                (SELECT IFNULL(SUM(amount), 0) 
                FROM booking_payments 
                WHERE booking_id = b.id AND type = 'resturant')
            ) > 0

            OR 
            (
                (SELECT IFNULL(SUM(DATEDIFF(check_out_date, check_in_date) * (rate - discount)), 0) 
                FROM booking_rooms 
                WHERE booking_id = b.id
                )
                -
                (SELECT IFNULL(SUM(amount), 0) 
                FROM booking_payments 
                WHERE booking_id = b.id AND type = 'rent')
            ) > 0

            OR 
            (
                (SELECT IFNULL(SUM(rs.price * sc.amount), 0) 
                FROM service_charges sc
                INNER JOIN room_services rs ON rs.id = sc.service_id
                WHERE sc.booking_id = b.id
                )
                -
                (SELECT IFNULL(SUM(amount), 0) 
                FROM booking_payments 
                WHERE booking_id = b.id AND type = 'service')
            ) > 0`,
            [],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    
    
        getAllGuest: (page, limit, callBack) => {
        const offset = (page - 1) * limit;
    


        pool.query(
            `SELECT COUNT(*) AS total FROM guests`,
            [],
            (error, countResult) => {
                if (error) {
                    return callBack(error);
                }

                const totalGuests = countResult[0].total
                const totalPages = Math.ceil(totalGuests/limit)


                pool.query(
                    `SELECT * FROM guests ORDER BY id DESC LIMIT ? OFFSET ?`,
                    [limit, offset],
                    (error, results) => {
                        if (error) {
                            return callBack(error);
                        }
                        return callBack(null, results, totalGuests, totalPages);
                    }
                );
            }
        );
    },
    
    
    
    
    
        addImages: (data, callBack) => {
    pool.query(
      `INSERT INTO booking_images (booking_id, image_path) VALUES(?, ?)`,
      [data.booking_id, data.image_path],
      (error, results) => {
        if (error) return callBack(error);
        return callBack(null, results);
      }
    );
  },
  
  
  
  
      bookingImages: (booking_id, callBack) => {
    pool.query(
      `SELECT image_path, DATE(created_at) AS date FROM booking_images
      WHERE booking_id IN (SELECT id FROM bookings WHERE guest_id = (
      SELECT guest_id FROM bookings WHERE id = ?))`,
      [booking_id],
      (error, results) => {
        if (error) return callBack(error);
        return callBack(null, results);
      }
    );
  },





  
};
