/* eslint-disable no-underscore-dangle,no-param-reassign */
exports.process = async function receive(msg) {
  const msgId = msg.id;
  this.logger.info('Received new message');

  if (msg.data) {
    if (msg.query) {
      msg.data._query = msg.query;
    }

    if (msg.headers) {
      msg.data._headers = msg.headers;
    }
    if (msg.method) {
      msg.data._method = msg.method;
    }

    if (msg.url) {
      msg.data._url = msg.url;
    }

    if (msg.additionalUrlPath) {
      msg.data._additionalUrlPath = msg.additionalUrlPath;
    }
  }

  this.logger.info('Emitting data of message');
  this.logger.trace('Emitting data of message: ', msgId);
  await this.emit('data', msg);
  this.logger.info('Data emitted');
};
