import express from 'express';
import dictionary from "../dictionary.js"

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home',dictionary.home);
});

export default router;
