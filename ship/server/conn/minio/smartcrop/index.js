
const sharp = require('sharp');
const smartcrop = require('smartcrop-sharp');
const minio = require('../');

const {
  MINIO_BUCKET,
} = require('../../../config/environment');

module.exports = (src, dest, width, height) => minio
  .getObjectAsync(MINIO_BUCKET, src)
  .then(stream => minio
    .streamToBuffer(stream)
    .then((buffer) => {
      const body = buffer;
      return smartcrop
        .crop(body, { width, height })
        .then((result) => {
          const crop = result.topCrop;

          const croppedStream = sharp(body)
            .extract({
              width: crop.width,
              height: crop.height,
              left: crop.x,
              top: crop.y,
            })
            .resize(width, height);

          return minio
            .putObjectAsync(MINIO_BUCKET, dest, croppedStream, 'application/octet-stream');
        });
    }));
