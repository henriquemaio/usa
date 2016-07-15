import express from 'express';
const router = express.Router();

import db from '../db/config';

/* GET home page. */
router
  .get('/', get);

async function get(req, res, next) {
  res.json({hello: "hellor"});
}

module.exports = router;
