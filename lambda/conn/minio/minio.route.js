const smartResize = require('./smartcrop');

const express = require('express');
const uuidv4 = require('uuid/v4');

const minio = require('./');
const { MINIO_BUCKET } = require('../../config/environment');

const router = express.Router();

router.post('/thumb', (req, res, next) => {
  const { object } = req.body;
  if (!object) return res.status(400).end();
  const parts = object.split('.');
  return smartResize(object, `${parts[0]}-thumb.${parts.pop()}`, 35, 35)
    .then(() => res.status(201).end())
    .catch(next);
});

router.get('/presignedUrl', (req, res, next) => {
  const { filename } = req.query;
  const now = new Date();
  const object = `${now.getFullYear()}/${now.getMonth()}/${uuidv4()}.${filename.split('.').pop()}`;
  return minio
    .uploadLink({
      object,
      bucket: MINIO_BUCKET,
    })
    .then(url => res.json({ object, url }))
    .catch(next);
});

module.exports = router;
