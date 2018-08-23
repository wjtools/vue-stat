import install from './install'

// deferred promise
const deferred = {}
deferred.promise = new Promise((resolve, reject) => {
  deferred.resolve = resolve
  deferred.reject = reject
})

// stat apis
const methods = [
  'trackPageview', // http://open.cnzz.com/a/api/trackpageview/
  'trackEvent', // http://open.cnzz.com/a/api/trackevent/
  'setCustomVar', // http://open.cnzz.com/a/api/setcustomvar/
  'setAccount', // http://open.cnzz.com/a/api/setaccount/
  'setAutoPageview', // http://open.cnzz.com/a/api/setautopageview/
  'deleteCustomVar' // http://open.cnzz.com/a/api/deletecustomvar/
]

const stat = {
  // internal user only
  _cache: [],

  // internal user only, resolve the promise
  _resolve () {
    deferred.resolve()
  },

  // internal user only, reject the promise
  _reject () {
    deferred.reject()
  },

  // push the args into _czc/_hmt, or _cache if the script is not loaded yet
  _push (...args) {
    this.debug(args)
    if (window._hmt) {
      window._hmt.push(...args)
    } else if (window._czc) {
      this._czc.push(...args)
    } else {
      this._cache.push(...args)
    }
  },

  // general method to create stat apis
  _createMethod (method) {
    return (...args) => {
      this._push([`_${method}`, ...args])
    }
  },

  // debug
  debug () {},

  // the plugins is ready when the script is loaded
  ready () {
    return deferred.promise
  },

  // install function
  install,

  // patch up to create new api
  patch (method) {
    this[method] = this._createMethod(method)
  }
}

// stat apis
methods.forEach((method) => (stat[method] = stat._createMethod(method)))

if (window.Vue) {
  window.stat = stat
}
export default stat
