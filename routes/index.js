import express from 'express';
import users from '../models/users.js';
import { v4 as uuidv4 } from 'uuid';
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});


router.post('/', async (req, res, next) => {
  let user = await users.create({
    name: req.body.name,
    meetingId: uuidv4(),
    type: 'owner'
  });
  res.redirect(`/meeting/${user._id}`);
});

router.get('/meeting/:userId', async (req, res, next) => {
  let user = await users.findOne({
    _id: req.params.userId
  }).lean();

  res.render('meeting', { user, isParticipant: (user.type == 'participant' ? true : false) });
});

router.get('/new/:userId', async (req, res, next) => {
  let user = await users.findOne({
    _id: req.params.userId
  }).lean();

  res.render('new', { user, isParticipant: (user.type == 'participant' ? true : false) });
});


router.get('/join/:meetingId', async (req, res, next) => {
  res.render('join');
});

router.post('/join/:meetingId', async (req, res, next) => {
  let user = await users.create({
    name: req.body.name,
    meetingId: req.params.meetingId,
    type: 'participant'
  });
  res.redirect(`/meeting/${user._id}`);
});

export default router;
