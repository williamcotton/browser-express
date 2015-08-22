var test = require('tapes');
var jsdom = require('jsdom');
var ejs = require("ejs");

if (!global.document) {
  global.document = jsdom.jsdom('<!doctype html><html><body><div id="universal-app-container"></div></body></html>');
  global.window = global.document.parentWindow;
  global.navigator = {
    userAgent: 'node.js'
  };
}

// prouter needs these globals
global.addEventListener = global.window.addEventListener;
global.removeEventListener = global.window.removeEventListener;
global.location = global.window.location;
global.history = global.window.history;

var browserExpress = require("../../src/js/index.js");

jsdom.jQueryify(global.window, "http://code.jquery.com/jquery-2.1.1.js", function () {

  test('browser-express', function (t) {

    var domRoute, app, server;

    t.beforeEach(function(t) {
      app = browserExpress({
        document: global.document,
        window: global.window
      });
      server = app.listen();
      domRoute = function(route, callback) {
        app.navigate(route);
        callback(global.window.$);
      }
      t.end();
    });

    t.afterEach(function(t) {
      server.close();
      t.end();
    });

    t.test("app.get", function(t) {
      var paramsValue = "test0";
      var queryValue = "test1";
      var route = "/test/:value";
      t.plan(4);
      app.get(route, function(req, res) {
        t.equal(req.params.value, paramsValue, "param.value matches paramsValue");
        t.equal(req.query.value, queryValue, "query.value matches queryValue");
        t.ok(req, "has req");
        t.ok(res, "has res");
      });
      domRoute(route.replace(":value", paramsValue) + "?value=" + queryValue, function($) {});
    });

    t.test("res.send", function(t) {
      var route = "/test";
      var body = "this is a test";
      t.plan(2);
      app.get(route, function(req, res) {
        t.ok(res.send, "added res.send");
        res.send(body);
      });
      domRoute(route, function($) {
        t.equal($('body').html(), body, "rendered body");
      });
    });

    t.test("app.use", function(t) {
      var route = "/test";
      var body = "this is a test";
      t.plan(1);
      app.use(function(req, res, next) {
        res.addedMiddleware = true;
        next();
      });
      app.get(route, function(req, res) {
        t.ok(res.addedMiddleware, "added middleware");
        res.send(body);
      });
      domRoute(route, function($) {});
    });

    t.test("app.set", function(t) {
      var key = "key";
      var value = "value";
      app.set(key, value);
      t.equal(app.get(key), value, "app.get matches app.set");
      t.end();
    });

    t.test("app.engine", function(t) {
      var view = "<h2><%= user.name %></h2>";
      var route = "/test";
      var username = "test";
      t.plan(2);
      app.engine("ejs", function(view, locals, globals) {
        var content = ejs.render(view, locals, {});
        globals.document.body.innerHTML = content
      });
      app.set("views engine", "ejs");
      app.get(route, function(req, res) {
        t.ok(res.send, "added res.send");
        res.render(view, {user:{name: username}});
      });
      domRoute(route, function($) {
        t.equal($('h2').html(), username, "rendered view");
      });
    });

    t.test("res.render template", function(t) {
      var fs = require('fs');
      var template = fs.readFileSync(__dirname + "/../ejs/template.ejs", 'utf8');
      // https://github.com/substack/brfs
      var route = "/test";
      var title = "test";
      t.plan(2);
      app.engine("ejs", function(view, locals, globals) {
        var content = ejs.render(view, locals, {});
        globals.document.body.innerHTML = content
      });
      app.set("views engine", "ejs");
      app.get(route, function(req, res) {
        t.ok(res.send, "added res.send");
        res.render(template, {title: title, body:"<h2>test</h2>"});
      });
      domRoute(route, function($) {
        t.equal($('title').html(), title, "rendered template with title");
      });
    });

    t.end();

  });

});
