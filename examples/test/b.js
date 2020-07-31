import a from './b'

console.log('bbb', b)
setTimeout(() => {
  console.log('再次打印a', a)
}, 2000)