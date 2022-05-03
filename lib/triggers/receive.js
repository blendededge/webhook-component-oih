const { wrapper } = require('@blendededge/ferryman-extensions');

/* eslint-disable no-underscore-dangle,no-param-reassign */
exports.process = async function receive(msg, cfg = {}) {
  const wrapped = wrapper(this, msg, cfg, {});
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
  await wrapped.emit('data', msg);
  this.logger.info('Data emitted');
};
