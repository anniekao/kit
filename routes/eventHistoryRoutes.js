const router = require("express").Router();

module.exports = db => {
  router.get("/:id/history", (req, res) => {
    console.log(req.params.id)

    

    res.status(200).json({ message: "test" })
  })

  return router;
}