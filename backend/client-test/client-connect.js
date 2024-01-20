
import socketClusterClient from 'socketcluster-client';

// Initiate the connection to the server
let socket = socketClusterClient.create({ hostname: 'localhost', port: '8000', path: '/socketcluster/NFHHHQ'});

(async () => {
  for await (let { error } of socket.listener('error')) {
    console.error(error);
  }
})();

(async () => {
  for await (let event of socket.listener('connect')) {
    console.log('Socket is connected');
  }
})();
