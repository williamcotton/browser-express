var async = require("async");

var prouter = require("prouter");
var Router = prouter.Router;

module.exports = function(options) {

  var store = {};

  var stack = [];

  var engines = {};

  var app = {
    get: function(route, handler) {
      if (arguments.length == 1 && typeof(route) == "string") {
        var key = route;
        return store[key];
      }
      Router.use(route, function(req) {
        var res = {
          send: function(content) {
            return options.document.body.innerHTML = content;
          },
          render: function(view, locals) {
            if (store["view engine"]) {
              var engineFunction = engines[store["view engine"]];
              engineFunction(view, locals, options);
            }
          },
          setHeader: function() {}
        };
        async.each(stack, function(fn, callback) {
          fn(req, res, callback);
        }, function() {
          handler(req, res);
        });
      });
    },
    set: function(key, value) {
      store[key] = value;
    },
    engine: function(engineKey, fn) {
      engines[engineKey] = fn;
    },
    use: function(fn) {
      stack.push(fn);
    },
    listen: function(callback) {
      var router = Router.listen({
        root: "/", // base path for the handlers.
        usePushState: true, // is pushState of history API desired?
        hashChange: true, // is hashChange desired?
        silent: false // don't try to load handlers for the current path?
      });
      if (callback) {
        callback();
      }
      return {
        close: function() {
          Router.stop();
        }
      }
    },
    navigate: function(route) {
      Router.navigate(route);
    }
  }

  return app;

};