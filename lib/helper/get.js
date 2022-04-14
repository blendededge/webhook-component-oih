const { wrapper } = require('@blendededge/ferryman-extensions');
const request = require('./request.js');

// eslint-disable-next-line func-names
exports.process = function (msg, conf) {
  const wrapped = wrapper(this, msg, conf, {});
  request.get.call(wrapped, msg, conf);
};
