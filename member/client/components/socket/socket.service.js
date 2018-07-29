
function Socket($rootScope, $http, socketFactory, URLS) {
  'ngInject';
  // socket.io now auto-configures its connection when we ommit a connection url

  const ioSocket = io(URLS.API_BASE, {
    // Send auth token on connection, you will need to DI the Auth service above
    // 'query': 'token=' + Auth.getToken()
    path: '/socket.io-client',
  });

  const socket = socketFactory({
    ioSocket,
  });

  return {
    socket,

    /**
     * Register listeners to sync an array with updates on a model
     *
     * Takes the array we want to sync, the model name that socket updates are sent from,
     * and an optional callback function after new items are updated.
     */
    syncUpdates(modelName, items, appendAtBeginning) {
      /**
       * Syncs item creation/updates on 'model:save'
       */
      socket.on(`${modelName}:save`, (item) => {
        items[appendAtBeginning ? 'push' : 'unshift'](item);
      });
    },

    emit(tag, data) {
      socket.emit(tag, data);
    },

    /**
     * Removes listeners for a models updates on the socket
     *
     * @param modelName
     */
    unsyncUpdates(modelName) {
      socket.removeAllListeners(`${modelName}:save`);
      socket.removeAllListeners(`${modelName}:remove`);
    },
  };
}

angular.module('uiGenApp')
  .factory('socket', Socket);
