const { wrapper } = require('@blendededge/ferryman-extensions');
const request = require('../helper/request');

const DEFAULT_METHOD = 'POST';

// eslint-disable-next-line func-names
exports.process = async function (msg, conf, snapshot, headers, tokenData) {
  const wrapped = await wrapper(this, msg, conf, snapshot, headers, tokenData);
  request.putOrPost.call(wrapped, conf.method || DEFAULT_METHOD, msg, conf);
};
