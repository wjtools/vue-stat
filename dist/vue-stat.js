/*!
 * vue-stat v0.0.3
 * (c) 2018 steven
 * Released under the MIT License.
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.VueStat = global.VueStat || {})));
}(this, (function (exports) { 'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var keys = createCommonjsModule(function (module, exports) {
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) { keys.push(key); }
  return keys;
}
});

var is_arguments = createCommonjsModule(function (module, exports) {
var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
}
});

var deepEqual_1 = createCommonjsModule(function (module) {
var pSlice = Array.prototype.slice;



var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) { opts = {}; }
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
};

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') { return false; }
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') { return false; }
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    { return false; }
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) { return false; }
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (is_arguments(a)) {
    if (!is_arguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) { return false; }
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) { return false; }
    }
    return true;
  }
  try {
    var ka = keys(a),
        kb = keys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    { return false; }
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      { return false; }
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) { return false; }
  }
  return typeof a === typeof b;
}
});

/**
 * if the binding value is equal to oldeValue
 */
function notChanged (binding) {
  if (binding.oldValue !== undefined) {
    if (typeof binding.value === 'object') {
      return deepEqual_1(binding.value, binding.oldValue)
    } else {
      return binding.value === binding.oldValue
    }
  } else {
    return false
  }
}

/**
 * if the binding value is empty
 */
function isEmpty (binding) {
  return binding.value === '' || binding.value === undefined || binding.value === null
}

var autoPageview = function (el, binding) {
  if (notChanged(binding)) { return }

  var args = [];
  if (binding.value === false || binding.value === 'false') { args.push(false); }
  else { args.push(true); }
  stat.setAutoPageview.apply(stat, args);
};

var statEvent = function (el, binding) {
  if (notChanged(binding) || isEmpty(binding)) { return }

  if (el.removeEventListeners && typeof el.removeEventListeners === 'function') {
    el.removeEventListeners();
  }

  var args = [];
  // use modifier as events
  var events = Object.keys(binding.modifiers).map(function (modifier) {
    if (binding.modifiers[modifier]) {
      return modifier
    }
  });

  // passing parameters as object
  if (typeof binding.value === 'object') {
    var value = binding.value;
    if (value.category) { args.push(value.category); }
    if (value.action) { args.push(value.action); }
    if (value.label) { args.push(value.label); }
    if (value.value) { args.push(value.value); }
    if (value.nodeid) { args.push(value.nodeid); }

    // passing parameters as string separate by comma
  } else if (typeof binding.value === 'string') {
    args = binding.value.split(',');
    args.forEach(function (arg, i) { return (args[i] = arg.trim()); });
  }

  if (!events.length) { events.push('click'); } // listen click event by default

  // addEventListener for each event, call trackEvent api
  var listeners = [];
  events.forEach(function (event, index) {
    listeners[index] = function () { return stat.trackEvent.apply(stat, args); };
    el.addEventListener(event, listeners[index], false);
  });

  // a function to remove all previous event listeners in update cycle to prevent duplication
  el.removeEventListeners = function () {
    events.forEach(function (event, index) {
      el.removeEventListener(event, listeners[index]);
    });
  };
};

var watch = [];

var trackPageview = {
  bind: function bind (el, binding) {
    var index = watch.findIndex(function (element) { return element === el; });
    var isWatched = index !== -1;
    // watch for a v-show binded element, push it to watch queue when v-show is false
    if (el.style.display === 'none') {
      if (!isWatched) { watch.push(el); }
      return
    } else {
      // remove from watch queue when v-show is true
      if (isWatched) { watch.splice(index, 1); }
    }
    if (!isWatched && (notChanged(binding) || isEmpty(binding))) { return }

    var args = [];

    // passing parameters as object
    if (typeof binding.value === 'object') {
      var value = binding.value;
      if (value.path) { args.push(value.path); }
      if (value.fromPath) { args.push(value.fromPath); }

      // passing parameters as string separate by comma
    } else if (typeof binding.value === 'string' && binding.value) {
      args = binding.value.split(',');
      args = args.map(function (arg) { return arg.trim(); });
    }

    stat.trackPageview.apply(stat, args);
  },

  unbind: function unbind (el, binding) {
    var index = watch.findIndex(function (element) { return element === el; });
    if (index !== -1) { watch.splice(index, 1); }
  }
};
trackPageview.update = trackPageview.bind;

/**
 * install
 *
 * @param {Vue} Vue
 * @param {Object} options
 * @returns
 */
function install (Vue, options) {
  var this$1 = this;

  if (this.install.installed) { return }

  if (options.debug) {
    this.debug = console.debug;
  } else {
    this.debug = function () {};
  }

  var siteId = null;
  // passsing siteId through object or string
  if (typeof options === 'object') {
    siteId = options.siteId;
    if (options.autoPageview !== false) {
      options.autoPageview = true;
    }
  } else {
    siteId = options;
  }
  if (!siteId) {
    return console.error('siteId is missing')
  }
  this.install.installed = true;

  // insert u-web statistics script
  var script = document.createElement('script');
  var site = options.site || 'https://hm.baidu.com/hm.js';
  var isBaidu = site.indexOf('baidu.com') > -1;
  var src = isBaidu ? (site + "?" + siteId) : (site + "?id=" + siteId + "&web_id=" + siteId);
  script.src = options.src || src;

  // TODO: 百度统计差异处理
  if (isBaidu) {
    window._hmt = window._hmt || [];
  }

  // callback when the script is loaded
  script.onload = function () {
    // if the global object is exist, resolve the promise, otherwise reject it
    if (window[isBaidu ? '_hmt' : '_czc']) {
      this$1._resolve();
    } else {
      console.error('loading uweb statistics script failed, please check src and siteId');
      return this$1._reject()
    }

    // load from cache
    this$1._cache.forEach(function (cache) {
      window[isBaidu ? '_hmt' : '_czc'].push(cache);
    });
    this$1._cache = [];
  };

  this.setAccount(options.siteId);
  this.setAutoPageview(options.autoPageview);

  document.body.appendChild(script);

  // store into cache when the script is not fully loaded
  // add $czc to Vue prototype
  Object.defineProperty(Vue.prototype, '$stat', {
    get: function () { return this$1; }
  });

  Vue.directive('auto-pageview', autoPageview);
  Vue.directive('stat-event', statEvent);
  Vue.directive('stat-pageview', trackPageview);
}

// deferred promise
var deferred = {};
deferred.promise = new Promise(function (resolve, reject) {
  deferred.resolve = resolve;
  deferred.reject = reject;
});

// stat apis
var methods = [
  'trackPageview', // http://open.cnzz.com/a/api/trackpageview/
  'trackEvent', // http://open.cnzz.com/a/api/trackevent/
  'setCustomVar', // http://open.cnzz.com/a/api/setcustomvar/
  'setAccount', // http://open.cnzz.com/a/api/setaccount/
  'setAutoPageview', // http://open.cnzz.com/a/api/setautopageview/
  'deleteCustomVar' // http://open.cnzz.com/a/api/deletecustomvar/
];

var stat = {
  // internal user only
  _cache: [],

  // internal user only, resolve the promise
  _resolve: function _resolve () {
    deferred.resolve();
  },

  // internal user only, reject the promise
  _reject: function _reject () {
    deferred.reject();
  },

  // push the args into _czc/_hmt, or _cache if the script is not loaded yet
  _push: function _push () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    this.debug(args);
    if (window._hmt) {
      (ref = window._hmt).push.apply(ref, args);
    } else if (window._czc) {
      (ref$1 = this._czc).push.apply(ref$1, args);
    } else {
      (ref$2 = this._cache).push.apply(ref$2, args);
    }
    var ref;
    var ref$1;
    var ref$2;
  },

  // general method to create stat apis
  _createMethod: function _createMethod (method) {
    var this$1 = this;

    return function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      this$1._push([("_" + method) ].concat( args));
    }
  },

  // debug
  debug: function debug () {},

  // the plugins is ready when the script is loaded
  ready: function ready () {
    return deferred.promise
  },

  // install function
  install: install,

  // patch up to create new api
  patch: function patch (method) {
    this[method] = this._createMethod(method);
  }
};

// stat apis
methods.forEach(function (method) { return (stat[method] = stat._createMethod(method)); });

if (window.Vue) {
  window.stat = stat;
}

exports['default'] = stat;

Object.defineProperty(exports, '__esModule', { value: true });

})));
