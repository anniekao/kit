const userRouter = require("express").Router();

module.exports = db => {
  // GET /users
  userRouter.get("/", async (req, res) => {
    // select all columns in users table except for password
    const users = await db.query(`
      SELECT first_name, last_name, email, phone, occupation, bio, qr_code, company, id FROM users;
    `);
    res.status(200).json(users.rows);
  });

  // POST /users : Is this necessary because user is already created in sign up route ?

  // GET /users/:id
  userRouter.get("/:id", async (req, res) => {
    try {
      // select all columns in users table except for password
      const user = await db.query(
        `
        SELECT first_name, last_name, email, phone, occupation, bio, qr_code, company, id FROM users WHERE id = $1;
      `,
        [req.params.id]
      );

      if (user) {
        res.status(200).json(user.rows[0]);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (exception) {
      console.error(exception);
    }
  });

  // PUT /users/:id
  userRouter.put("/:id", async (req, res) => {
    // create arrays with all elements except for id key and value
    const fields = Object.keys(req.body);
    const queryParams = Object.values(req.body);

    // count to keep track of $1 placeholders
    let count = 1;
    let queryStr = `UPDATE users SET `;
    // append e.g. first_name = $1 to query string
    // also append comma to every element except last
    for (let i = 0; i < fields.length; i++) {
      if (i !== fields.length - 1) {
        queryStr += `${fields[i]}=$${count}, `;
      } else {
        queryStr += `${fields[i]}=$${count} `;
      }
      count++;
    }

    queryStr += `WHERE id = ${req.params.id} RETURNING first_name, last_name, email, phone, occupation, bio, qr_code, company;`;
    try {
      const updatedUser = await db.query(queryStr, queryParams);
      if (updatedUser) {
        res.status(200).json(updatedUser.rows[0]);
      } else {
        res.status(400).json({ error: "Could not updated user" });
      }
    } catch (exception) {
      console.error(exception);
    }
  });

  // DELETE /users/:id
  userRouter.delete("/:id", async (req, res) => {
    try {
      await db.query(`DELETE FROM users WHERE id = $1;`, [req.params.id]);
      res.status(204).json({ message: `user ${req.params.id} deleted` });
    } catch (exception) {
      console.error(exception);
    }
  });

  // get /users/:id/calender
  userRouter.get("/:id/calender", async (req, res) => {
    const userid = req.params.id;
    let result = [];

    const convertDate = (postGresDate, time) => {
      const tempDate = new Date(postGresDate);
      let tempTime = ("" + time).split(":");

      console.log(tempTime);
      console.log(Number(tempTime[0]));
      console.log(Number(tempTime[1]));

      return new Date(
        tempDate.getFullYear(),
        tempDate.getMonth(),
        tempDate.getDate(),
        Number(tempTime[0]),
        Number(tempTime[1]),
        0,
        0
      );
    };

    try {
      const userCalenderEvents = await db.query(
        `select ne.id, name, location, date, start_time, end_time from network_event ne 
          join user_event ue 
          on ne.id = ue.network_event_id 
          where ue.user_id = $1`,
        [userid]
      );
      if (userCalenderEvents.rowsCount === 0) {
        throw new Error("User has not yet attented any events");
      }

      result = userCalenderEvents.rows.map(eventObj => {
        let obj = {};
        obj.id = eventObj.id;
        obj.title = eventObj.name;
        obj.start = convertDate(eventObj.date, eventObj.start_time);
        obj.end = convertDate(eventObj.date, eventObj.end_time);
        return obj;
      });

      res.status(200).send(result);
    } catch (exception) {
      console.error(exception);
      res.status(404).json({ message: exception });
    }
  });

  return userRouter;
};
