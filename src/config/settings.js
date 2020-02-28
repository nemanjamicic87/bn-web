import checkWebPFeature from "../helpers/checkWebPFeature";

let settings;

export const settingsFactory = () => {
	if (!settings) {
		let webUrl = process.env.REACT_APP_WEB_URL;
		if (webUrl.substring(webUrl.length - 1) === "/") {
			webUrl = webUrl.substring(0, webUrl.length - 1);
		}

		settings = {
			promoImageAspectRatio: 1920 / 1080,
			webPSupported: checkWebPFeature(), //Does the browser support next gen image formats
			webUrl,
			genericAppDownloadLink: process.env.REACT_APP_DOWNLOAD_APP,
			facebookLink: process.env.REACT_APP_FACEBOOK_URL,
			instagramLink: process.env.REACT_APP_INSTAGRAM_URL,
			twitterLink: process.env.REACT_APP_TWITTER_URL,
			appSupportLink: process.env.REACT_APP_SUPPORT_URL,
			supportFAQLink: process.env.REACT_APP_SUPPORT_FAQ_LINK,
			submitSupportLink: process.env.REACT_APP_NEW_SUPPORT_LINK,
			appStoreIos: process.env.REACT_APP_STORE_IOS,
			appStoreAndroid: process.env.REACT_APP_STORE_ANDROID,
 			driftBotAppID: process.env.REACT_APP_DRIFT_BOT_APP_ID,
 			driftBotOrderConfirmationInteractionID: process.env.REACT_APP_DRIFT_BOT_ORDER_CONFIRMATION_INTERACTION_ID,
			cubeApiUrl: process.env.REACT_APP_CUBE_API_URL || "http://localhost:4000",
			defaultPageLimit: process.env.REACT_APP_DEFAULT_PAGE_LIMIT || 50,
			aboutLink: process.env.REACT_APP_ABOUT_URL,
			aboutChatLink: process.env.REACT_APP_ABOUT_CHAT_URL
			//TODO add all process.env variables here
		};
	}

	return settings;
};

export default settingsFactory;
