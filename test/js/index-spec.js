var test = require('tapes')
var jsdom = require('jsdom')
var ejs = require('ejs')

if (!global.document) {
  global.document = jsdom.jsdom('<!doctype html><html><body><div id="universal-app-container"></div></body></html>')
  global.window = global.document.parentWindow
  global.navigator = {
    userAgent: 'node.js'
  }
}

var browserExpress = require('../../src/js/index.js')

jsdom.jQueryify(global.window, 'http://code.jquery.com/jquery-2.1.1.js', function () {
  test('browser-express', function (t) {
    var domRoute, app, server

    t.beforeEach(function (t) {
      app = browserExpress({
        document: global.document,
        window: global.window,
        interceptLinks: true,
        interceptFormSubmit: true,
        silent: true
      })
      server = app.listen()
      domRoute = function (route, callback) {
        app.navigate(route)
        callback(global.window.$)
      }
      t.end()
    })

    t.afterEach(function (t) {
      server.close()
      t.end()
    })

    t.test('browserExpress no params', function (t) {
      var _app = browserExpress()
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
      t.plan(4); // test is triggering twice...
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
        res.addedMiddleware = true
        next()
      })
      app.get(route, function (req, res) {
        t.ok(res.addedMiddleware, 'added middleware')
        res.send(body)
      })
      domRoute(route, function ($) {})
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
      app.engine('ejs', function (view, locals, globals) {
        var content = ejs.render(view, locals, {})
        globals.document.body.innerHTML = content
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
      app.engine('ejs', function (view, locals, globals) {
        var content = ejs.render(view, locals, {})
        globals.document.body.innerHTML = content
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
        var link = global.window.$('a')
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
      t.plan(4) // should be 3...
      app.engine('ejs', function (view, locals, globals) {
        var content = ejs.render(view, locals, {})
        globals.document.body.innerHTML = content
      })
      app.set('view engine', 'ejs')
      app.get(route, function (req, res) {
        // this is being called twice...
        t.ok(res.send, 'added res.send')
        res.render(view, {})
      })
      app.post(action, function (req, res) {
        t.equal(req.body.username, 'alex', 'input matches')
        res.send('ok')
      })
      domRoute(route, function ($) {
        var form = global.window.$('form')
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
      app.engine('ejs', function (view, locals, globals) {
        var content = ejs.render(view, locals, {})
        globals.document.body.innerHTML = content
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

    t.end()
  })
})
