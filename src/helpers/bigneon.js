import Bigneon from "bn-api-node";
import errorReporting from "./errorReporting";

let bigneon;

export const bigneonFactory = (options = {}, headers = {}, mockData, forceReInit) => {
	if (!bigneon || forceReInit) {
		options = {
			...{
				protocol: process.env.REACT_APP_API_PROTOCOL,
				host: process.env.REACT_APP_API_HOST,
				port: process.env.REACT_APP_API_PORT,
				timeout: process.env.REACT_APP_API_TIMEOUT || 30000,
				basePath: process.env.REACT_APP_API_BASEPATH || "",
				prefix: process.env.REACT_APP_API_PREFIX || ""
			},
			...options
		};

		bigneon = new Bigneon.Server(options, headers, mockData);
		const access_token = localStorage.getItem("access_token");
		const refresh_token = localStorage.getItem("refresh_token") || null;
		if (access_token) {
			bigneon.client.setTokens({ access_token, refresh_token });
		}
		bigneon.client.OnTokenRefresh = onTokenRefresh;
		errorReporting.addBreadcrumb("Bigneon client instantiated.");
	}

	return bigneon;
};

const onTokenRefresh = async (server = {}, client = {}, data = {}) => {
	const { access_token, refresh_token } = data.data;
	localStorage.setItem("access_token", access_token);
	localStorage.setItem("refresh_token", refresh_token);
	client.setTokens(data.data);
	return Promise.resolve(data);
};

export default bigneonFactory;
