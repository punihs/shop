angular
  .module('uiGenApp')
  .factory('S3', ($http, toaster, URLS) => ({
    upload: (file, data, $ctrl) => $http
      .get('/minio/presignedUrl', { params: { filename: file.name } })
      .then(({ data: { object, url } }) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url, true);
        xhr.send(file);
        xhr.onload = () => {
          if (xhr.status === 200) {
            toaster.pop('success', 'File uploaded');
            Object.assign(data, { object });
            Object.assign($ctrl, { uploadingPhotos: false });
            $http
              .post('/minio/thumb', { object })
              .then(() => {
                const objectThumb = `${URLS.CDN}/shoppre/${data.object.replace('.', '-thumb.')}`;
                toaster.pop('success', 'Conversion done');
                Object.assign(data, { object_thumb: objectThumb });
              })
              .catch(() => toaster.pop('error', 'Error while uploading file'));
          }
        };
        return object;
      })
      .catch(() => toaster.pop('error', 'Error while uploading file')),

    uploadAdvanced: (file, data, $ctrl) => $http
      .get('/minio/presignedUrl', { params: { filename: file.name } })
      .then(({ data: { object, url } }) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url, true);
        xhr.send(file);
        xhr.onload = () => {
          if (xhr.status === 200) {
            toaster.pop('success', 'File uploaded');
            Object.assign(data, { object_advanced: object });
            Object.assign($ctrl, { uploadingPhotos: false });
            $http
              .post('/minio/thumb', { object })
              .then(() => {
                const objectThumb = `${URLS.CDN}/shoppre/${data
                  .object_advanced
                  .replace('.', '-thumb.')}`;
                toaster.pop('success', 'Conversion done');
                Object.assign(data, { object_advanced_thumb: objectThumb });
              })
              .catch(() => toaster.pop('error', 'Error while uploading file'));
          }
        };
        return object;
      })
      .catch(() => toaster.pop('error', 'Error while uploading file')),

    uploadInvoice: (file, data, $ctrl) => $http
      .get('/minio/presignedUrl', { params: { filename: file.name } })
      .then(({ data: { object, url } }) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url, true);
        xhr.send(file);
        xhr.onload = () => {
          if (xhr.status === 200) {
            toaster.pop('success', 'File uploaded');
            Object.assign(data, { object_invoice: object });
            Object.assign($ctrl, { uploadingPhotos: false });
            $http
              .post('/minio/thumb', { object })
              .then(() => {
                const objectThumb = `${URLS.CDN}/shoppre/${data
                  .object_invoice
                  .replace('.', '-thumb.')}`;
                toaster.pop('success', 'Conversion done');
                Object.assign(data, { object_invoice_thumb: objectThumb });
              })
              .catch(() => toaster.pop('error', 'Error while uploading file'));
          }
        };
        return object;
      })
      .catch(() => toaster.pop('error', 'Error while uploading file')),

    uploadEcommerce: (file, data, $ctrl) => $http
      .get('/minio/presignedUrl', { params: { filename: file.name } })
      .then(({ data: { object, url } }) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url, true);
        xhr.send(file);
        xhr.onload = () => {
          if (xhr.status === 200) {
            toaster.pop('success', 'File uploaded');
            Object.assign(data, { object_ecommerce: object });
            Object.assign($ctrl, { uploadingPhotos: false });
            $http
              .post('/minio/thumb', { object })
              .then(() => {
                const objectThumb = `${URLS.CDN}/shoppre/${data
                  .object_ecommerce
                  .replace('.', '-thumb.')}`;
                toaster.pop('success', 'Conversion done');
                Object.assign(data, { object_ecommerce_thumb: objectThumb });
              })
              .catch(() => toaster.pop('error', 'Error while uploading file'));
          }
        };
        return object;
      })
      .catch(() => toaster.pop('error', 'Error while uploading file')),
  }));
