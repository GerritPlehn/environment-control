function checkStatus() {
	Shelly.call(
		"http.get",
		{ url: "http://[your-controller-ip]:3000" },
		// biome-ignore lint/complexity/useArrowFunction: shelly doesn't support arrow functions
		function (res, error_code) {
			if (error_code || res.code !== 200) {
				Shelly.call("Switch.Set", { id: 0, on: false });
			}
		},
	);
}

// check every 60 seconds
Timer.set(60000, true, checkStatus);
