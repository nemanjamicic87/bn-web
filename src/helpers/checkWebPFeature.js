//   'feature' can be one of 'lossy', 'lossless', 'alpha' or 'animation'.
//   'callback(feature, result)' will be passed back the detection result (in an asynchronous way!)
export default () => {
	return (document.createElement("canvas").toDataURL("image/webp").indexOf("data:image/webp") === 0);
};
