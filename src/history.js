var on = require('./on')

module.exports = function createHistory (options, onChange) {
  var mode = options.mode

  var memory = []
  var off

  if (typeof window === 'undefined') {
    mode = 'memory'
  } else {
    if (mode === 'history' && !history.pushState) {
      mode = 'hash'
    }
    off = on(window, mode === 'history' ? 'popstate' : 'hashchange', onPop)
  }

  function onPop () {
    onChange(url())
  }

  return {
    url: url,
    stop: function () {
      off && off()
    },
    push: function push (url, options) {
      url = url.replace(/^\/?#?\/?/, '/').replace(/\/$/, '') || '/'
      options = options || {}
      if (mode === 'history') {
        history[options.replace ? 'replaceState' : 'pushState']({}, '', url)
        onPop()
      } else if (mode === 'hash') {
        location[options.replace ? 'replace' : 'assign']('#' + url)
      } else if (mode === 'memory') {
        options.replace ? (memory[memory.length - 1] = url) : memory.push(url)
        onPop()
      }
    }
  }

  function url () {
    if (mode === 'history') return location.pathname + location.search + '#' + getHash()
    if (mode === 'hash') return getHash()
    if (mode === 'memory') return memory[memory.length - 1]
  }

  // Gets the true hash value. Cannot use location.hash directly due to bug
  // in Firefox where location.hash will always be decoded.
  function getHash () {
    var match = location.href.match(/#(.*)$/)
    return match ? match[1].replace('#', '') : '/'
  }
}
