/**
 * 手写 MyPromise 源码
 *
 * 1、Promise 是一个类，new 的时候需要传入一个 执行器，并且立即执行
 * 2、resolve 和 reject 执行时改变状态且无法回退
 * 3、想要实现 then 的链式调用，即需要在 then 里返回一个 promise
 */

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
	status = PENDING;
	value = undefined;
	reason = undefined;

	// then 的多次调用
	successFn = [];
	errorFn = [];

	constructor(executor) {
		executor(this.resolve, this.reject);
	}

	resolve = (value) => {
		if (this.status !== PENDING) return;
		this.status = FULFILLED;
		this.value = value;
		// 处理异步逻辑
		while (this.successFn.length) {
			this.successFn.shift()();
		}
	};

	reject = (reason) => {
		if (this.status !== PENDING) return;
		this.status = REJECTED;
		this.reason = reason;
		// 处理异步逻辑
		while (this.errorFn.length) {
			this.errorFn.shift()();
		}
	};

	then(success, error) {
		// then 的回调里，如果结果是 普通值，则直接 resolve 出去
		// 如果是 Promise 对象，则根据状态来决定调用 resolve 还是 reject
		let thenResult = new MyPromise((resolve, reject) => {
			if (this.status === FULFILLED) {
				setTimeout(() => {
					let result = success(this.value);
					resolvePromise(thenResult, result, resolve, reject);
				}, 0);
			} else if (this.status === REJECTED) {
				setTimeout(() => {
					let result = error(this.reason);
					resolvePromise(thenResult, result, resolve, reject);
				}, 0);
			} else {
				this.successFn.push(() => {
					setTimeout(() => {
						let result = success(this.value);
						resolvePromise(thenResult, result, resolve, reject);
					});
				});
				this.errorFn.push(() => {
					setTimeout(() => {
						let result = error(this.reason);
						resolvePromise(thenResult, result, resolve, reject);
					});
				});
			}
		});
		return thenResult;
	}
}

const resolvePromise = (thenResult, successResult, resolve, reject) => {
	if (thenResult === successResult) {
		return reject(
			new TypeError("Chaining cycle detected for promise #<Promise>"),
		);
	}
	if (successResult instanceof MyPromise) {
		successResult.then(resolve, reject);
	} else {
		resolve(successResult);
	}
};

let promise1 = new MyPromise((resolve, reject) => {
	resolve(1111);
});
promise1
	.then(
		(res) => {
			console.log("第一次 then，接收成功的同步数据", res);
			return new MyPromise((resolve, reject) => {
				setTimeout(() => {
					resolve(2222);
				}, 1000);
			});
		},
		(err) => {
			console.log("第一次 then，接收失败的同步数据", err);
		},
	)
	.then(
		(res2) => {
			console.log("第二次 then，接收成功的异步数据", res2);
			return new MyPromise((resolve, reject) => {
				setTimeout(() => {
					resolve(3333);
				}, 2000);
			});
		},
		(err2) => {
			console.log("第二次 then，接收失败的同步数据", err2);
		},
	)
	.then(
		(res3) => {
			console.log("第三次 then，接收成功的异步数据", res3);
		},
		(err3) => {
			console.log("第三次 then，接收失败的异步数据", err3);
		},
	);
