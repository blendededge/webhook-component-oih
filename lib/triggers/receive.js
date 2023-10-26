const { wrapper } = require('@blendededge/ferryman-extensions');

/* eslint-disable no-underscore-dangle,no-param-reassign */
exports.process = async function receive(msg, cfg, snapshot, headers, tokenData) {
  let wrapped;
  try {
    wrapped = await wrapper(this, msg, cfg, snapshot, headers, tokenData);
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

    wrapped.logger.info('Emitting data of message');
    wrapped.logger.trace('Emitting data of message: ', msgId);
    await wrapped.emit('data', msg);
    wrapped.logger.info('Data emitted');
    wrapped.emit('end');
  } catch (e) {
    if (wrapped) {
      wrapped.logger.error(e);
      wrapped.emit('error', e);
    } else {
      this.logger.error(e);
      this.emit('error', e);
    }
  }
};
