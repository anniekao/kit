const router = require('express').Router();
const moment = require('moment');
const middleware = require('../middleware/index');

module.exports = db => {
  router.get('/:id/history', middleware.checkToken, async (req, res) => {
    try {
      const eventHistory = await db.query(
        `
        SELECT network_event.id, name, location, date, start_time, end_time 
        FROM network_event
        JOIN user_event ON network_event_id = network_event.id
        WHERE user_id = $1 AND date <= $2
      `,
        [req.params.id, moment(new Date()).format('YYYY-MM-DD')]
      );

      if (eventHistory) {
        res.status(200).json(eventHistory.rows);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (exception) {
      console.error(exception);
      res.status(400).json({ message: exception });
    }
  });

  return router;
};
