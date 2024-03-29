/* eslint-disable no-unused-expressions,no-underscore-dangle */
const { expect } = require('chai');
const sinon = require('sinon');
const nock = require('nock');

const send = require('../lib/actions/send');
const getMethod = require('../lib/helper/get');
const receive = require('../lib/triggers/receive');

const logger = {
  child: () => ({
    debug: () => {},
    info: () => {},
    error: () => {},
  }),
};

describe('Test Webhook', () => {
  afterEach(() => {
    sinon.reset();
  });
  const webhookReturnObj = { message: 'ok', other: 'returned' };
  let self;

  it('PUT No Auth', (done) => {
    const nockObj = nock('http://www.example.com')
      .put('/test', {
        k1: 'v1',
        k2: 'v2',
      })
      .matchHeader('Content-Type', 'application/json;charset=UTF-8')
      .reply(200, webhookReturnObj, {
        'Content-type': 'application/json;charset=UTF-8',
      });

    const executeAction = new Promise((resolve) => {
      const emitter = {
        emit: (name) => {
          if (name === 'end') {
            resolve();
          }
        },
      };
      self = sinon.spy(emitter, 'emit');
      send.process.call({ emit: self, logger }, {
        data: {
          k1: 'v1',
          k2: 'v2',
        },
        metadata: {},
      }, {
        uri: 'http://www.example.com/test',
        method: 'PUT',
      });
    });
    executeAction.then(() => {
      expect(nockObj.isDone());
      expect(self.calledTwice).to.be.true;
      expect(self.args[0][1].data).to.eql(webhookReturnObj);
      expect(self.args[1][0]).to.eql('end');
      done();
    });
  });

  it('PUT Auth', (done) => {
    const nockObj = nock('http://www.example.com')
      .put('/test', {
        k1: 'v1',
        k2: 'v2',
      })
      .matchHeader('Content-Type', 'application/json;charset=UTF-8')
      .matchHeader('X-Api-Secret', 'theSecret')
      .reply(200, webhookReturnObj, {
        'Content-type': 'application/json;charset=UTF-8',
      });

    const executeAction = new Promise((resolve) => {
      const emitter = {
        emit: (name) => {
          if (name === 'end') {
            resolve();
          }
        },
      };
      self = sinon.spy(emitter, 'emit');
      send.process.call({ emit: self, logger }, {
        data: {
          k1: 'v1',
          k2: 'v2',
        },
        metadata: {},
      }, {
        uri: 'http://www.example.com/test',
        secret: 'theSecret',
        method: 'PUT',
      });
    });
    executeAction.then(() => {
      expect(nockObj.isDone());
      expect(self.calledTwice).to.be.true;
      expect(self.args[0][1].data).to.eql(webhookReturnObj);
      expect(self.args[1][0]).to.eql('end');
      done();
    });
  });

  it('POST and get text/html response', (done) => {
    const nockObj = nock('http://www.example.com')
      .post('/test', {
        k1: 'v1',
        k2: 'v2',
      })
      .matchHeader('Content-Type', 'application/json;charset=UTF-8')
      .reply(200, webhookReturnObj, {
        'Content-type': 'text/html; charset=utf-8',
      });

    const executeAction = new Promise((resolve) => {
      const emitter = {
        emit: (name) => {
          if (name === 'end') {
            resolve();
          }
        },
      };
      self = sinon.spy(emitter, 'emit');
      send.process.call({ emit: self, logger }, {
        data: {
          k1: 'v1',
          k2: 'v2',
        },
        metadata: {},
      }, {
        uri: 'http://www.example.com/test',
      });
    });
    executeAction.then(() => {
      expect(nockObj.isDone());
      expect(self.calledTwice).to.be.true;
      expect(self.args[0][1].data).to.eql({
        responseBody: '{"message":"ok","other":"returned"}',
      });
      expect(self.args[1][0]).to.eql('end');
      done();
    });
  });

  it('GET No Auth No QMark', (done) => {
    const nockObj = nock('http://www.example.com')
      .get('/test?k1=v1&k2=v2')
      .reply(200, webhookReturnObj);

    const executeAction = new Promise((resolve) => {
      const emitter = {
        emit: (name) => {
          if (name === 'end') {
            resolve();
          }
        },
      };
      self = sinon.spy(emitter, 'emit');
      getMethod.process.call({ emit: self, logger }, {
        data: {
          k1: 'v1',
          k2: 'v2',
        },
        headers: {
          test: 'header',
        },
        metadata: {},
      }, {
        uri: 'http://www.example.com/test',
      });
    });
    executeAction.then(() => {
      expect(nockObj.isDone());
      expect(self.calledTwice).to.be.true;
      expect(self.args[0][0]).to.eql('data');
      expect(self.args[0][1].data).to.eql(webhookReturnObj);
      expect(self.args[1][0]).to.eql('end');
      done();
    });
  });

  it('GET Auth QMark', (done) => {
    const nockObj = nock('http://www.example.com')
      .get('/test?k1=v1&k2=v2')
      .matchHeader('X-Api-Secret', 'theSecret')
      .reply(200, webhookReturnObj);

    const executeAction = new Promise((resolve) => {
      const emitter = {
        emit: (name) => {
          if (name === 'end') {
            resolve();
          }
        },
      };
      self = sinon.spy(emitter, 'emit');
      getMethod.process.call({ emit: self, logger }, {
        data: {
          k1: 'v1',
          k2: 'v2',
        },
        headers: {
          test: 'header',
        },
        url: 'test',
        metadata: {},
      }, {
        uri: 'http://www.example.com/test',
        secret: 'theSecret',
      });
    });

    executeAction.then(() => {
      expect(nockObj.isDone());
      expect(self.calledTwice).to.be.true;
      expect(self.args[0][0]).to.eql('data');
      expect(self.args[0][1].data).to.eql(webhookReturnObj);
      expect(self.args[1][0]).to.eql('end');
      done();
    });
  });

  it('404', (done) => {
    const nockObj = nock('http://www.example.com')
      .get('/test?k1=v1&k2=v2')
      .matchHeader('X-Api-Secret', 'theSecret')
      .reply(404);

    const executeAction = new Promise((resolve) => {
      const emitter = {
        emit: (name) => {
          if (name === 'end') {
            resolve();
          }
        },
      };
      self = sinon.spy(emitter, 'emit');
      getMethod.process.call({ emit: self, logger }, {
        data: {
          k1: 'v1',
          k2: 'v2',
        },
        headers: {
          test: 'header',
        },
        metadata: {},
      }, {
        uri: 'http://www.example.com/test?',
        secret: 'theSecret',
      });
    });
    executeAction.then(() => {
      expect(nockObj.isDone());
      expect(self.calledTwice).to.be.true;
      expect(self.args[0][0]).to.eql('error');
      expect(self.args[0][1].message).to.eql('Endpoint responds with 404');
      expect(self.args[1][0]).to.eql('end');
      done();
    });
  });

  it('Inbound', () => {
    const msg = {
      id: '1',
      data: {
        k1: 'v1',
        k2: 'v2',
      },
      headers: {
        test: 'header',
      },
      url: 'test',
      metadata: {},
    };

    const executeAction = new Promise((resolve) => {
      const emitter = {
        emit: (name) => {
          if (name === 'end' || name === 'error') {
            resolve();
          }
        },
      };
      self = sinon.spy(emitter, 'emit');
      receive.process.call({ emit: self, logger }, msg, {});
    });
    executeAction.then(() => {
      expect(self.args[0][1]).to.be.not.udefined;
      expect(self.args[0][1].data).to.be.not.udefined;
      expect(self.args[0][1].data._query).to.be.not.udefined;
      expect(self.args[0][1].data._url).to.eql('test');
      expect(self.args[0]).to.eql(['data', msg]);
      expect(self.args[1][0]).to.eql('end');
    });
  });

  it('Inbound with query', () => {
    const msg = {
      id: '1',
      data: {
        k1: 'v1',
        k2: 'v2',
      },
      headers: {
        test: 'header',
      },
      url: 'test',
      query: {
        baz: 'boo',
      },
      metadata: {},
    };

    const executeAction = new Promise((resolve) => {
      const emitter = {
        emit: (name) => {
          if (name === 'end') {
            resolve();
          }
        },
      };
      self = sinon.spy(emitter, 'emit');
      receive.process.call({ emit: self, logger }, msg, {});
    });
    executeAction.then(() => {
      expect(self.args[0][1]).to.be.not.udefined;
      expect(self.args[0][1].data).to.be.not.udefined;
      expect(self.args[0][1].data._query).to.eql({ baz: 'boo' });
      expect(self.args[0][1].data._url).to.eql('test');
      expect(self.args[0]).to.eql(['data', msg]);
      expect(self.args[1][0]).to.eql('end');
    });
  });
});
