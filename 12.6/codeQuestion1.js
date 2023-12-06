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
