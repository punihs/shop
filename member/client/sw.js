self.addEventListener('fetch', function (e) {
  console.info('%s request to %s. More details: %o'
    , e.request.method
    , e.request.url
    , e
  );
});
