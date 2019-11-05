const userRouter = require('express').Router();

module.exports = db => {

  // GET /users
  userRouter.get('/', async (req, res) => {
    // select all columns in users table except for password
    const users = await db.query(`
      SELECT first_name, last_name, email, phone, occupation, bio, qr_code, company, id FROM users;
    `);
    res.status(200).json(users.rows)
  })

  // POST /users : Is this necessary because user is already created in sign up route ?

  // GET /users/:id
  userRouter.get('/:id', async (req, res) => {
    try {
      // select all columns in users table except for password
      const user = await db.query(`
        SELECT first_name, last_name, email, phone, occupation, bio, qr_code, company, id FROM users WHERE id = $1;
      `, [req.params.id]);

      if (user) {
        res.status(200).json(user.rows[0])
      } else {
        res.status(404).json({error: 'User not found'})
      }
    } catch(exception) {
      console.error(exception); 
    }
  })

  // PUT /users/:id
  userRouter.put('/:id', async (req, res) => {
    // create arrays with all elements except for id key and value
    const fields = Object.keys(req.body).filter(field => field !== 'id');
    const queryParams = Object.values(req.body);
    // removes id value
    queryParams.pop();

    // count to keep track of $1 placeholders
    let count = 1;
    let queryStr = `UPDATE users SET `

    // append e.g. first_name = $1 to query string
    // also append comma to every element except last
    for (let i = 0; i < fields.length; i++) {
      if (i !== fields.length - 1) {
        queryStr += `${fields[i]}=$${count}, `
      } else {
        queryStr += `${fields[i]}=$${count} `
      }
      count++;
    }

    queryStr += `WHERE id = ${req.body.id} RETURNING first_name, last_name, email, phone, occupation, bio, qr_code, company;`

    try {
      const updatedUser = await db.query(queryStr, queryParams);
      if (updatedUser) {
        res.status(200).json(updatedUser.rows[0])
      } else {
        res.status(400).json({error: 'Could not updated user'})
      }
    } catch (exception) {
      console.error(exception);
    }
  })

  // DELETE /users/:id
  userRouter.delete('/:id', async (req, res) => {
    try {
      await db.query(`DELETE FROM users WHERE id = $1;`, [req.params.id])
      res.status(204).json({message: `user ${req.params.id} deleted`})
    } catch (exception) {
      console.error(exception);
    }
  })
  
  return userRouter;
}