/**
 * 手写 MyPromise 源码
 *
 * 1、Promise 是一个类，new 的时候需要传入一个 执行器，并且立即执行
 * 2、resolve 和 reject 执行时改变状态且无法回退
 */

let result = new Promise((resolve, reject) => {
	resolve("12312313");
});

result
	.then(
		(success) => {
			console.log("success", success);
		},
		(error) => {
			console.log("error", error);
		},
	)
	.then(() => {
		console.log("1231");
	});

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
	status = PENDING;
	value = undefined;
	reason = undefined;

	// then 中的回调函数（单次调用）
	successFn = undefined;
	errorFn = undefined;

	constructor(executor) {
		executor(this.resolve, this.reject);
	}

	resolve = (value) => {
		if (this.status !== PENDING) return;
		this.status = FULFILLED;
		this.value = value;
		// 处理异步逻辑
		this.successFn && this.successFn(this.value);
	};

	reject = (reason) => {
		if (this.status !== PENDING) return;
		this.status = REJECTED;
		this.reason = reason;
		// 处理异步逻辑
		this.errorFn && this.errorFn(this.reason);
	};

	then = (success, error) => {
		if (this.status === FULFILLED) {
			success(this.value);
		} else if (this.status === REJECTED) {
			error(this.reason);
		} else {
			this.successFn = success;
			this.errorFn = error;
		}
	};
}

// 验证一：同步的成功与失败
// let result1 = new MyPromise((resolve, reject) => {
// 	// resolve("成功传递的数据");
// 	reject("失败传递的数据");
// });
// result1.then(
// 	(res) => {
// 		console.log(res);
// 	},
// 	(err) => {
// 		console.log(err);
// 	},
// );

// 验证二：异步的成功与失败
let result2 = new MyPromise((resolve, reject) => {
	setTimeout(() => {
		// resolve("异步传递的成功数据");
		reject("异步传递的失败数据");
	}, 1000);
});
result2.then(
	(res) => {
		console.log(res);
	},
	(err) => {
		console.log(err);
	},
);
