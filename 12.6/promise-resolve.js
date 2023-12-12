/**
 * Promise.resolve 方法的实现
 *      - 将给定的值转换为 Promise 对象
 */

// 传入 10 之后，new 了一个 Promise 对象，并且把 10 resolve 出去，所以返回的就是一个 Promise 对象
// 另外因为返回的是 Promise 对象，所以才有 then 方法的调用
Promise.resolve(10).then((res) => {
	console.log(res);
});

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

	static resolve(value) {
		// 如果是 MyPromise 对象，则直接返回
		if (value instanceof MyPromise) return value;
		// 如果不是，则需要创建一个 MyPromise 对象返回
		return new MyPromise((resolve) => {
			resolve(value);
		});
	}

	finally(callback) {
		// 在 then 中可以明确 状态为 非 pending ，所以不管成功还是失败都调用回调函数即可
		return this.then(
			(value) => {
				return MyPromise.resolve(callback()).then(() => value);
				// callback();
				// return value;
			},
			(error) => {
				return MyPromise.resolve(callback()).then(() => {
					throw error;
				});
				// callback();
				// throw error;
			},
		);
	}

	catch(errorCallback) {
		return this.then(undefined, errorCallback);
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

// 验证 resolve 方法

function p1() {
	return new MyPromise((resolve, reject) => {
		setTimeout(() => {
			resolve("p1");
		}, 2000);
	});
}
// MyPromise.resolve(100).then((value) => console.log(value));
// MyPromise.resolve(p1()).then((val) => console.log(val));

//验证 finally 方法
function p2() {
	return new MyPromise((resolve, reject) => {
		reject("p2 reject");
		// resolve("p2 resolve");
	});
}

// p2()
// 	.finally(() => {
// 		console.log("finally");
// 		return p1();
// 	})
// 	.then(
// 		(value) => {
// 			console.log(value);
// 		},
// 		(err) => {
// 			console.log(err);
// 		},
// 	);

//测试 catch
p2()
	.then((value) => console.log(value))
	.catch((err) => console.log(err));
