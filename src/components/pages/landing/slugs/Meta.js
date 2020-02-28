import React from "react";
import { Helmet } from "react-helmet";
import Settings from "../../../../config/settings";

//Reference: https://github.com/nfl/react-helmet

const Meta = props => {
	const { title, description, slugUri } = props;

	const landingUrl = Settings().webUrl;
	const slugUrl = `${landingUrl}/${slugUri}`;
	return (
		<Helmet
			title={title}
			meta={[
				{
					property: "og:title",
					content: "Big Neon - The new standard in event ticketing"
				},
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: slugUrl },
				{
					property: "og:description",
					content:
						"Big Neon - Mobile-first event ticketing. We’re relentlessly focused on serving the needs of independent live music promoters."
				},
				{
					property: "og:image",
					content: `${landingUrl}/site/images/bigneon-screen-app.png`
				},
				{ name: "twitter:site", content: "bigneon.com" },
				{ name: "twitter:creator", content: "bigneon" },
				{
					name: "twitter:title",
					content: "Big Neon - The new standard in event ticketing"
				},
				{
					name: "twitter:image",
					content: `${landingUrl}/site/images/bigneon-screen-app.png`
				},
				{
					name: "description",
					content: description
				}
			]}
			link={[
				{ rel: "canonical", href: slugUrl },
				{
					rel: "image_src",
					href: `${landingUrl}/site/images/home-logo.png`
				}
			]}
		/>
	);
};

export default Meta;
