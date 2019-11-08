const router = require('express').Router();

module.exports = db => {
  router.get('/:userId/events/:eventId', async (req, res) => {
    try {
      const eventDetails = await db.query(
        `
        SELECT id, name, location, date, start_time, end_time
        FROM network_event
        WHERE id = $1
        `,
        [req.params.eventId]
      );

      const eventContacts = await db.query(
        `
        SELECT users.id, first_name, last_name, email, phone, occupation, bio, company
        FROM users
        JOIN contact ON user_id = users.id
        JOIN user_event ON user_event_id = user_event.id
        WHERE (user_event.user_id = $1 AND user_event.network_event_id = $2)
      `,
        [req.params.userId, req.params.eventId]
      );

      if (eventDetails && eventContacts) {
        const data = {
          eventDetails: eventDetails.rows,
          eventContacts: eventContacts.rows
        };

        res.status(200).json(data);
      } else {
        res.status(404).json({ error: 'User/event not found' });
      }
    } catch (exception) {
      console.error(exception);
    }
  });

  return router;
};