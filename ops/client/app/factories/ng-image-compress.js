
/**
 * adapted off of weeroom/angularjs-imageupload-directive and JIC from github
 * https://github.com/weroom/angularjs-imageupload-directive/blob/master/public/javascripts/imageupload.js
 * https://github.com/brunobar79/J-I-C
 **/

angular.module('uiGenApp').directive('ngImageCompress', ($q, toaster) => {
  const URL = window.URL || window.webkitURL;

    /**
     * Receives an Image Object (can be JPG OR PNG) and returns a new Image Object compressed
     * @param {Image} sourceImgObj The source Image Object
     * @param {Integer} quality The output quality of Image Object
     * @return {Image} result_image_obj The compressed Image Object
     */

  const jicCompress = (sourceImgObj, options) => {
    const outputFormat = options.resizeType;
    const quality = options.resizeQuality * 100 || 70;
    let mimeType = 'image/jpeg';
    if (outputFormat !== undefined && outputFormat === 'png') {
      mimeType = 'image/png';
    }


    const maxHeight = options.resizeMaxHeight || 300;
    const maxWidth = options.resizeMaxWidth || 250;

    let height = sourceImgObj.height;
    let width = sourceImgObj.width;

      // calculate the width and height, constraining the proportions
    if (width > height) {
      if (width > maxWidth) {
        height = Math.round(height *= maxWidth / width);
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = Math.round(width *= maxHeight / height);
        height = maxHeight;
      }
    }

    const cvs = document.createElement('canvas');
    cvs.width = width; // sourceImgObj.naturalWidth;
    cvs.height = height; // sourceImgObj.naturalHeight;
    cvs.getContext('2d').drawImage(sourceImgObj, 0, 0, width, height);
    const newImageData = cvs.toDataURL(mimeType, quality / 100);
    const resultImageObj = new Image();
    resultImageObj.src = newImageData;
    return resultImageObj.src;
  };

  const createImage = (url, callback) => {
    const image = new Image();
    image.onload = () => {
      callback(image);
    };
    image.src = url;
  };

  const fileToDataURL = (file) => {
    const deferred = $q.defer();
    const reader = new FileReader();
    reader.onload = (e) => {
      deferred.resolve(e.target.result);
    };
    reader.readAsDataURL(file);
    return deferred.promise;
  };

  return {
    restrict: 'A',
    scope: {
      image: '=',
      uploadFn: '=',
      ctrl: '=',
      resizeMaxHeight: '@?',
      resizeMaxWidth: '@?',
      resizeQuality: '@?',
      resizeType: '@?',
    },
    link: function postLink(scope, element, attrs) {
      const urltoFile = (url, filename, mime) => {
        const mimeType = mime || (url.match(/^data:([^;]+);/) || '')[1];
        return (fetch(url)
              .then(res => res.arrayBuffer())
              .then(buf => new File([buf], filename, { type: mimeType }))
          );
      };

      const doResizing = (imageResult, callback) => {
        createImage(imageResult.url, (image) => {
          const dataURLcompressed = jicCompress(image, scope);
          Object.assign(imageResult, {
            compressed: {
              dataURL: dataURLcompressed,
              type: dataURLcompressed.match(/:(.+\/.+);/)[1],
            },
          });

          callback(imageResult);
        });
      };

      const applyScope = (imageResult) => {
        const { type, dataURL } = imageResult.compressed;
        urltoFile(dataURL, imageResult.file.name, type)
            .then((file) => {
              scope.uploadFn(scope.ctrl, file);
            })
            .catch(() => toaster.pop('Error while optimising photo'));

        scope.$apply(() => {
            // console.log(imageResult);
          if (attrs.multiple) {
            scope.image.push(imageResult);
          } else {
            Object.assign(scope, { image: imageResult });
          }
        });
      };

      element.bind('change', (evt) => {
          // when multiple always return an array of images
        if (attrs.multiple) {
          Object.assign(scope, { image: [] });
        }

        const files = evt.target.files;
        for (let i = 0; i < files.length; i++) {
            // create a result object for each file in files
          const imageResult = {
            file: files[i],
            url: URL.createObjectURL(files[i]),
          };

          fileToDataURL(files[i]).then((dataURL) => {
            imageResult.dataURL = dataURL;
          });

          if (scope.resizeMaxHeight || scope.resizeMaxWidth) { // resize image
            doResizing(imageResult, (resizedImage) => {
              applyScope(resizedImage);
            });
          } else { // no resizing
            applyScope(imageResult);
          }
        }
      });
    },
  };
});
