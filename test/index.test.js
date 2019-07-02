const assert = require('assert');
const express = require('../src/index');

describe('browser-express', () => {
  let app;

  beforeEach(async () => {
    if (app) {
			window.history.pushState('/', null, '/');
			await app.close();
		}
    app = express();
    await app.listen({}, () => {});
  });

  afterEach(async () => {
    await app.close();
  });

  it('navigates to a GET route', async () => {
    const paramValue = '123';
    const queryValue = '456';

    app.get('/test/:value', (req, res) => {
      assert.equal(req.params.value, paramValue);
      assert.equal(req.query.value, queryValue);
    });

    app.navigate(`/test/${paramValue}?value=${queryValue}`);
  });

  it('submits a POST route', async () => {
    const paramValue = '123';
    const bodyValue = '456';
    const body = {
      value: bodyValue
    }

    app.post('/test/:value', (req, res) => {
      assert.equal(req.params.value, paramValue);
      assert.equal(req.body.value, bodyValue);
    });

    app.submit(`/test/${paramValue}`, 'post', body);
  });

  it('sends back content', async () => {
    const content = '<div id="test">Test123</div>';

    app.get('/test', (req, res) => {
      res.send(content);
    });

    await app.navigate('/test');

    assert.equal(window.document.body.innerHTML, content);
  });
});
