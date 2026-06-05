const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const config = require('../config');

const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

const uploadFile = async (buffer, key, mimetype) => {
  await s3Client.send(new PutObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }));

  const readUrl = await getSignedUrl(s3Client, new GetObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: key,
  }), { expiresIn: 604800 });

  return readUrl;
};

const deleteFile = async (imageUrl) => {
  const url = new URL(imageUrl);
  const key = url.pathname.slice(1);
  await s3Client.send(new DeleteObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: key,
  }));
};

module.exports = { uploadFile, deleteFile };
