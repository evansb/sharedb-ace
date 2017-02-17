import WebSocket from 'reconnecting-websocket';
import EventEmitter from 'event-emitter-es6';
import sharedb from 'sharedb/lib/client';
import SharedbAceBinding from './sharedb-ace-binding';

class SharedbAce extends EventEmitter {

  /**
   * @param wsUrl - URL to connect to shareDB
   * @param namespace - database table
   * @param id - document id
   *
   * creating a sharedbAce instance connects to sharedb via the websocket URL
   * and initiates the document
   * and initializes the sharedb with no connections
   */
  constructor(wsUrl, namespace, id) {
    super();
    const self = this;
    const socket = new WebSocket(wsUrl);
    const connection = new sharedb.Connection(socket);
    const doc = connection.get(namespace, id);
    // Fetches once from the server, and fires events on subsequent document changes

    const docSubscribed = (err) => {
      if (err) throw err;

      if (doc.type === null) {
        throw new Error('Document Uninitialized');
      }

      self.emit('ready');
    };

    doc.subscribe(docSubscribed.bind(doc));

    self.doc = doc;
    self.connections = {};
  }

  /**
   * @param aceInstance - Ace Editor Instance
   * @param doc - ShareDB.Doc instance
   * adds a two-way binding between an aceInstance and the path
   * eg. add(aceInstance, ['foo']);
   */
  add(aceInstance, path) {
    const binding = new SharedbAceBinding(aceInstance, path, this.doc);
    this.connections[path.join(',')] = binding;
  }
}

export default SharedbAce;
