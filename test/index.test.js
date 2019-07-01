const express = require('../src/index');

describe('browser-express', () => {
  let app;

  beforeAll(async () => {
    app = express();
    await app.listen({}, () => {});
  });

  afterAll(() => {
    app.close();
  });

  test('app.get', async () => {
    expect.assertions(2);

    const paramValue = '123';
    const queryValue = '456';

    app.get('/test/:value', (req, res) => {
      expect(req.params.value).toEqual(paramValue);
      expect(req.query.value).toEqual(queryValue);
    });

    app.navigate(`/test/${paramValue}?value=${queryValue}`);
  });

  test('app.post', async () => {
    expect.assertions(2);

    const paramValue = '123';
    const formValue = '456';
    const body = {
      value: formValue
    }

    app.post('/test/:value', (req, res) => {
      expect(req.params.value).toEqual(paramValue);
      expect(req.body.value).toEqual(formValue)
    });

    app.submit(`/test/${paramValue}`, 'post', body);
  });
});
