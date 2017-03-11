var test = require('tapes')
var jsdom = require('jsdom')
var ejs = require('ejs')

const document = jsdom.jsdom('<!doctype html><html><body><div id="universal-app-container"></div></body></html>')
const window = document.defaultView
window.navigator = {
  userAgent: 'node.js'
}

var browserExpress = require('../../src/js/index.js')

jsdom.jQueryify(window, 'http://code.jquery.com/jquery-2.1.1.js', function () {
  test('browser-express', function (t) {
    var domRoute, app, server

    window.environment = {test: 123}

    var appOptions = {
      document,
      window,
      interceptLinks: true,
      interceptFormSubmit: true,
      silent: true
    }

    t.beforeEach(function (t) {
      app = browserExpress(appOptions)

      domRoute = function (route, callback) {
        app.navigate(route)
        callback(window.$)
      }

      server = app.listen(() => {
        app.navigate('/')
      })

      t.end()
    })

    t.afterEach(function (t) {
      server.close()
      t.end()
    })

    t.test('browserExpress no params', function (t) {
      var _app = browserExpress({})
      t.ok(_app.get, 'has get')
      t.ok(_app.set, 'has set')
      t.end()
    })

    t.test('app.get', function (t) {
      var paramsValue = 'test0'
      var queryValue = 'test1'
      var route = '/test/:value'
      t.plan(5)
      app.get(route, function (req, res) {
        t.equal(req.params.value, paramsValue, 'param.value matches paramsValue')
        t.equal(req.query.value, queryValue, 'query.value matches queryValue')
        t.equal(req.path, '/test/test0', 'path matches')
        t.ok(req, 'has req')
        t.ok(res, 'has res')
      })
      domRoute(route.replace(':value', paramsValue) + '?value=' + queryValue, function ($) {})
    })

    t.test('environment', function (t) {
      var route = '/test'
      t.plan(1)
      app.get(route, function (req, res) {
        t.equal(req.test, 123, 'req.test from environment')
      })
      domRoute(route, function ($) {})
    })

    t.test('app.get middleware', function (t) {
      var paramsValue = 'test0'
      var queryValue = 'test1'
      var route = '/test/:value'
      var testValue0 = 1234
      var testValue1 = 2345
      t.plan(7)
      var middleware = function (req, res, next) {
        req.test = testValue0
        res.test = testValue1
        next()
      }
      app.get(route, middleware, function (req, res) {
        t.equal(req.params.value, paramsValue, 'param.value matches paramsValue')
        t.equal(req.query.value, queryValue, 'query.value matches queryValue')
        t.equal(req.path, '/test/test0', 'path matches')
        t.equal(req.test, testValue0, 'middleware set req')
        t.equal(res.test, testValue1, 'middleware set res')
        t.ok(req, 'has req')
        t.ok(res, 'has res')
      })
      domRoute(route.replace(':value', paramsValue) + '?value=' + queryValue, function ($) {})
    })

    t.test('app.get click', function (t) {
      var paramsValue = 'test2'
      var queryValue = 'test3'
      var route = '/test4/:value'
      t.plan(4) // test is triggering twice...
      app.get(route, function (req, res) {
        t.equal(req.params.value, paramsValue, 'param.value matches paramsValue')
        t.equal(req.query.value, queryValue, 'query.value matches queryValue')
        t.ok(req, 'has req')
        t.ok(res, 'has res')
      })
      var link = document.createElement('a')
      link.href = route.replace(':value', paramsValue) + '?value=' + queryValue
      document.body.appendChild(link)
      var event = document.createEvent('Event')
      event.initEvent('click', true, true)
      link.dispatchEvent(event)
    })

    t.test('app.get nested click', function (t) {
      var paramsValue = 'test2'
      var queryValue = 'test3'
      var route = '/test4/:value'
      t.plan(4) // test is triggering twice...
      app.get(route, function (req, res) {
        t.equal(req.params.value, paramsValue, 'param.value matches paramsValue')
        t.equal(req.query.value, queryValue, 'query.value matches queryValue')
        t.ok(req, 'has req')
        t.ok(res, 'has res')
      })
      var span = document.createElement('span')
      span.innerHTML = 'test'
      var link = document.createElement('a')
      link.href = route.replace(':value', paramsValue) + '?value=' + queryValue
      link.appendChild(span)
      document.body.appendChild(link)
      var event = document.createEvent('Event')
      event.initEvent('click', true, true)
      span.dispatchEvent(event)
    })

    t.test('app.post', function (t) {
      var paramsValue = 'test0'
      var action = '/test/:value'
      app.post(action, function (req, res) {
        t.equal(req.event.target, form, 'req.event matches form')
        t.equal(req.params.value, paramsValue, 'param.value matches paramsValue')
        t.equal(req.body[input.name], input.value, 'body matches input name and value')
        t.equal(req.path, form.action, 'path matches form.action')
        t.end()
      })
      var form = document.createElement('form')
      form.action = action.replace(':value', paramsValue)
      var input = document.createElement('input')
      input.type = 'text'
      input.value = '1234'
      input.name = 'test3'
      form.appendChild(input)
      document.body.appendChild(form)
      var event = document.createEvent('Event')
      event.initEvent('submit', true, true)
      form.dispatchEvent(event)
    })

    t.test('app.post', function (t) {
      var paramsValue = 'test0'
      var action = '/test/:value'
      app.post(action, function (req, res) {
        t.equal(req.event.target, form, 'req.event matches form')
        t.equal(req.params.value, paramsValue, 'param.value matches paramsValue')
        t.equal(req.body[input.name], input.value, 'body matches input name and value')
        t.equal(req.path, form.action, 'path matches form.action')
        t.end()
      })
      var form = document.createElement('form')
      form.action = action.replace(':value', paramsValue)
      var input = document.createElement('input')
      input.type = 'number'
      input.value = 123
      input.name = 'test4'
      form.appendChild(input)
      document.body.appendChild(form)
      var event = document.createEvent('Event')
      event.initEvent('submit', true, true)
      form.dispatchEvent(event)
    })

    t.test('app.post middleware', function (t) {
      var paramsValue = 'test0'
      var action = '/test/:value'
      var testValue0 = 1234
      var testValue1 = 2345
      var middleware = function (req, res, next) {
        req.test = testValue0
        res.test = testValue1
        next()
      }
      app.post(action, middleware, function (req, res) {
        t.equal(req.event.target, form, 'req.event matches form')
        t.equal(req.params.value, paramsValue, 'param.value matches paramsValue')
        t.equal(req.body[input.name], input.value, 'body matches input name and value')
        t.equal(req.path, form.action, 'path matches form.action')
        t.equal(req.test, testValue0, 'middleware set req')
        t.equal(res.test, testValue1, 'middleware set res')
        t.end()
      })
      var form = document.createElement('form')
      form.action = action.replace(':value', paramsValue)
      var input = document.createElement('input')
      input.type = 'text'
      input.value = '1234'
      input.name = 'test3'
      form.appendChild(input)
      document.body.appendChild(form)
      var event = document.createEvent('Event')
      event.initEvent('submit', true, true)
      form.dispatchEvent(event)
    })

    t.test('res.send', function (t) {
      var route = '/test0'
      var body = 'this is a test'
      t.plan(2)
      app.get(route, function (req, res) {
        t.ok(res.send, 'added res.send')
        res.send(body)
      })
      domRoute(route, function ($) {
        t.equal($('body').html(), body, 'rendered body')
      })
    })

    t.test('app.use', function (t) {
      var route = '/test1'
      var body = 'this is a test'
      t.plan(1)
      app.use(function (req, res, next) {
        req.addedMiddleware = true
        next()
      })
      app.get(route, function (req, res) {
        t.ok(req.addedMiddleware, 'added middleware')
        res.send(body)
      })
      domRoute(route, function ($) {})
    })

    t.test('app.use get and post', function (t) {
      var route1 = '/test1'
      var route2 = '/test2'
      var body = 'this is a test'
      t.plan(2)
      app.use(function (req, res, next) {
        req.addedAnotherMiddleware = true
        next()
      })
      app.get(route1, function (req, res) {
        t.ok(req.addedAnotherMiddleware, 'added middleware')
        res.send(body)
      })
      app.post(route2, function (req, res) {
        t.ok(req.addedAnotherMiddleware, 'added middleware')
        res.send(body)
      })
      domRoute(route1, function ($) {})
      app.submit(route2, {})
    })

    t.test('app.set', function (t) {
      var key = 'key'
      var value = 'value'
      app.set(key, value)
      t.equal(app.get(key), value, 'app.get matches app.set')
      t.end()
    })

    t.test('app.engine', function (t) {
      var view = '<h2><%= user.name %></h2>'
      var route = '/test2'
      var username = 'test'
      t.plan(2)
      app.engine('ejs', function (view, locals, { document }) {
        var content = ejs.render(view, locals, {})
        document.body.innerHTML = content
      })
      app.set('view engine', 'ejs')
      app.get(route, function (req, res) {
        t.ok(res.send, 'added res.send')
        res.render(view, {user: {name: username}})
      })
      domRoute(route, function ($) {
        t.equal($('h2').html(), username, 'rendered view')
      })
    })

    t.test('app.engine click', function (t) {
      var route1 = '/test3'
      var route2 = '/test4'
      var view = "<a href='" + route2 + "'>test</a>"
      t.plan(3)
      app.engine('ejs', function (view, locals, { document }) {
        var content = ejs.render(view, locals, {})
        document.body.innerHTML = content
      })
      app.set('view engine', 'ejs')
      app.get(route1, function (req, res) {
        t.ok(res.send, 'added res.send')
        res.render(view, {})
      })
      app.get(route2, function (req, res) {
        t.ok(res.send, 'added res.send')
        res.send('ok')
      })
      domRoute(route1, function ($) {
        var link = window.$('a')
        t.equal(link.attr('href'), route2, 'href matches route')
        var event = document.createEvent('Event')
        event.initEvent('click', true, true)
        link[0].dispatchEvent(event)
      })
    })

    t.test('app.engine form submit', function (t) {
      var route = '/test5'
      var action = '/test6'
      var view = "<form action='" + action + "'><input type='text' name='username' value='alex' /></form>"
      t.plan(3)
      app.engine('ejs', function (view, locals, { document }) {
        var content = ejs.render(view, locals, {})
        document.body.innerHTML = content
      })
      app.set('view engine', 'ejs')
      app.get(route, function (req, res) {
        t.ok(res.send, 'added res.send')
        res.render(view, {})
      })
      app.post(action, function (req, res) {
        t.equal(req.body.username, 'alex', 'input matches')
        res.send('ok')
      })
      domRoute(route, function ($) {
        var form = window.$('form')
        t.equal(form.attr('action'), action, 'actions match')
        var event = document.createEvent('Event')
        event.initEvent('submit', true, true)
        form[0].dispatchEvent(event)
      })
    })

    t.test('res.render template', function (t) {
      var fs = require('fs')
      var template = fs.readFileSync(__dirname + '/../ejs/template.ejs', 'utf8')
      // https://github.com/substack/brfs
      var route = '/test'
      var title = 'test'
      t.plan(2)
      app.engine('ejs', function (view, locals, { document }) {
        var content = ejs.render(view, locals, {})
        document.body.innerHTML = content
      })
      app.set('view engine', 'ejs')
      app.get(route, function (req, res) {
        t.ok(res.send, 'added res.send')
        res.render(template, {title: title, body: '<h2>test</h2>'})
      })
      domRoute(route, function ($) {
        t.equal($('title').html(), title, 'rendered template with title')
      })
    })

    t.test('writeHead', function (t) {
      var route1 = '/test1'
      var route2 = '/test2'
      t.plan(1)
      app.use(function (req, res, next) {
        res.writeHead = function (statusCode) {
          t.equal(statusCode, 200, 'did call writeHead function')
        }
        next()
      })
      app.get(route2, function (req, res) {})
      app.get(route1, function (req, res) {
        app.navigate(route2)
      })
      domRoute(route1, function ($) {})
    })

    t.test('app.navigate callback', function (t) {
      var route = '/test12'
      t.plan(3)
      app.get(route, function (req, res) {
        t.ok(true, 'called route')
        res.send('ok')
      })
      app.navigate(route, function (content) {
        t.equal(content, 'ok', 'content was ok')
        t.ok(true, 'called callback')
      })
    })

    t.test('app.submit callback', function (t) {
      var action = '/test123'
      t.plan(3)
      var form = {test: 123}
      app.post(action, function (req, res) {
        t.equal(req.body, form, 'req.body equals form')
        res.send('ok')
      })
      app.submit(action, form, function (content) {
        t.equal(content, 'ok', 'content was ok')
        t.ok(true, 'called callback')
      })
    })

    t.test('fires GET', function (t) {
      server.close()
      var paramsValue = '456'
      window.location.href = '/test2/' + paramsValue
      app = browserExpress({
        document,
        window,
        interceptLinks: true,
        interceptFormSubmit: true,
        usePushState: true,
        silent: false
      })
      var action = '/test2/:value'
      app.get(action, function (req, res) {
        t.equal(req.params.value, paramsValue, 'req.param.value matches paramsValue')
        t.end()
      })
      server = app.listen()
    })

    t.test('fires POST on environment', function (t) {
      server.close()
      var paramsValue = '456'
      var body = body
      window.environment = {method: 'POST', body: body}
      window.location.href = '/test/' + paramsValue
      app = browserExpress({
        document,
        window,
        interceptLinks: true,
        interceptFormSubmit: true,
        usePushState: true,
        silent: false
      })
      var action = '/test/:value'
      app.post(action, function (req, res) {
        t.equal(req.params.value, paramsValue, 'req.param.value matches paramsValue')
        t.equal(req.body, body, 'req.body matches body')
        t.end()
      })
      server = app.listen()
    })

    t.test('app.submit with no push', function (t) {
      server.close()
      app = browserExpress({
        document,
        window,
        interceptLinks: true,
        interceptFormSubmit: true,
        usePushState: true,
        silent: true
      })
      server = app.listen()
      var action = '/test123'
      t.plan(2)
      var form = {test: 123}
      var didPush
      app.get('/tt', function (req, res) {
        t.ok(true, 'did GET')
      })
      app.post(action, function (req, res) {
        if (didPush) {
          t.ok(false, 'should not have pushed')
        } else {
          t.equal(req.body, form, 'req.body equals form')
          didPush = true
        }
        res.send('ok')
      })
      app.submit(action, form, function () {
        app.navigate('/tt', function() {
          window.history.back()
        })
      })
    })

    t.test('app.submit with push but no replay', function (t) {
      server.close()
      app = browserExpress({
        document,
        window,
        interceptLinks: true,
        interceptFormSubmit: true,
        usePushState: true,
        silent: true
      })
      server = app.listen()
      var action = '/test123'
      t.plan(3)
      var form = {test: 123, _push: true}
      var isReplay
      app.get('/tt', function (req, res) {
        t.ok(true, 'did GET')
      })
      app.post(action, function (req, res) {
        if (isReplay) {
          t.equal(req.body, undefined, 'req.body is undefined')
        } else {
          t.equal(req.body, form, 'req.body equals form')
          isReplay = true
        }
        res.send('ok')
      })
      app.submit(action, form, function () {
        app.navigate('/tt', function() {
          window.history.back()
        })
      })
    })

    t.test('app.submit with push and replay', function (t) {
      server.close()
      app = browserExpress({
        document,
        window,
        interceptLinks: true,
        interceptFormSubmit: true,
        usePushState: true,
        silent: true
      })
      server = app.listen()
      var action = '/test234'
      t.plan(3)
      var form = {test: 123, _replay: true, _push: true}
      var isReplay
      app.get('/tt', function (req, res) {
        t.ok(true, 'did GET')
      })
      app.post(action, function (req, res) {
        if (isReplay) {
          t.equal(req.body, form, 'req.body equals form')
        } else {
          t.equal(req.body, form, 'req.body equals form')
          isReplay = true
        }
        res.send('ok')
      })
      app.submit(action, form, function () {
        app.navigate('/tt', function() {
          window.history.back()
        })
      })
    })

    t.test('app.submit with global replay', function (t) {
      server.close()
      app = browserExpress({
        document,
        window,
        interceptLinks: true,
        interceptFormSubmit: true,
        usePushState: true,
        silent: true,
        wantsPostReplay: true
      })
      server = app.listen()
      var action = '/test345'
      t.plan(3)
      var form = {test: 123}
      var isReplay
      app.get('/tt', function (req, res) {
        t.ok(true, 'did GET')
      })
      app.post(action, function (req, res) {
        if (isReplay) {
          t.equal(req.body, form, 'req.body equals form')
        } else {
          t.equal(req.body, form, 'req.body equals form')
          isReplay = true
        }
        res.send('ok')
      })
      app.submit(action, form, function () {
        app.navigate('/tt', function () {
          window.history.back()
        })
      })
    })

    t.end()
  })
})
