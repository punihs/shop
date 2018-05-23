const MinioClient = require('minio').Client;
const Bluebird = require('bluebird');
const {
  MINIO_ENDPOINT, MINIO_PORT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, env,
  DOMAIN, PREFIX, MINIO_BUCKET,
} = require('../../config/environment');
const logger = require('../../components/logger');

const Minio = new MinioClient({
  endPoint: MINIO_ENDPOINT,
  port: Number(MINIO_PORT),
  secure: env === 'production',
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});
Bluebird.promisifyAll(Object.getPrototypeOf(Minio));

Minio.bufferUpload = (minioObject) => {
  const minObj = minioObject;
  minObj.bucket = minObj.bucket || MINIO_BUCKET; // Bucket name always in lowercaseObj
  return Minio.putObjectAsync(
    minObj.bucket, minObj.object,
    minObj.buffer, 'application/octet-stream',
  );
};

function qualifyBucket(bucketName) {
  let bucket = bucketName;
  if (typeof bucket === 'string' && bucket[0] === '/') {
    bucket = bucket.slice(1);
  }
  return bucket.toLowerCase();
}

Minio.base64Upload = (minioObject) => {
  const minObj = minioObject;
  minObj.buffer = Buffer.from(minioObject.base64String, 'base64');
  return Minio.bufferUpload(minObj);
};

Minio.base64UploadMulti = minioObjects => Promise.all(minioObjects.map(m => Minio.base64Upload(m)));

Minio.viewLink = (minioObject) => {
  const minObj = minioObject;
  minObj.bucket = minObj.bucket || MINIO_BUCKET; // Bucket name always in lowercaseObj
  minObj.expires = minObj.expires || 24 * 60 * 60; // Expired in one day
  if (!minObj.object) {
    logger.error('Minio: View File not found', minObj);
    return Promise.resolve(`${PREFIX}api.${DOMAIN}/api/404.pdf`);
  }
  return Minio.statObjectAsync(minObj.bucket, qualifyBucket(minObj.object))
    .then(() => Minio
      .presignedGetObjectAsync(minObj.bucket, qualifyBucket(minObj.object), minObj.expires))
    .catch(() => {
      logger.error('Minio: View File not found', minObj);
      return `${PREFIX}api.${DOMAIN}/api/404.pdf`;
    });
};

Minio.downloadLinkBase = (minioObject) => {
  if (!minioObject.name) return logger.error('File Name required for download');
  const minObj = minioObject;
  minObj.bucket = minObj.bucket || MINIO_BUCKET; // Bucket name always in lowercaseObj
  minObj.expires = minObj.expires || 24 * 60 * 60; // Expired in one day
  minObj.headers = {
    'response-content-disposition':
      `attachment; filename="${minObj.name.replace(/[^a-zA-Z0-9-_.]/g, '')}"`,
  };
  return Minio.presignedGetObjectAsync(
    minObj.bucket.toLowerCase(), minObj.object,
    minObj.expires, minObj.headers,
  );
};

Minio.agreementCompat = function agreementCompat(filePath) {
  return (filePath || '').replace('/home/gloryque/QDMS/', '');
};

Minio.downloadLink = (minioObject, qualify = false) => {
  const minObj = minioObject;
  minObj.bucket = minObj.bucket || MINIO_BUCKET; // Bucket name always in lowercase
  return Minio
    .statObjectAsync(minObj.bucket, qualify
      ? qualifyBucket(minObj.object)
      : minObj.object)
    .then(() => Minio.downloadLinkBase(minObj))
    .catch((err) => {
      logger.error('Minio: File not found', minObj, err);
      return `${PREFIX}api.${DOMAIN}/api/404.pdf`;
    });
};

Minio.retryDownloadLink = (minioObject) => {
  const minObj = minioObject;
  minObj.bucket = minObj.bucket || MINIO_BUCKET; // Bucket name always in lowercase
  return Minio.statObjectAsync(minObj.bucket, qualifyBucket(minObj.object))
    .then(() => Minio.downloadLinkBase(minObj))
    .catch((e) => {
      logger.error('Minio: retry', minObj, e);
      return Minio.statObjectAsync(minObj.bucket, qualifyBucket(minObj.retryObject))
        .then(() => {
          minObj.object = minObj.retryObject;
          return Minio.downloadLink(minObj);
        })
        .catch((err) => {
          logger.error('Minio: File not found', minObj, err);
          return `${PREFIX}api.${DOMAIN}/api/404.pdf`;
        });
    });
};

Minio.uploadLink = (minioObject) => {
  const minObj = minioObject;
  minObj.bucket = minObj.bucket || MINIO_BUCKET; // Bucket name always in lowercaseObj
  minObj.expires = minObj.expires || 24 * 60 * 60; // Expired in one day
  return Minio.presignedPutObjectAsync(minObj.bucket, qualifyBucket(minObj.object), minObj.expires);
};

module.exports = Minio;
