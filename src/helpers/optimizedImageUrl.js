/**
 * optimizedImageUrl
 * @params {url, quality}
 *
 * See https://cloudinary.com/documentation/image_optimization
 * quality can be 'best', 'good', 'eco' or 'low'
 */
export default (url, quality = "low", size = {}) => {
	if (!url || typeof url !== "string") {
		return url;
	}

	//Only manipulate urls served from cloudinary
	if (url.indexOf("res.cloudinary.com") === -1) {
		return url;
	}

	const prepSizes = ({ w = null, h = null }) => {
		const sizes = [];
		if (w) {
			sizes.push(`w_${w}`);
		}
		if (h) {
			sizes.push(`h_${h}`);
		}
		if (sizes.length) {
			return sizes.join(",") + "/";
		}
		return "";

	};

	//We are only interested in the parts after /image/upload and before the image filename
	const properties = url.split("/image/upload/").pop().split("/");
	const filename = properties.pop();

	const setProperties = {
		"q_auto": quality,
		"w": null,
		"h": null,
		...size
	};

	properties.forEach(prop => {
		prop.split(",").forEach(prop => {
			if (prop.indexOf("q_auto") === 0) {
				setProperties["q_auto"] = prop.split(":").pop();
			} else if (prop.indexOf("w_") === 0) {
				setProperties["w"] = prop.split("_").pop();
			} else if (prop.indexOf("h_") === 0) {
				setProperties["h"] = prop.split("_").pop();
			}
		});

	});

	const sizeString = prepSizes(setProperties);

	const insertAfterString = "/image/upload/";
	const startOfParamsIndex = url.indexOf(insertAfterString);
	if (startOfParamsIndex === -1) {
		return url;
	}

	const qualityParams = `${sizeString}q_auto:${setProperties["q_auto"]}/f_auto/`;
	const indexToInsert = startOfParamsIndex + insertAfterString.length;

	return [url.slice(0, indexToInsert), qualityParams, filename].join("");
};
