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
            Object.assign(data, { object });
            Object.assign($ctrl, { uploadingPhotos: false });
            $http
              .post('/minio/thumb', { object })
              .then(() => {
                const objectThumb = `${URLS.CDN}/shoppre/${data.object.replace('.', '-thumb.')}`;
                Object.assign(data, { object_thumb: objectThumb });
              })
              .catch(() => toaster.pop('error', 'Error while uploading file'));
          }
        };

        return object;
      })
      .catch(() => toaster.pop('error', 'Error while uploading file')),


    uploadCod: (file, data, $ctrl) => $http
      .get('/minio/presignedUrl', { params: { filename: file.name } })
      .then(({ data: { object, url } }) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url, true);
        xhr.send(file);
        xhr.onload = () => {
          if (xhr.status === 200) {
            Object.assign(data, { object });
            Object.assign($ctrl, { uploadingPhotos: false });
            Object.assign($ctrl.packageData[$ctrl.index1], { seller_invoice: object });
            $http
              .post('/minio/thumb', { object })
              .then(() => {
                const objectThumb = `${URLS.CDN}/shoppre/${data.object.replace('.', '-thumb.')}`;
                Object.assign(data, { object_thumb: objectThumb });
              })
              .catch(() => toaster.pop('error', 'Error while uploading file'));
          }
        };

        return object;
      })
      .catch(() => toaster.pop('error', 'Error while uploading file')),


  }));
