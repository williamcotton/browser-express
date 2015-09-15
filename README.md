# browser-express
Fast, unopinionated, minimalist browser framework

A browser version of [```express```](http://expressjs.com/) built with [```prouter```](https://github.com/rogerpadilla/prouter), a pushState routing engine.

For an example of how to use this, please see the [Universal React](https://github.com/williamcotton/universal-react) demo application.

## Getting Started

```npm install browser-express```

## Usage

```js

var browserExpress = require('browser-express');

var app = browserExpress({
  interceptLinks: true, // listens for all local link 'click' events and routes to app.get()
  interceptFormSubmit: true // listens for all form 'submit' events and routes to app.post()
});

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

app.post("/form1", function(req, res) {
  res.send("Username: " + req.body.username);
});

app.get("/showForm", function(req, res) {
  var username = req.params.username;
  var view = "<form action='/form1'><input type='text' name='username'></form>";
  res.render(view, {});
});

// app.set("key", "value");
// app.get("key");
//  => "value"

// server.close();

```
