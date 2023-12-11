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
		// 捕获执行器的执行错误
		try {
			executor(this.resolve, this.reject);
		} catch (error) {
			this.reject(error);
		}
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
		success = success ? success : (value) => value;
		error = error
			? error
			: (reason) => {
					throw reason;
			  };
		// then 的回调里，如果结果是 普通值，则直接 resolve 出去
		// 如果是 Promise 对象，则根据状态来决定调用 resolve 还是 reject
		let thenResult = new MyPromise((resolve, reject) => {
			if (this.status === FULFILLED) {
				setTimeout(() => {
					try {
						let result = success(this.value);
						// resolvePromise(thenResult, result, resolve, reject);
						if (result instanceof MyPromise) {
							result.then(resolve, reject);
						} else {
							resolve(result);
						}
					} catch (error) {
						reject(error);
					}
				}, 0);
			} else if (this.status === REJECTED) {
				setTimeout(() => {
					try {
						let result = error(this.reason);
						resolvePromise(thenResult, result, resolve, reject);
					} catch (error) {
						reject(error);
					}
				}, 0);
			} else {
				this.successFn.push(() => {
					setTimeout(() => {
						try {
							let result = success(this.value);
							resolvePromise(thenResult, result, resolve, reject);
						} catch (error) {
							reject(error);
						}
					});
				});
				this.errorFn.push(() => {
					setTimeout(() => {
						try {
							let result = error(this.reason);
							resolvePromise(thenResult, result, resolve, reject);
						} catch (error) {
							reject(error);
						}
					});
				});
			}
		});
		return thenResult;
	}

	static all(array) {
		let resultArray = [];
		let tempIndex = 0;

		return new MyPromise((resolve, reject) => {
			function addData(key, value) {
				resultArray[key] = value;
				tempIndex++;
				if (tempIndex === array.length) {
					resolve(resultArray);
				}
			}
			for (let i = 0; i < array.length; i++) {
				let current = array[i];
				if (current instanceof MyPromise) {
					current.then(
						(value) => {
							addData(i, value);
						},
						(err) => {
							reject(err);
						},
					);
				} else {
					addData(i, array[i]);
				}
			}
		});
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
	// throw new Error("执行器错误");
	// resolve(1111);
	reject("失败");
});
promise1
	.then()
	.then()
	.then(
		(res) => {
			console.log(res);
		},
		(error) => {
			console.log(error);
		},
	);
// promise1
// 	.then(
// 		(res) => {
// 			console.log("第一次 then，接收成功的同步数据", res);
// 			// throw new Error("then error");
// 			return new MyPromise((resolve, reject) => {
// 				setTimeout(() => {
// 					resolve(2222);
// 				}, 1000);
// 			});
// 		},
// 		(err) => {
// 			console.log("第一次 then，接收失败的同步数据", err);
// 			return 111111;
// 		},
// 	)
// 	.then(
// 		(res2) => {
// 			console.log("第二次 then，接收成功的异步数据", res2);
// 			return new MyPromise((resolve, reject) => {
// 				setTimeout(() => {
// 					resolve(3333);
// 				}, 2000);
// 			});
// 		},
// 		(err2) => {
// 			console.log("第二次 then，接收失败的同步数据", err2);
// 		},
// 	)
// 	.then(
// 		(res3) => {
// 			console.log("第三次 then，接收成功的异步数据", res3);
// 		},
// 		(err3) => {
// 			console.log("第三次 then，接收失败的异步数据", err3);
// 		},
// 	);

function test1() {
	return new MyPromise((resolve, reject) => {
		setTimeout(() => {
			resolve("p1");
		}, 2000);
	});
}

function test2() {
	return new MyPromise((resolve, reject) => {
		// resolve("p2");
		reject("一个失败都失败");
	});
}

MyPromise.all(["a", "b", test1(), test2(), "c"]).then(
	(res) => {
		console.log(res);
	},
	(error) => {
		console.log(error);
	},
);
