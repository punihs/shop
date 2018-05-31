const { UserDocument } = require('../../conn/sqldb');
const minio = require('./../../conn/minio');
const logger = require('./../../components/logger');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'customer_id'],
    limit: Number(req.query.limit) || 20,
  };
  if (req.query.customer_id) options.where = { customer_id: req.user.id };

  return UserDocument
    .findAll(options)
    .then(userDocument => res.json(userDocument))
    .catch(next);
};

exports.create = async (req, res, next) => {
  try {
    const { document_file: documentFile } = req.body;

    if (documentFile && !['txt', 'pdf'].includes(documentFile.filename.split('.').pop())) {
      return res.status(400).end('Invalid File');
    }

    const userDocument = req.body;
    userDocument.created_by = req.user.id;

    userDocument.customer_id = req.user.id;

    const saved = await UserDocument
      .create(userDocument);
    const { id } = saved;

    if (req.body.document_file) {
      minio
        .base64UploadCustom('user_documents', id, documentFile)
        .then(({ object }) => saved.update({ object }))
        .catch(err => logger.error('UserDocuments.express', err, req.user, req.body));
    }

    return res.status(201).json({ id });
  } catch (e) {
    return next(e);
  }
};

exports.destroy = async (req, res, next) => {
  const { id } = req.params;
  UserDocument
    .destroy({
      where: { id },
    })
    .then(deleted => res.json(deleted))
    .catch(next);
};
exports.download = (req, res, next) => {
  const { id } = req.params;
  return UserDocument
    .findById(id, {
      attributes: ['object', 'name'],
    })
    .then((userDocument) => {
      const { object } = userDocument.toJSON();
      const ext = object.split('.').pop();
      return minio.downloadLink({ object, name: `userDocument-${id}-${userDocument.name}.${ext}` });
    })
    .then(url => res.redirect(url))
    .catch(next);
};
