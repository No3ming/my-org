import * as StackTracey from 'stacktracey'

// const stack = new StackTracey()
// const tracker = {
//   postHttp
// }
type TLog = {
  kind: string,
  componentName?: string
  errorType?: string
  type?: string
  simpleUrl?: string
  timeStamp?: number
  mountTime?: number
  message?: string
  fileName?: string
  position?: number | any
  detail?: string
  async?: 'true' | 'false',
  firstPaint?: number
  firstContentfulPaint?: number,
  firstMeaningfulPaint?: number,
  largestContentfulPaint?: number
}

const preURL = '/log'


export function initOnError () {
  window.addEventListener("error", function (event) {
    console.log(event)
    let log: TLog = {
      kind: "stability", //稳定性指标
      errorType: "jsError", //jsError
      simpleUrl: window.location.href.split('?')[0].replace('#', ''), // 页面的url
      timeStamp: new Date().getTime(), // 日志发生时间
      position: (event.lineno || 0) + ":" + (event.colno || 0), //行列号
      fileName: event.filename, //报错链接
      message: event.message, //报错信息
      detail: "null",
      async: "true"
    };
    fetch(preURL, {
      method: 'POST',
      body: JSON.stringify(log)
    })
  },
    true
  ); // true代表在捕获阶段调用,false代表在冒泡阶段捕获,使用true或false都可以


  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent | any) => {
    console.log(e);
    const log: TLog = {
      kind: 'stability',
      errorType: 'jsError',
      simpleUrl: window.location.href,
      timeStamp: new Date().getTime(),
      message: e.reason,
      fileName: 'null',
      position: (e.lineno || 0) + ':' + (e.colno || 0),
      detail: 'null',
      async: 'true'
    }
    fetch(preURL, {method: 'POST',body: JSON.stringify(log)})
  })
  
  remakeAjax() 

  
  remakeFetch()

  remakeWebsocket()

  timing()

}

function getLog (rest: TLog): TLog {
  return {
    ...rest,
    simpleUrl: window.location.href,
    timeStamp: +new Date() 
  }
}

export function vuePlugin () {
  return {
    install: function (Vue: any, options: any) {
      const {shouldcompute} = options || {}
      Vue.config._olderrorHandler = Vue.config.errorHandler
      Vue.config.errorHandler = function (...rest: any[]) {
        const [error, vm, info] = rest
        const stack = new StackTracey(error)
        console.log(error);
        const log: TLog = getLog({
          kind: "stability",
          errorType: "jsError",   //jsError
          simpleUrl: window.location.href.split('?')[0].replace('#', ''),   // 页面的url
          timeStamp: new Date().getTime(),   // 日志发生时间
          position: `${stack.items[0].column}:${stack.items[0].line}`,  // 需要处理掉无效的前缀信息
          fileName: stack.items[0].fileName,  //错误文件名
          message: stack.items[0].callee,  //错误信息
          detail: `${error.toString()}`,
          async: 'false',  //是否是异步
        })
        fetch(preURL, {method: 'POST', body: JSON.stringify(log)})
        return Vue.config._olderrorHandler.apply(this, rest)
      }

      Vue.mixin({
        beforeCreate: function () {
          if (!shouldcompute) return
          this._createTime = new Date().getTime()
        },
        mounted() {
          if (!shouldcompute) return
          this._endTime = new Date().getTime()
          const mountTime = this._createTime - this._endTime
          const componentNameArr = this.$vnode.tag.split('-')
          const componentName = componentNameArr[componentNameArr.length - 1]
          const log = getLog({
            kind: 'experience',

            type: 'ComponentMountTime',
            // 组件名称
            componentName,
            // 组件加载时间
            mountTime,

          })
          fetch(preURL, {body: JSON.stringify(log)})
        },
      })
    }
  }
}
/**
 * 重写ajax
 */
function remakeAjax () {
  let XMLHttpRequest = window.XMLHttpRequest
  let oldOpen = XMLHttpRequest.prototype.open
  // @ts-ignore
  XMLHttpRequest.prototype.open = function (...rest) {
    // @ts-ignore
    return oldOpen.apply(this, rest)
  }

  let oldSend = XMLHttpRequest.prototype.send

  XMLHttpRequest.prototype.send = function (...rest) {
    console.log(this);
    return oldSend.apply(this, rest)
  }


}
/**
 * 重写fetch
 */
function remakeFetch () {
  if (!window.fetch) {
    return
  }
  let oldFetch = window.fetch
  // @ts-ignore
  window.fetch = function (...rest) {
    return oldFetch.apply(this, rest)
    .then(response => {
      if (!response.ok) {
        console.log('fetch error then', response);
      }
    })
    .catch(error => {
      console.log('fetch error catch', error);
    })
  }
}
// 给websocket添加方法
declare global {
  interface WebSocket {
    oldSend : globalThis.WebSocket['send']
    oldClose: globalThis.WebSocket['close']
  }
}

/**
 * 重写websocket
 */
function remakeWebsocket () {

  WebSocket.prototype.oldSend = WebSocket.prototype.send
  WebSocket.prototype.send = function (...rest) {
    console.log(rest);
    return  WebSocket.prototype.oldSend.apply(this, rest)
  } 
  WebSocket.prototype.oldClose = WebSocket.prototype.close
  WebSocket.prototype.close = function (...rest) {
    console.log(rest);
    return  WebSocket.prototype.oldClose.apply(this, rest)
  }
}
/**
 * 性能指标
 */
function timing () {
  let FMP: any // 表示HTML加载完成事件， L(onLoad) 表示页面所有资源加载完成事件，大家应该对这两个事件非常熟悉了
  let LCP: any // 可视区域“内容”最大的可见元素开始出现在页面上的时间点
  let FP: any // 面在导航后首次呈现出不同于导航前内容的时间点
  let FCP: any // 首次绘制任何文本 图像 非空白 canvas或SVG的时间
  if (PerformanceObserver) {
    new PerformanceObserver((entryList, observe) => {
      let perfEntries = entryList.getEntries()
      FMP = perfEntries[0]
      console.log('FMP', FMP);
      observe.disconnect()
    }).observe({entryTypes: ['element']}) // 观察页面中的意义元素
    new PerformanceObserver((entryList, observe) => {
      let perfEntries = entryList.getEntries()
      LCP = perfEntries[0]
      console.log('LCP', LCP);
      observe.disconnect()
    }).observe({entryTypes: ['largest-contentful-paint']}) // 
   
     window.addEventListener('load', () => {
      setTimeout(() => {
        const log = getLog({
          kind: 'experience', //用户体验指标
          type: 'paint', //统计每个阶段的时间
          firstPaint: FP?.startTime,
          firstContentfulPaint: FCP?.startTime,
          firstMeaningfulPaint: FMP?.startTime || -1,
          largestContentfulPaint: LCP?.startTime || -1,
          timeStamp: Date.now(),
        })
        console.log(FP, FCP, FMP, LCP);
        fetch(preURL, {
          method: 'POST',
          body: JSON.stringify(log)
        })
      }, 3000)
     })
  }
 
}

initOnError()