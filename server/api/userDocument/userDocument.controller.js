const logger = require('./../../components/logger');

const minio = require('./../../conn/minio');
const { UserDocument } = require('../../conn/sqldb');

exports.index = async (req, res, next) => {
  try {
    const options = {
      attributes: ['id', 'customer_id', 'object', 'created_at', 'description'],
      limit: Number(req.query.limit) || 20,
    };

    if (req.query.customer_id) options.where = { customer_id: req.user.id };

    const userDocuments = await UserDocument
      .findAll(options);

    return res.json(userDocuments);
  } catch (err) {
    return next(err);
  }
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
  } catch (err) {
    return next(err);
  }
};

exports.destroy = async (req, res, next) => {
  const { id } = req.params;
  try {
    const deletionStatus = await UserDocument
      .destroy({
        where: { id },
      });

    return res.json(deletionStatus);
  } catch (err) {
    return next(err);
  }
};

exports.download = async (req, res, next) => {
  const { id } = req.params;

  try {
    const url = await UserDocument
      .findById(id, {
        attributes: ['object', 'name'],
      })
      .then((userDocument) => {
        const { object } = userDocument.toJSON();
        const ext = object.split('.').pop();
        return minio
          .downloadLink({
            object,
            name: `userDocument-${id}-${userDocument.name}.${ext}`,
          });
      });

    return res.redirect(url);
  } catch (err) {
    return next(err);
  }
};
