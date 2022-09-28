export const watchTask = () => {
    // eval('va a = ');
    // InernalError 内部错误
    // function a() {
    //   a();
    // }
    // a();
    // RangeError 已发生超出数字范围的错误
    // const arr = [99, 88];
    // arr.length = 99 ** 99;
    // ReferenceError 已发生非法引用
    // @ts-ignore
    // foo.subscribe(1);
  
    // SyntaxError 已发生错误语法
  
    // TypeError 已发生语法错误
    // @ts-ignore
    // window.someVar.error = 'error';
  
    // URIError 在encodeURI() 中已发生的错误
    // let a1 = encodeURI('\uD800%');
    // console.log(a1);
    // AsyncError || Promise Error
    Promise.reject('this async Error')
}