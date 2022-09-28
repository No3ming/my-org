describe('errorType', () => {
// evalError 已在eval函数中发生的错误
  it("evalError", () => {
    eval('va a = ')
  })
// InernalError 内部错误
  it("InernalError", () => {
    function a () {
      a()
    }
    a()
  })
// RangeError 已发生超出数字范围的错误
  it("rangeError", () => {
    const arr = [99, 88]
    arr.length = 99 ** 99
  })
// ReferenceError 已发生非法引用
  it("ReferenceError", () => {
    foo.subscribe(1)
  })

// SyntaxError 已发生错误语法

// TypeError 已发生语法错误
  it('TypeError', () => {
    window.someVar.error = 'error'
  })

// URIError 在encodeURI() 中已发生的错误
  it('uriError', () => {
    let a = encodeURI('\uD800%')
    console.log(a)
  })
  // AsyncError || Promise Error
  it('async Error', () => {
    Promise.reject('this async Error')
  })
})
