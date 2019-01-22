import Storage from 'web-storage-cache'

// 这个库最大的好处在于：
// 可以将传入的对象转变为json字符串进行存储
// 读取的时候，可以将json字符串再次转化为对象

const localStorage = new Storage()

export function setLocalStorage(key, value) {
  return localStorage.set(key, value)
}

export function getLocalStorage(key) {
  return localStorage.get(key)
}

export function removeLocalStorage(key) {
  return localStorage.delete(key)
}

export function clearLocalStorage() {
  return localStorage.clear()
}

// 因为每本电子书的设置可能不一样
// 所以给每本电子书都开启一个 localStorage 的空间
// 每个空间以 fileName 为key值， book对象为 value值
// （所以下面括号后两个形参指的是 book对象中的key和value）
export function setBookObject(fileName, key, value) {
  // 后面的 -info 表示设置信息
  let book = getLocalStorage(`${fileName}-info`)
  if (!book) {
    book = {}
    book[key] = value
  }
  book[key] = value

  // 此处key里面存储的value 是一个book对象
  // 存储的时候，将传入的对象转变为json字符串
  // 读取的时候，将json字符串再次转化为对象
  setLocalStorage(`${fileName}-info`, book)
}

export function getBookObject(fileName, key) {
  let book = getLocalStorage(`${fileName}-info`)
  if (book) {
    return book[key]
  } else {
    return null
  }
}

// 字体样式的离线存储
export function getFontFamily(fileName) {
  return getBookObject(fileName, 'fontFamily')
}

export function saveFontFamily(fileName, font) {
  return setBookObject(fileName, 'fontFamily', font)
}

// 字体字号的离线存储
export function getFontSize(fileName) {
  return getBookObject(fileName, 'fontSize')
}

export function saveFontSize(fileName, fontSize) {
  setBookObject(fileName, 'fontSize', fontSize)
}