# browser-express
Fast, unopinionated, minimalist browser framework

A browser version of [```express```](http://expressjs.com/) built with ```prouter```, a pushState routing engine.

## Getting Started

```npm install browser-express```

## Usage

```js

var browserExpress = require('browser-express');

var app = browserExpress();

app.use(function(req, res, next) {
  req.addedMiddleware = true;
  next();
});

app.get("/test/:value", function(req, res) {
  var value = req.params.value;
  res.send("Value: " + value);
});

app.get("/view/:username", function(req, res) {
  var username = req.params.username;
  var view = "<h2><%= user.name %></h2>";
  res.render(view, {user:{name: username}})
});

var server = app.listen(function() {
  console.log("app is listening");
});

app.navigate("/test/123");

// app.set("key", "value");
// app.get("key") 
//  => "value"

// server.close();

```