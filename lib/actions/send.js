const { wrapper } = require('@blendededge/ferryman-extensions');
const request = require('../helper/request');

const DEFAULT_METHOD = 'POST';

// eslint-disable-next-line func-names
exports.process = async function (msg, conf, snapshot, headers, tokenData) {
  let wrapped;
  try {
    wrapped = await wrapper(this, msg, conf, snapshot, headers, tokenData);
    request.putOrPost.call(wrapped, conf.method || DEFAULT_METHOD, msg, conf);
  } catch (e) {
    if (wrapped) {
      wrapped.emit('error', e);
      wrapped.logger.error(e);
    } else {
      this.emit('error', e);
      this.logger.error(e);
    }
  }
};
