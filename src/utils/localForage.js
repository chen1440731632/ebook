import localForage from 'localforage'

// localForage库：全部采用异步的方式，返回promise对象

export function setLocalForage(key, data, cb, cb2) {
  localForage.setItem(key, data).then((value) => {
    if (cb) cb(value)
  }).catch(function(err) {
    if (cb2) cb2(err)
  })
}

export function getLocalForage(key, cb) {
  localForage.getItem(key, (err, value) => {
    cb(err, value)
  })
}

export function removeLocalForage(key, cb, cb2) {
  localForage.removeItem(key).then(function() {
    if (cb) cb()
  }).catch(function(err) {
    if (cb2) cb2(err)
  })
}

export function clearLocalForage(cb, cb2) {
  localForage.clear().then(function() {
    if (cb) cb()
  }).catch(function(err) {
    if (cb2) cb2(err)
  })
}

export function lengthLocalForage(cb) {
  localForage.length().then(
    numberOfKeys => {
      if (cb) cb(numberOfKeys)
      // console.log(numberOfKeys)
    }).catch(function(err) {
      if (err) {}
    // console.log(err)
  })
}

// 遍历
export function iteratorLocalForage() {
  localForage.iterate(function(value, key, iterationNumber) {
    // console.log([key, value])
  }).then(function() {
    // console.log('Iteration has completed')
  }).catch(function(err) {
    if (err) {}
    // console.log(err)
  })
}

// 判断当前浏览器是否支持indexDB数据库
export function support() {
  const indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || null
  if (indexedDB) {
    return true
  } else {
    return false
  }
}