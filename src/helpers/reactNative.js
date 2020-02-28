export const isReactNative = () => {
	return !!window.ReactNativeWebView;
};

export const sendReactNativeMessage = (messageString) => {
	if (typeof(messageString) !== "string") {
		throw "messageString must be of type string";
	}
	if (!isReactNative()) {
		console.warn("Not in embedded environment, please check `isReactNative()` first");
		return;
	}
	try {
		return window.ReactNativeWebView.postMessage(messageString);
	}catch(e) {
		window.postMessage(messageString, "*");
		console.error(e);

	}

};

export const bindReactNativeMessageBridge = (callback) => {
	if (!isReactNative()) {
		return;
	}

	window.addEventListener("message", callback, false);
};
