import express from 'express';
import db from '../db/config';
import _ from 'lodash';

const router = express.Router();
const hourstats = db.get('hourstats');

/* GET home page. */
router
  .get('/bymonth/:month', getByMonth)
  .get('/byday/:month/:day', getByDay)
  .get('/total', getTotal);

async function getByMonth(req, res, next) {
  const month = parseInt(req.params.month);
  console.log(month);
  const data = hourstats
          .aggregate([
            {"$match": {month: month}},
            {"$group": {
              _id: {candidate: '$candidate', day: '$day'},
              count: {$sum: 1},
              tweets:{$sum: '$tweets'},
              note : {$sum: '$avg(compound)'}
          }}]);
  data.then(docs => {
     const groupByDay = {};
     _(docs).forEach((doc) => {
       let element= {
         candidate: doc._id.candidate,
         count : doc.count,
         tweets: doc.tweets,
         note: doc.note,
         avg: doc.note/doc.tweets
       };
       if(doc._id.day in groupByDay){
         groupByDay[doc._id.day][doc._id.candidate] = element;
       } else {
         groupByDay[doc._id.day] = {};
         groupByDay[doc._id.day][doc._id.candidate] = element;
       }
     });
    let csv = "data,trump,clinton\n";
    for(var day in groupByDay){
      let date = new Date(2016, month -1, day);
      let hillary = groupByDay[day]['hillary'] && groupByDay[day]['hillary'].avg.toFixed(2) || "0";
      let trump = groupByDay[day]['trump'] && groupByDay[day]['trump'].avg.toFixed(2) || "0";
      csv += date + ',' + hillary + ',' + trump + '\n';
    }
    return res.json({payload:{month: month, data: groupByDay, csv: csv}});
  });
}

async function getByDay(req,res) {
  const day = parseInt(req.params.day);
  const month = parseInt(req.params.month);

  const data = hourstats
          .aggregate([
            {'$match': {month: month, day: day}},
            {'$group': {
              _id: {
                candidate: '$candidate',
                hour: '$hour'
              },
              count: {$sum:1},
              tweets: {$sum : '$tweets'},
              note: {$sum:'$avg(compound)'}
            }}]);
  data.then(docs => {
    let groupByHour= {};
    _(docs).forEach((doc => {
      let element = {
        candidate: doc._id.candidate,
        count: doc.count,
        tweets: doc.tweets,
        note: doc.note,
        avg: doc.note/doc.tweets
      };
      if(doc._id.hour in groupByHour){
        groupByHour[doc._id.hour][doc._id.candidate] = element;
      } else {
        groupByHour[doc._id.hour] = {};
        groupByHour[doc._id.hour][doc._id.candidate] = element;
      }
    }));
    console.log(groupByHour);
    let csv = "data,trump,clinton\n";
    for(var hour in groupByHour){
      let date = new Date(2016, month -1, day, hour);
      let hillary = groupByHour[hour]['hillary'] && groupByHour[hour]['hillary'].avg.toFixed(2) || "0";
      let trump = groupByHour[hour]['trump'] && groupByHour[hour]['trump'].avg.toFixed(2) || "0";
      csv += date + ',' + hillary + ',' + trump + '\n';
    }
    return res.json({payload: {date: {month: month, day: day}, data: groupByHour, csv: csv}});
  });
}

async function getTotal(req, res) {
  const data = hourstats
          .aggregate([{'$group': {
            _id: '$candidate',
            count: {$sum : '$tweets'}
          }}]);
  data.then(docs => {
    let element = {};
    _(docs).forEach(doc => {
      element[doc._id] = {
        count: doc.count
      };
      console.log(element);
    });
    res.json({payload: element});
  });
};

module.exports = router;
