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

  it('handles edge cases and errors', async () => {
    app.get('/error', (req, res) => {
      throw new Error('Test error');
    });

    try {
      await app.navigate('/error');
    } catch (e) {
      assert.equal(e.message, 'Test error');
    }
  });

  it('intercepts links', async () => {
    app = express({ interceptLinks: true });
    await app.listen({}, () => {});

    const link = document.createElement('a');
    link.href = '/test-link';
    document.body.appendChild(link);

    app.get('/test-link', (req, res) => {
      res.send('Link intercepted');
    });

    link.click();

    assert.equal(window.document.body.innerHTML, 'Link intercepted');
  });

  it('handles different HTTP methods', async () => {
    app.put('/test-put', (req, res) => {
      res.send('PUT request');
    });

    app.delete('/test-delete', (req, res) => {
      res.send('DELETE request');
    });

    await app.submit('/test-put', 'put', {});
    assert.equal(window.document.body.innerHTML, 'PUT request');

    await app.submit('/test-delete', 'delete', {});
    assert.equal(window.document.body.innerHTML, 'DELETE request');
  });
});
