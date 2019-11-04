require("dotenv").config();

const router = require("express").Router();
const axios = require("axios");

module.exports = () => {
  router.get("/", (req, res) => {
    let url = 'https://www.eventbriteapi.com/v3/events/search/?';

    const params = {
      q: 'tech%20events',
      'location.address': 'toronto',
      'location.within': '25km',
      // category id 102 for science and tech
      categories: '102',
      expand: 'venue'
    };
  
    Object.keys(params).forEach(function(key) {
      url[url.length - 1] === '?'
        ? (url += key + '=' + params[key])
        : (url += '&' + key + '=' + params[key]);
    });
  
    axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.EVENTBRITE}`
      }
    })
      .then(resp =>
        res.status(200).json(resp.data.events)
      )
      .catch(err => {
        // TODO: FIX ERROR CATCH / VALIDATION
        console.log('Status code: ', err.response.status);
        res.status(418).json({ message: "error" });
      });
  })

  return router;
}