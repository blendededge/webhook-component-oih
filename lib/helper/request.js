/* eslint-disable no-use-before-define */
const request = require('request');
const qs = require('querystring');

exports.putOrPost = function putOrPost(method, msg, conf) {
  const { uri } = conf;
  const { data } = msg;

  const requestSettings = buildRequestSettings(method, uri, conf.secret);
  requestSettings.body = JSON.stringify(data);
  requestSettings.headers['Content-Type'] = 'application/json;charset=UTF-8';

  request(requestSettings, callback.bind(this));
};

exports.get = function get(msg, conf) {
  let { uri } = conf;

  // Check if URI ends in ?  If it doesn't add one.
  if (uri.charAt(uri.length - 1) !== '?') {
    uri += '?';
  }

  uri += qs.stringify(msg.data);

  const requestSettings = buildRequestSettings('GET', uri, conf.secret);
  request(requestSettings, callback.bind(this));
};

function buildRequestSettings(method, uri, secret) {
  const requestSettings = {
    uri,
    method,
    headers: {},
  };

  if (secret) {
    requestSettings.headers['X-Api-Secret'] = secret;
  }

  return requestSettings;
}

function callback(err, response, body) {
  if (err) {
    this.emit('error', err);
    this.emit('end');
    return;
  }

  const sc = response.statusCode;

  if (sc >= 200 && sc <= 206) {
    this.emit('data', newMessage(response, body));
  } else {
    this.emit('error', new Error(`Endpoint responds with ${sc}`));
  }
  this.emit('end');
}

function newMessage(response, body) {
  const { headers } = response;
  const contentType = headers['content-type'];
  const msgBody = getJSONBody(contentType, body);
  const msg = {
    data: msgBody,
    attachments: {},
    metadata: {},
  };
  msg.headers = headers;

  return msg;
}

function getJSONBody(contentType, body) {
  if (contentType && contentType.indexOf('application/json') === 0) {
    return JSON.parse(body);
  }

  return {
    responseBody: body,
  };
}
