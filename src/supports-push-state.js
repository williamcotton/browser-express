/* global window, navigator */

let supported = true;
const ua = navigator.userAgent;

if (
  (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
  ua.indexOf('Mobile Safari') !== -1 &&
  ua.indexOf('Chrome') === -1 &&
  ua.indexOf('Windows Phone') === -1 &&
  window.location &&
  window.location.protocol !== 'file:'
) {
  supported = false;
}

module.exports = supported && window.history && 'pushState' in window.history;
