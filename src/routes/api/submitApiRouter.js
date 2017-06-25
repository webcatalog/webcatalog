import express from 'express';
import passport from 'passport';
import { Client as IntercomClient } from 'intercom-client';

const submitApiRouter = express.Router();

const intercomClient = new IntercomClient({ token: process.env.INTERCOM_ACCESS_TOKEN });

submitApiRouter.post('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  console.log(req.body);

  if (!req.body) return next(new Error('Request is not valid.'));

  if (!req.body.name || !req.body.url) {
    return next(new Error('Request is not valid.'));
  }

  const message = {
    from: {
      type: 'user',
      id: req.user.id,
      email: req.user.email,
    },
    body: `App Submission (${new Date()}):
    Name: ${req.body.name}
    URL: ${req.body.url}
    `,
  };

  // eslint-disable-next-line no-unused-vars
  return intercomClient.messages.create(message, (err, response) => {
    if (err) return next(err);

    return res.json({ success: true });
  });
});


module.exports = submitApiRouter;
