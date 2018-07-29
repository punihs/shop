const fs = require('fs');
const smartcrop = require('./');
const minio = require('../');
const { MINIO_BUCKET, root } = require('../../../config/environment');


describe('smartcrop', () => {
  before(async () => minio
    .putObjectAsync(MINIO_BUCKET, 'testing-crop.png', fs.createReadStream(`${root}/public/app/img/cguide_box3.png`)));

  it('finish', (done) => {
    const src = 'testing-crop.png';
    smartcrop(src, 'testing-crop.png-thumb.png', 35, 35)
      .then(() => {
        done();
      });
  });
});
