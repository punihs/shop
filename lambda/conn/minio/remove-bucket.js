const minio = require('.');

const { MINIO_BUCKET } = require('./../../config/environment');

const { log } = console;


minio
  .removeBucketAsync(MINIO_BUCKET)
  .then(() => {
    log('removeBucket: succeded');
    return minio
      .makeBucketAsync(MINIO_BUCKET, 'us-west-1')
      .then(() => log('makeBucket: succeded'));
  })
  .catch(e => log('Remove bucket: error', e));
