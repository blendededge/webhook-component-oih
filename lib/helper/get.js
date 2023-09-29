const { wrapper } = require('@blendededge/ferryman-extensions');
const request = require('./request');

// eslint-disable-next-line func-names
exports.process = async function (msg, conf, snapshot, headers, tokenData) {
  const wrapped = await wrapper(this, msg, conf, snapshot, headers, tokenData);
  request.get.call(wrapped, msg, conf);
};
