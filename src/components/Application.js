import Routes from "./routes/Routes";
import React from "react";
import { Helmet } from "react-helmet";
import { bindReactNativeMessageBridge } from "../helpers/reactNative";

const Application = () => (
	<React.Fragment>
		<Helmet>
			{process.env.NODE_ENV !== "production" ? (
				<meta name="robots" content="noindex"/>
			) : null}
		</Helmet>
		<Routes/>
	</React.Fragment>
);
bindReactNativeMessageBridge(function(event) {

});

export default Application;
