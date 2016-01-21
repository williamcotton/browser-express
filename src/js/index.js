var async = require('async')

var prouter = require('./prouter') // waiting for pull request to be accepted
var Router = prouter.Router

module.exports = function (options) {
  options = options || {}

  var incomingMessage = options.incomingMessage || {}

  if (options.window && options.window.incomingMessage) {
    incomingMessage = options.window.incomingMessage
  }

  var store = {}

  var stack = []

  var completeCallbacks = []

  var engines = {}

  var linkHandler = function (event) {
    var sameHost = event.target.host ? document.location.host === event.target.host : true
    var pathname, search, protocol, hash
    if (event.target.pathname) {
      pathname = event.target.pathname
      search = event.target.search
      protocol = event.target.protocol
      hash = event.target.hash
    } else {
      var findInParent = function (element) {
        var _parentElement = element.parentElement
        if (_parentElement) {
          if (_parentElement.pathname) {
            pathname = _parentElement.pathname
            search = _parentElement.search
            protocol = _parentElement.protocol
            hash = _parentElement.hash
          } else {
            findInParent(_parentElement)
          }
        }
      }
      findInParent(event.target)
    }
    if (pathname && sameHost && (protocol === 'http:' || protocol === 'https:' || protocol === 'file:')) {
      event.preventDefault()
      var navigated = Router.navigate(pathname + search + hash)
      // it would be nice if it only preventedDefault and returned false if it actually hit a route!
      return false
    }
  }

  if (options.interceptLinks) {
    options.document.body.addEventListener('click', linkHandler, true)
  }

  var res = {
    send: function (content) {
      options.document.body.innerHTML = content
      res.writeHead(200)
      res.onComplete(content)
      return content
    },
    render: function (view, locals) {
      res.writeHead(200)
      res.onComplete(view, locals)
      if (store['view engine']) {
        var engineFunction = engines[store['view engine']]
        engineFunction(view, locals, options)
      }
    },
    setHeader: function () {},
    loadPage: function (path) {
      res.writeHead(200)
      options.window.location = path
    },
    writeHead: function (statusCode) {},
    onComplete: function () {
      var onCompleteArgs = arguments
      var cb
      while ((cb = completeCallbacks.pop())) {
        cb.apply(res, onCompleteArgs)
      }
    }
  }

  var app = {
    get: function (route, handler) {
      var middleware
      if (arguments.length === 1 && typeof (route) === 'string') {
        var key = route
        return store[key]
      } else if (arguments.length === 3) {
        route = arguments[0]
        middleware = arguments[1]
        handler = arguments[2]
      }
      Router.get(route, function (req) {
        for (var attrname in incomingMessage) {
          if (!req[attrname]) {
            req[attrname] = incomingMessage[attrname]
          }
        }
        async.each(stack, function (fn, callback) {
          fn(req, res, callback)
        }, function () {
          if (middleware) {
            middleware(req, res, function () {
              handler(req, res)
            })
          } else {
            handler(req, res)
          }
        })
      })
    },
    post: function (action, handler) {
      var middleware
      if (arguments.length === 3) {
        action = arguments[0]
        middleware = arguments[1]
        handler = arguments[2]
      }
      Router.post(action, function (req) {
        for (var attrname in incomingMessage) {
          if (!req[attrname]) {
            req[attrname] = incomingMessage[attrname]
          }
        }
        async.each(stack, function (fn, callback) {
          fn(req, res, callback)
        }, function () {
          if (middleware) {
            middleware(req, res, function () {
              handler(req, res)
            })
          } else {
            handler(req, res)
          }
        })
      })
    },
    set: function (key, value) {
      store[key] = value
    },
    engine: function (engineKey, fn) {
      engines[engineKey] = fn
    },
    use: function (fn) {
      stack.push(fn)
    },
    listen: function (callback) {
      var router = Router.listen({
        root: '/', // base path for the handlers.
        usePushState: !options.abstractNavigation, // is pushState of history API desired?
        hashChange: !options.abstractNavigation, // is hashChange desired?
        silent: false, // don't try to load handlers for the current path?
        abstractNavigation: options.abstractNavigation,
        wantsPostReplay: options.wantsPostReplay,
        usePost: options.interceptFormSubmit || false // should listen for all submit events on post?
      })
      if (callback) {
        callback()
      }
      return {
        close: function () {
          Router.stop()
          if (options.interceptLinks) {
            options.document.body.removeEventListener('click', linkHandler, true)
          }
        },
        router: router
      }
    },
    navigate: function (route, callback) {
      if (callback) {
        completeCallbacks.push(callback)
      } else {
        res.writeHead(200)
      }
      Router.navigate(route)
    },
    submit: function (action, body, callback) {
      if (callback) {
        completeCallbacks.push(callback)
      } else {
        res.writeHead(200)
      }
      Router.submit(action, body)
    }
  }

  return app
}
