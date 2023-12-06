## 谈谈你是如何理解 JS 异步编程的？

JS是一门单线程的语言，因为它运行在浏览器的主渲染线程中，而渲染主线程只有一个。
另外渲染主线程要同时负责：渲染页面、执行JS等多工作。
如果使用同步的方式，就很可能会导致主线程产生阻塞，从而导致消息队列中的很多其他任务无法得到执行，造成页面卡死的现象。（其中就遇到过一次，在一个老项目中，通过 CDN 去加载了一些第三方的 css 和 js，但是 CDN 失效了，导致页面被 CSS 文件加载卡死，每次进入都需要两分钟左右，后来在 控制台-network-all 查看各资源的加载时间定位到的）
所以浏览器采用异步的方式来避免同步可能会产生的问题。
具体流程是：
当某些任务发生时，比如计时器、网络、事件监听，主线程将任务交给其他线程去处理，自身立即结束此任务的执行，然后从消息（任务）队列中取下一个任务执行（或者描述为：转而继续执行后续代码）。当其他线程完成时，将事先传递的回调函数包装成任务，加入到消息队列的末尾排队，等待主线程调度执行。
在这种异步模式下，浏览器永不阻塞，从而最大限度的保证了单线程的流程运行。


## 消息队列都是做什么的
消息队列可以理解为一个函数调用队列，先进先出，排队执行。当异步任务执行完成后，异步任务的回调函数会进队等待执行。
消息队列是分多种类型的，不同类型的消息队列的优先级不同，也就可以对应下面的宏任务和微任务。


## 什么是宏任务
宏任务通常包括：
    - 用户交互事件（click、load 等）
    - setTimeout 和 setInterval 定时器
    - I/O 操作

## 什么是微任务
微任务通常包括：
    - Promise 的 resolve 和 reject
    - MutationObserver
    - process.nextTick
微任务会进入微任务消息队列，微任务消息队列的优先级比宏任务消息队列的优先级高。当渲染主线程的任务执行完毕后，会先从微任务消息队列中提取任务入队执行，当没有微任务后才会从宏任务消息队列中提取任务入队执行。


# 代码题

## 将下面异步代码使用 Promise 的方式改进
```javascript
setTimeout(function () {
    var a = "hello";
    setTimeout(function () {
        var b = "lagou";
        setTimeout(function () {
            var c = "I love you";
            console.log(a + b + c);
        }, 10);
    }, 10);
}, 10);
```

```javascript
let result = new Promise((resolve, reject) => {
	return setTimeout(function () {
		resolve("hello");
	}, 1000);
});
result
	.then((res) => {
		return new Promise((resolve) => {
			setTimeout(function () {
				resolve(res + "lagou");
			}, 1000);
		});
	})
	.then((res) => {
		setTimeout(function () {
			console.log(res + "i love you");
		}, 1000);
	});
```
