# browser-express
Fast, unopinionated, minimalist browser framework

A browser version of [```express```](http://expressjs.com/) built with [```router```](https://github.com/pillarjs/router) and based heavily on [```nighthawk```](https://github.com/wesleytodd/nighthawk).

## Getting Started

```npm install browser-express```

## Usage

```js
const browserExpress = require('browser-express');

const app = browserExpress();

app.use((req, res, next) => {
  req.addedMiddleware = true;
  next();
});

app.get('/test/:value', (req, res) => {
  const value = req.params.value;
  res.send(`Value: ${value}`);
});

const server = app.listen({}, () => {
  console.log('app is listening');
});

app.navigate('/test/123');

app.post('/form1', (req, res) => {
  res.send(`Username: ${req.body.username}`);
});

app.submit('/form1', 'post', { username: 'test123' });

server.close();
```
