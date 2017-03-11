const async = require('async')

module.exports = function browserExpress ({environment = {}, window, document, abstractNavigation, wantsPostReplay, interceptFormSubmit, interceptLinks}) {
  if (window && window.environment) {
    environment = window.environment
  }

  const prouter = require('./prouter')({ document, window }) // waiting for pull request to be accepted
  const Router = prouter.Router

  const store = {}

  const stack = []

  const completeCallbacks = []

  const engines = {}

  var linkHandler = function linkHandler (event) {
    let pathname, search, protocol, hash, sameHost, samePathname, sameSearch, sameHash
    if (event.target.pathname) {
      pathname = event.target.pathname
      search = event.target.search
      protocol = event.target.protocol
      hash = event.target.hash
      sameHost = event.target.host ? document.location.host === event.target.host : true
      samePathname = pathname ? document.location.pathname === pathname : true
      sameSearch = search ? document.location.search === search : true
      sameHash = hash ? document.location.hash === hash : true
    } else {
      var findInParent = function (element) {
        var _parentElement = element.parentElement
        if (_parentElement) {
          if (_parentElement.pathname) {
            pathname = _parentElement.pathname
            search = _parentElement.search
            protocol = _parentElement.protocol
            hash = _parentElement.hash
            sameHost = _parentElement.host ? document.location.host === _parentElement.host : true
            samePathname = pathname ? document.location.pathname === pathname : true
            sameSearch = search ? document.location.search === search : true
            sameHash = hash ? document.location.hash === hash : true
          } else {
            findInParent(_parentElement)
          }
        }
      }
      findInParent(event.target)
    }

    if (pathname && sameHost && (protocol === 'http:' || protocol === 'https:' || protocol === 'file:')) {
      event.preventDefault()
      if (!(samePathname && sameSearch && sameHash)) {
        Router.navigate(pathname + search + hash)
      }
      // Scroll to top to match normal anchor click behavior
      window.scrollTo(0, 0)
      // it would be nice if it only preventedDefault and returned false if it actually hit a route!
      return false
    }
  }

  if (interceptLinks) {
    document.body.addEventListener('click', linkHandler, true)
  }

  var res = {
    send: function (content) {
      document.body.innerHTML = content
      res.writeHead(200)
      res.onComplete(content)
      return content
    },
    render: function (view, locals) {
      res.writeHead(200)
      res.onComplete(view, locals)
      if (store['view engine']) {
        var engineFunction = engines[store['view engine']]
        engineFunction(view, locals, { document, window })
      }
    },
    setHeader: function () {},
    loadPage: function (path) {
      res.writeHead(200)
      window.location = path
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
    get: function get (route, handler) {
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
        for (var attrname in environment) {
          if (!req[attrname]) {
            req[attrname] = environment[attrname]
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
    post: function post (action, handler) {
      var middleware
      if (arguments.length === 3) {
        action = arguments[0]
        middleware = arguments[1]
        handler = arguments[2]
      }
      Router.post(action, function (req) {
        for (var attrname in environment) {
          if (!req[attrname]) {
            req[attrname] = environment[attrname]
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
    set: function set (key, value) {
      store[key] = value
    },
    engine: function engine (engineKey, fn) {
      engines[engineKey] = fn
    },
    use: function use (fn) {
      stack.push(fn)
    },
    listen: function listen (callback) {
      var router = Router.listen({
        root: '/', // base path for the handlers.
        usePushState: !abstractNavigation, // is pushState of history API desired?
        hashChange: !abstractNavigation, // is hashChange desired?
        silent: false, // don't try to load handlers for the current path?
        abstractNavigation,
        wantsPostReplay,
        usePost: interceptFormSubmit || false // should listen for all submit events on post?
      })
      if (callback) {
        callback()
      }
      return {
        close: function close () {
          Router.stop()
          if (interceptLinks) {
            document.body.removeEventListener('click', linkHandler, true)
          }
        },
        router: router
      }
    },
    navigate: function navigate (route, callback) {
      if (callback) {
        completeCallbacks.push(callback)
      } else {
        res.writeHead(200)
      }
      Router.navigate(route)
    },
    submit: function submit (action, body, callback) {
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
