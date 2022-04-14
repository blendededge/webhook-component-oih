const { wrapper } = require('@blendededge/ferryman-extensions');
const request = require('../helper/request.js');

const DEFAULT_METHOD = 'POST';

// eslint-disable-next-line func-names
exports.process = function (msg, conf) {
  const wrapped = wrapper(this, msg, conf, {});
  request.putOrPost.call(wrapped, conf.method || DEFAULT_METHOD, msg, conf);
};
