import React, { Component } from "react";
import { withStyles, Typography, Grid, Hidden } from "@material-ui/core";
import { observer } from "mobx-react/index";
import LandingAppBar from "../../../elements/header/LandingAppBar";
import user from "../../../../stores/user";
import SlugLandingHero from "./Hero";
import slugResults from "../../../../stores/slugResults";
import Loader from "../../../elements/loaders/Loader";
import AltResults from "../cards/AltResults";
import notifications from "../../../../stores/notifications";
import Meta from "./Meta";
import { fontFamilyDemiBold } from "../../../../config/theme";
import createGoogleMapsLink from "../../../../helpers/createGoogleMapsLink";

const styles = theme => ({
	root: {},
	heading: {
		color: "#2C3136",
		fontSize: "36px",
		fontFamily: fontFamilyDemiBold,
		lineHeight: "41px",
		marginTop: theme.spacing.unit * 5,
		marginBottom: theme.spacing.unit * 3,
		[theme.breakpoints.down("sm")]: {
			color: "#3C383F",
			fontSize: 18,
			letterSpacing: "-0.15px",
			lineHeight: "21px"
		}
	},
	cardContainer: {
		[theme.breakpoints.down("sm")]: {
			maxWidth: "100%",
			padding: theme.spacing.unit * 2
		}
	}
});

@observer
class SlugLanding extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pageTitle: ""
		};
	}

	componentWillMount() {
		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			const { id } = this.props.match.params;
			slugResults.refreshResults(
				id,
				() => {},
				() => {},
				message => {
					notifications.show({
						message,
						variant: "error"
					});
				}
			);
		} else {
			// 404 ....
			console.error("Could not find id");
		}
	}

	render() {
		const { history, classes } = this.props;
		const {
			type,
			events,
			meta = {},
			orgInfo,
			cityInfo,
			venueInfo,
			genre
		} = slugResults;
		let { title, description } = meta || {};
		const orgData = orgInfo || {};
		const cityData = cityInfo || {};
		const venueData = venueInfo || {};
		let metaTitle = "";
		let metaDescription = "";
		let heroTitle = "";
		let mapLink = null;
		let heroSubtitle = "";

		switch (type) {
			case "Organization":
				metaTitle = `Concert Tickets to ${orgData.name} in ${
					orgData.city
				} - Big Neon`;
				metaDescription = `Concert Tickets to ${orgData.name} in ${
					orgData.city
				} - Find tickets to live events and concerts on Big Neon.`;
				heroTitle = orgData.name;
				title = `Upcoming Events at ${orgData.name}`;
				description = "";
				break;
			case "City":
				metaTitle = `Concert Tickets in ${cityData.city} - Big Neon`;
				metaDescription = `Concert Tickets in ${
					cityData.city
				} - Find tickets to live events and concerts on Big Neon.`;
				heroTitle = cityData.city;
				title = `Upcoming Events in ${cityData.city}`;
				description = "";
				break;
			case "Venue":
				metaTitle = `Concert Tickets to ${venueData.name} in ${
					venueData.city
				} - Big Neon`;
				metaDescription = `Concert Tickets to ${venueData.name} in ${
					venueData.city
				} - Find tickets to live events and concerts on Big Neon.`;
				heroTitle = venueData.name;
				title = `Upcoming Events at ${venueData.name}`;
				description = "";
				heroSubtitle = `${venueData.address}, ${venueData.city}, ${
					venueData.state
				}, ${venueData.postal_code}`;
				mapLink = createGoogleMapsLink(venueData);
				break;
			case "Genre":
				metaTitle = `Concert Tickets for ${genre} - Big Neon`;
				metaDescription = `Concert Tickets for ${genre} - Find tickets to live events and concerts on Big Neon.`;
				heroTitle = genre;
				title = title || `Upcoming Events for ${genre}`;
				break;
		}

		return (
			<div className={classes.root}>
				<Meta title={metaTitle} description={metaDescription}/>
				<Hidden smDown>
					<LandingAppBar
						isAuthenticated={user.isAuthenticated}
						history={history}
					/>
				</Hidden>

				{!slugResults.isLoading && (
					<SlugLandingHero
						pageTitle={heroTitle}
						history={history}
						mapLink={mapLink ? mapLink : null}
						pageSubTitle={heroSubtitle ? heroSubtitle : null}
					/>
				)}

				<Grid
					container
					justify="center"
					style={{ maxWidth: 1400, margin: "0 auto" }}
				>
					<Grid item xs={12} sm={12} lg={12}>
						{slugResults.isLoading ? (
							<Loader>Finding events...</Loader>
						) : (
							<div className={classes.cardContainer}>
								<Typography variant={"title"} className={classes.heading}>
									{title}
								</Typography>
								<Typography variant={"body1"}>{description}</Typography>
								<AltResults/>
							</div>
						)}
					</Grid>
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(SlugLanding);
