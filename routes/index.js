import express from 'express';
import users from '../models/users.js';
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});


router.post('/', async (req, res, next) => {
  let user = await users.create({
    name: req.body.name,
    meetingId: `${nanoid(4)}-${nanoid(3)}-${nanoid(4)}`,
    type: 'owner'
  });
  res.redirect(`/meeting/${user._id}/${user.meetingId}`);
});

router.get('/meeting/:userId/:meetingId', async (req, res, next) => {
  let user = await users.findOne({
    _id: req.params.userId,
    meetingId: req.params.meetingId
  }).lean();
  if (user) {
    res.render('meeting', {
      domain: process.env.DOMAIN,
      user
    });
  } else {
    res.redirect("/");
  }
});


router.get('/join/:meetingId', async (req, res, next) => {
  res.render('join');
});

router.post('/join/:meetingId', async (req, res, next) => {
  let totalUser = await users.countDocuments({ meetingId: req.params.meetingId });
  if (totalUser < 3) {
    let user = await users.create({
      name: req.body.name,
      meetingId: req.params.meetingId,
      type: 'participant'
    });
    res.redirect(`/meeting/${user._id}/${user.meetingId}`);
  } else {
    res.render('error', { message: "Only 3 users allowed" });
  }
});

export default router;
