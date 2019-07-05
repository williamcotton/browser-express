/* global window, document */

const EventEmitter = require('events');
const inherits = require('inherits');

const location = typeof window !== 'undefined' && window.location;
const noop = function noop() {};

function Request() {
  this.app = null;
  this.url = null;
  this.method = null;
  this.baseUrl = null;
  this.originalUrl = null;
  this.path = null;
  this.hostname = location.hostname;
  this.protocol = location.protocol.slice(0, location.protocol.length - 1);
  this.port = location.port;
  this.secure = this.protocol === 'https';
  this.subdomains = this.hostname
    .split('.')
    .reverse()
    .slice(2);
  this.socket = null;
  this.httpVersion = '1.1';
  this.rawHeaders = [];
  this.headers = {};
  this.rawTrailers = [];
  this.trailers = {};
  this.ip = '';
  this.ips = [];
  this.fresh = true;
  this.stale = false;
  this.xhr = false;
}

inherits(Request, EventEmitter);

Request.prototype.get = name => {
  if (typeof name !== 'string') {
    throw new TypeError('name must be a string to req.get');
  }
  const lc = name.toLowerCase();
  switch (lc) {
    case 'referer':
    case 'referrer':
      return document.referrer;
    case 'content-type':
      return document.contentType;
    default:
      return false;
  }
};

Request.prototype.header = Request.prototype.get;
Request.prototype.accepts = noop;
Request.prototype.acceptsEncodings = noop;
Request.prototype.acceptsCharsets = noop;
Request.prototype.acceptsLanguages = noop;
Request.prototype.range = noop;
Request.prototype.is = noop;

module.exports = Request;
