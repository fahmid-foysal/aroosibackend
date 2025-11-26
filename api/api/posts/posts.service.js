const pool = require("../../config/database");

module.exports = {
  createPost: (data, callBack) => {
    pool.query(
      `INSERT INTO posts (user_id, image_path, caption) VALUES(?, ?, ?)`,
      [data.user_id, data.image_path, data.caption],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  
  
    getUsersPosts: (user_id, callBack) => {
    pool.query(
      `SELECT * FROM posts WHERE user_id = ?`,
      [user_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  



  
  newsFeed: ({ limit, offset, userId }, callBack) => {
      const queryData = `
        SELECT p.*, u.pro_path, u.name
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id NOT IN(SELECT blocked_id FROM blocked_users WHERE user_id = ?)
        ORDER BY p.id DESC
        LIMIT ? OFFSET ?;
  `;

  const queryCount = `SELECT COUNT(*) AS total FROM posts;`;

  pool.query(queryCount, (countError, countResults) => {
    if (countError) {
      return callBack(countError);
    }

    const total = countResults[0].total;

    pool.query(queryData, [userId, limit, offset], (error, results) => {
      if (error) {
        return callBack(error);
      }
      return callBack(null, { data: results, total });
    });
  });
},

  



  

  createReact: (data, callBack) => {
    pool.query(
      `SELECT id FROM post_reacts WHERE user_id = ? AND post_id = ?`,
      [data.user_id, data.post_id],
      (error, check) => {
        if (error) {
          return callBack(error);
        }
        if (check.length>0) {
          pool.query(
            `DELETE FROM post_reacts WHERE user_id = ? AND post_id = ?`,
            [data.user_id, data.post_id],
            (error, results) => {
              if (error) {
                return callBack(error);
              }
              return callBack(null, results);
            }
          );
        }else{
          pool.query(
            `INSERT INTO post_reacts (user_id, post_id) VALUES(?, ?)`,
            [data.user_id, data.post_id],
            (error, results) => {
              if (error) {
                return callBack(error);
              }
              return callBack(null, results);
            }
          );
        }
      }
    );
  },




    createComment: (data, callBack) => {
    pool.query(
      `INSERT INTO post_comments (user_id, post_id, comment_text) VALUES(?, ?, ?)`,
      [data.user_id, data.post_id, data.comment],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  


allComment: ({ limit, offset, post_id }, callBack) => {
  pool.query(
    `SELECT COUNT(*) AS total FROM post_comments WHERE post_id = ?`,
    [post_id],
    (error, countResult) => {
      if (error) return callBack(error);

      const total = countResult[0].total;

      pool.query(
        `SELECT u.id AS user_id, u.name, u.pro_path, pc.comment_text, pc.created_at
         FROM post_comments pc
         INNER JOIN users u ON u.id = pc.user_id
         WHERE pc.post_id = ?
         ORDER BY pc.created_at DESC
         LIMIT ? OFFSET ?`,
        [post_id, limit, offset],
        (error, dataResult) => {
          if (error) return callBack(error);
          return callBack(null, { total, data: dataResult });
        }
      );
    }
  );
},


allReact: ({ limit, offset, post_id }, callBack) => {
  pool.query(
    `SELECT COUNT(*) AS total FROM post_reacts WHERE post_id = ?`,
    [post_id],
    (error, countResult) => {
      if (error) return callBack(error);

      const total = countResult[0].total;

      pool.query(
        `SELECT u.id AS user_id, u.name, u.pro_path
         FROM post_reacts pr
         INNER JOIN users u ON u.id = pr.user_id
         WHERE pr.post_id = ?
         ORDER BY pr.id DESC
         LIMIT ? OFFSET ?`,
        [post_id, limit, offset],
        (error, dataResult) => {
          if (error) return callBack(error);
          return callBack(null, { total, data: dataResult });
        }
      );
    }
  );
},




    report: (data, callBack) => {
    pool.query(
      `INSERT INTO post_reports (post_id, user_id, report_text) VALUES(?, ?, ?) `,
      [data.post_id, data.user_id, data.report_text],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      }
    );
  },





};
