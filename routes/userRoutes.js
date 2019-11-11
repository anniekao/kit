const userRouter = require("express").Router();
const moment = require("moment");
const middleware = require("../middleware/");

// const moment = require('moment')
module.exports = db => {
  // GET /users
  userRouter.get("/", middleware.checkToken, async (req, res) => {
    // select all columns in users table except for password
    const users = await db.query(`
      SELECT first_name, last_name, email, phone, occupation, bio, qr_code, company, id FROM users;
    `);
    res.status(200).json(users.rows);
  });

  // POST /users : Is this necessary because user is already created in sign up route ?

  // GET /users/:id
  userRouter.get("/:id", middleware.checkToken, async (req, res) => {
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
  userRouter.put("/:id", middleware.checkToken, async (req, res) => {
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
  userRouter.delete("/:id", middleware.checkToken, async (req, res) => {
    try {
      await db.query(`DELETE FROM users WHERE id = $1;`, [req.params.id]);
      res.status(204).json({ message: `user ${req.params.id} deleted` });
    } catch (exception) {
      console.error(exception);
    }
  });

  // get /users/:id/calendar
  userRouter.get("/:id/calendar", middleware.checkToken, async (req, res) => {
    const userid = req.params.id;
    let result = [];

    const convertDate = (postGresDate, time) => {
      const tempDate = new Date(postGresDate);
      let tempTime = ("" + time).split(":");

      return new Date(
        tempDate.getFullYear(),
        tempDate.getMonth(),
        tempDate.getDate(),
        Number(tempTime[0]),
        Number(tempTime[1])
      );
    };

    try {
      const userCalendarEvents = await db.query(
        `select ne.id, name, location, date, start_time, end_time from network_event ne 
          join user_event ue 
          on ne.id = ue.network_event_id 
          where ue.user_id = $1`,
        [userid]
      );
      if (userCalendarEvents.rowsCount === 0) {
        throw new Error("User has not yet attented any events");
      }

      result = userCalendarEvents.rows.map(eventObj => {
        let obj = {};
        obj.id = eventObj.id;
        obj.title = eventObj.name;
        // obj.start = convertDate(eventObj.date, eventObj.start_time);
        obj.start = convertDate(eventObj.date, eventObj.start_time).toString();
        obj.end = convertDate(eventObj.date, eventObj.end_time).toString();
        console.log(obj)
        return obj;
      });

      res.status(200).send(result);
    } catch (exception) {
      console.error(exception);
      res.status(404).json({ message: exception });
    }
  });

  // POST users/:id/contact
  userRouter.post("/:userId/contacts/:contactId", middleware.checkToken, async (req, res) => {
    const contactId = req.params.contactId;
    const userId = req.params.userId;
    const calDistance = (lat1, lon1, lat2, lon2) => {
      const toRad = function(num) {
        return num * (Math.PI / 180);
      };
      var R = 6371e3; // metres
      var φ1 = toRad(lat1);
      var φ2 = toRad(lat2);
      var Δφ = toRad(lat2 - lat1);
      var Δλ = toRad(lon2 - lon1);
      var a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      var d = R * c;
      return d;
    };

    const { lat, long } = req.body;

    try {
      let events = await db.query(
        `select * from network_event ne 
        join user_event ue 
        on ne.id = ue.network_event_id 
        where ue.user_id = $1
        and ne.date = $2
        `,
        [userId, moment(new Date()).format("YYYY-MM-DD")]
      );

      if (events.rowCount === 0) {
        throw new Error("No event found for the users");
      }

      let closestEvents = events.rows.map(event => {
        const tempEvent = {
          ...event,
          distance: calDistance(lat, long, event.lat, event.long)
        };
        return tempEvent;
      });

      closestEvents.sort((x, y) => x.distance - y.distance);

      let found = await db.query(
        `select * from contact where user_event_id = $1 and user_id = $2`,
        [closestEvents[0].id, contactId]
      );

      if (found.rowCount >= 1) {
        throw new Error(`You have already added this user`);
      }

      let contact = await db.query(
        `insert into contact (user_event_id, user_id) values ($1, $2) returning *`,
        [closestEvents[0].id, contactId]
      );

      if (contact.rowCount !== 1) {
        throw new Error(`Create Contact failed`);
      }

      res.status(200).json(contact.rows[0]);
    } catch (exception) {
      console.log(exception);
      res.status(404).json({ message: exception });
    }
  });

  return userRouter;
};
