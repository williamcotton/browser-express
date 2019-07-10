/* global window, document */

const EventEmitter = require('events');
const inherits = require('inherits');
const url = require('url');

const supported = require('./supports-push-state');

const noop = function noop() {};

function Response() {
  this.app = null;
  this.locals = Object.create(null);
  this.headersSent = false;
  this.statusCode = null;
  this.statusMessage = '';
  this.finished = false;
  this.headersSent = false;
  this.sendDate = false;
}

inherits(Response, EventEmitter);

Response.prototype.redirect = function redirect(arg1, arg2) {
  let path;
  let status;
  let replace = false;
  if (typeof arg1 === 'string') {
    if (arg1 === 'back') {
      path = this.prevLocation;
      replace = true;
    } else {
      path = arg1;
    }
    status = 302;
  } else {
    path = arg2;
    status = arg1;
  }

  this.status(status);

  this.app.processRequest(url.parse(path), replace);

  this.emit('finish');
};

Response.prototype.status = function status(code) {
  this.statusCode = code;
  return this;
};

Response.prototype.send = function send(content) {
  if (content) {
    document.body.innerHTML = content;
  }
  if (supported) {
    const history = this.app.historyStack.pop();
    const [locationState, title, URL, replace] = history;
    window.history[replace ? 'replaceState' : 'pushState'](locationState, title, URL);
    // TODO: https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration
    if (!replace) window.scrollTo(0, 0);
    this.emit('finish');
  }
};

Response.prototype.links = noop;
Response.prototype.json = noop;
Response.prototype.jsonp = noop;
Response.prototype.sendStatus = noop;
Response.prototype.sendFile = noop;
Response.prototype.download = noop;
Response.prototype.contentType = noop;
Response.prototype.type = noop;
Response.prototype.format = noop;
Response.prototype.attachment = noop;
Response.prototype.append = noop;
Response.prototype.set = noop;
Response.prototype.header = noop;
Response.prototype.get = noop;
Response.prototype.clearCookie = noop;
Response.prototype.cookie = noop;
Response.prototype.location = noop;
Response.prototype.vary = noop;
Response.prototype.render = noop;
Response.prototype.addTrailers = noop;
Response.prototype.end = noop;
Response.prototype.getHeader = noop;
Response.prototype.getHeaderNames = noop;
Response.prototype.getHeaders = noop;
Response.prototype.hasHeader = noop;
Response.prototype.removeHeader = noop;
Response.prototype.setHeader = noop;
Response.prototype.setTimeout = noop;
Response.prototype.write = noop;
Response.prototype.writeContinue = noop;
Response.prototype.writeHead = noop;

module.exports = Response;
