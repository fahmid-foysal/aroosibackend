const pool = require("../../config/database");

module.exports = {
  create: (data, callBack) => {
    pool.query(
      `INSERT INTO businesses (user_id, latitude, longitude, city, country, shop_name, one_liner, cover_path, about_us, services, category, website)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.user_id,
        data.latitude,
        data.longitude,
        data.city,
        data.country,
        data.shop_name,
        data.one_liner,
        data.cover_path,
        data.about_us,
        data.services,
        data.category,
        data.website,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },

 
getBusinesses: (filters, callBack) => {
  const { latitude, longitude, search, limit, offset } = filters;

  // --- Base query ---
  let query = `
    SELECT 
      b.*, 
      u.name AS owner_name, 
      u.pro_path AS owner_profile,
      (
        6371 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(b.latitude)) *
          COS(RADIANS(b.longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(b.latitude))
        )
      ) AS distance
    FROM businesses b
    INNER JOIN users u ON u.id = b.user_id
    WHERE 1=1
  `;

  const params = [latitude || 0, longitude || 0, latitude || 0];

  // --- Search filter ---
  if (search) {
    query += ` AND (
      b.shop_name LIKE ? OR
      b.one_liner LIKE ? OR
      b.about_us LIKE ? OR
      b.services LIKE ? OR
      b.category LIKE ? OR
      b.website LIKE ?
    )`;
    const likeTerm = `%${search}%`;
    params.push(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm);
  }

  // --- HAVING should come after SELECT fields, not before WHERE ---
  // Only include HAVING if lat/lng provided (distance filtering)
  if (latitude && longitude) {
    query += ` HAVING distance <= 50`;
  }

  // --- Pagination ---
  query += ` ORDER BY distance ASC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit) || 10, parseInt(offset) || 0);

  // --- Run query ---
  pool.query(query, params, (error, results) => {
    if (error) {
      console.error("Database query failed:", error);
      return callBack(error);
    }
    return callBack(null, results);
  });
},


  review: (data, callBack) => {
    pool.query(
      `INSERT INTO business_reviews (user_id, business_id, review_text, star) VALUES(?, ?, ?, ?)`,
      [data.user_id, data.business_id, data.review_text, data.star],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  
  
  
    getReviews: (business_id, callBack) => {
    pool.query(
      `SELECT br.review_text, br.star, u.name, u.pro_path FROM business_reviews br INNER JOIN users u ON u.id = br.user_id WHERE br.business_id = ?`,
      [business_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },



};
