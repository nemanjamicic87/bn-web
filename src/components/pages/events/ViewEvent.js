import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import Hidden from "@material-ui/core/Hidden";

import Button from "../../elements/Button";
import OrgAnalytics from "../../common/OrgAnalytics";
import Divider from "../../common/Divider";
import notifications from "../../../stores/notifications";
import selectedEvent from "../../../stores/selectedEvent";
import EventHeaderImage from "../../elements/event/EventHeaderImage";
import servedImage from "../../../helpers/imagePathHelper";
import {
	fontFamilyBold,
	secondaryHex,
	textColorPrimary
} from "../../../config/theme";
import EventDetailsOverlayCard from "../../elements/event/EventDetailsOverlayCard";
import nl2br from "../../../helpers/nl2br";
import Meta from "./Meta";
import Loader from "../../elements/loaders/Loader";
import PrivateEventDialog from "./PrivateEventDialog";
import { displayAgeLimit } from "../../../helpers/ageLimit";
import NotFound from "../../common/NotFound";
import MaintainAspectRatio from "../../elements/MaintainAspectRatio";
import optimizedImageUrl from "../../../helpers/optimizedImageUrl";
import ellipsis from "../../../helpers/ellipsis";
import { dollars } from "../../../helpers/money";
import MobileBottomBarCTA from "./MobileBottomBarCTA";
import SupportingArtistsLabel from "./SupportingArtistsLabel";
import TwoColumnLayout from "./TwoColumnLayout";
import EventDescriptionBody from "./EventDescriptionBody";
import addressLineSplit from "../../../helpers/addressLineSplit";
import layout from "../../../stores/layout";
import Settings from "../../../config/settings";
import EventCallToActionAppBar from "../../elements/header/EventCallToActionAppBar";
import user from "../../../stores/user";
import { insertScript } from "../../../helpers/insertScript";
import replaceIdWithSlug from "../../../helpers/replaceIdWithSlug";
import analytics from "../../../helpers/analytics";
import getAllUrlParams from "../../../helpers/getAllUrlParams";
import LinkifyReact from "linkifyjs/react";
import FormattedAdditionalInfo from "./FormattedAdditionalInfo";
import EventDetail from "./EventDetail";
import Grid from "@material-ui/core/Grid";
import ArtistSummary from "../../elements/event/ArtistSummary";

const styles = theme => {
	return {
		root: {},
		desktopContent: {
			backgroundColor: "#FFFFFF"
		},
		mobileHeaderImage: {
			height: "100%",
			width: "100%",
			backgroundImage: "linear-gradient(255deg, #e53d96, #5491cc)",
			backgroundRepeat: "no-repeat",
			backgroundSize: "cover",
			backgroundPosition: "center"
		},
		cardTopLineInfo: {
			fontFamily: fontFamilyBold,
			textTransform: "uppercase",
			color: "#979797",
			fontSize: theme.typography.fontSize * 0.875,
			marginBottom: 5
		},
		cardArtists: {
			fontFamily: fontFamilyBold,
			color: "#979797",
			marginBottom: theme.spacing.unit * 2
		},
		desktopCardContent: {
			padding: theme.spacing.unit * 2
		},
		mobileContainer: {
			background: "#FFFFFF",
			padding: theme.spacing.unit * 2,
			paddingBottom: 0
		},
		mobileEventName: {
			fontFamily: fontFamilyBold,
			fontSize: theme.typography.fontSize * 1.565,
			lineHeight: 1,
			color: "#3C383F"
		},
		spacer: {
			marginTop: theme.spacing.unit * 4
		},
		callToActionContainer: {
			marginTop: theme.spacing.unit,
			marginBottom: theme.spacing.unit
		},
		callToAction: {
			width: "100%"
		},
		plainWhite: {
			width: "100%",
			color: "#000000 !important",
			backgroundColor: "#E9E9E9",
			opacity: 1,
			"& span": {
				fontFamily: "TTCommons-DemiBold"
			}
		},
		eventDetailsRow: {
			display: "flex"
		},
		iconContainer: {
			flex: 1
		},
		icon: {
			width: 22,
			height: "auto"
		},
		eventDetailContainer: {
			paddingTop: 4,
			flex: 6
		},
		eventDetailText: {
			color: "#3C383F"
		},
		eventDetailBoldText: {
			font: "inherit",
			fontFamily: fontFamilyBold
		},
		eventDetailLinkText: {
			font: "inherit",
			color: secondaryHex,
			cursor: "pointer"
		},
		divider: {
			marginTop: theme.spacing.unit,
			marginBottom: theme.spacing.unit * 4
		},
		artistsContainer: {
			paddingTop: theme.spacing.unit * 5
		},
		artistsPerforming: {
			marginBottom: 30,
			marginTop: 0
		},
		dividerMobile: {
			marginTop: 30,
			marginBottom: 30,
			[theme.breakpoints.up("md")]: {
				display: "none"
			}
		}
	};
};

@observer
class ViewEvent extends Component {
	constructor(props) {
		super(props);

		this.state = {
			overlayCardHeight: 600
		};
	}

	componentDidMount() {
		// layout.toggleBelowFooterPadding(true);

		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			const { id } = this.props.match.params;

			selectedEvent.refreshResult(
				id,
				errorMessage => {
					notifications.show({
						message: errorMessage,
						variant: "error"
					});
				},
				() => {
					const {
						id: selectedEventId,
						slug,
						organization_id: organizationId,
						name,
						event_type
					} = selectedEvent.event;

					//Replace the id in the URL with the slug if we have it and it isn't currently set
					if (id === selectedEventId && slug) {
						replaceIdWithSlug(id, slug);
					}

					analytics.viewContent(
						[selectedEventId],
						getAllUrlParams(),
						name,
						selectedEvent.organization.id,
						event_type
					);
					if (user.isAuthenticated) {
						const { organizations } = user;
						if (organizations.hasOwnProperty(organizationId)) {
							user.setCurrentOrganizationRolesAndScopes(organizationId, false);
						}
					}
				}
			);
		} else {
			//TODO return 404
		}
	}

	componentWillUnmount() {
		// layout.toggleBelowFooterPadding(false);
	}

	// toggleUserInterest() {
	// 	if (!user.isAuthenticated) {
	// 		//Show dialog for the user to signup/login, try again when they're authenticated
	// 		user.showAuthRequiredDialog(this.toggleUserInterest.bind(this));
	// 		return;
	// 	}
	//
	// 	selectedEvent.toggleUserInterest();
	// }
	//
	// renderInterestedButton() {
	// 	if (!selectedEvent) {
	// 		return null;
	// 	}
	//
	// 	const { id, user_is_interested } = selectedEvent;
	//
	// 	if (user_is_interested === null) {
	// 		//Unknown
	// 		return null;
	// 	}
	//
	// 	return (
	// 		<Button
	// 			style={{ width: "100%", marginTop: 10 }}
	// 			variant={user_is_interested ? "default" : "primary"}
	// 			onClick={this.toggleUserInterest.bind(this)}
	// 		>
	// 			{user_is_interested ? "I'm not interested" : "I'm interested"}
	// 		</Button>
	// 	);
	// }

	get callToActionButtonDetails() {
		const { event, hasAvailableTickets } = selectedEvent;

		//TODO check why api is returning null for 'override_status' when it should be 'UseAccessCode'
		// if (hasAvailableTickets === false && !event.is_external) {
		// 	return { ctaText: "No available tickets", enabled: false };
		// }
		const eventIsCancelled = !!(event && event.cancelled_at);
		if (eventIsCancelled) {
			return { ctaText: "Cancelled", enabled: false };
		}
		switch (event.override_status) {
			case "SoldOut":
				return {
					ctaText: "Sold Out",
					enabled: event.is_external ? false : true
				};
			case "OnSaleSoon":
				return {
					ctaText: "On Sale Soon",
					enabled: event.is_external ? false : true
				};
			case "TicketsAtTheDoor":
				return {
					ctaText: "Tickets At The Door",
					enabled: event.is_external ? false : true
				};
			case "UseAccessCode":
				return { ctaText: "Use Access Code", enabled: true };
			case "Free":
				return { ctaText: "Free", enabled: true };
			case "Rescheduled":
				return { ctaText: "Rescheduled", enabled: false };
			case "Cancelled":
				return { ctaText: "Cancelled", enabled: false };
			case "OffSale":
				return { ctaText: "Off-Sale", enabled: false };
			case "Ended":
				return { ctaText: "Sale Ended", enabled: false };
			case "PurchaseTickets":
			default:
				// if (hasAvailableTickets === false && !event.is_external) {
				// 	return { ctaText: "No available tickets", enabled: false };
				// } else {
				return {
					ctaText: "Purchase Tickets",
					enabled: true
				};
			//}
		}
	}

	renderCallToActionButton(variant = "callToAction") {
		const { classes } = this.props;
		const { event, id } = selectedEvent;
		const { is_external, external_url } = event;

		const { ctaText, enabled } = this.callToActionButtonDetails;

		if (!enabled) {
			return (
				<Button disabled className={classes.callToAction}>
					{ctaText}
				</Button>
			);
		}
		if (is_external) {
			return (
				<a href={external_url} target="_blank">
					<Button className={classes.callToAction} variant={variant}>
						{ctaText}
					</Button>
				</a>
			);
		} else {
			return (
				<Link to={`/tickets/${id}/tickets${window.location.search}`}>
					<Button
						size={"mediumLarge"}
						className={classes.callToAction}
						variant={variant}
						title={ctaText}
					>
						{ctaText}
					</Button>
				</Link>
			);
		}
	}

	onOverlayCardHeightChange(overlayCardHeight) {
		this.setState({ overlayCardHeight });
	}

	priceTagText(min, max, separator = "to") {
		if ((min === null || isNaN(min)) && (max === null || isNaN(max))) {
			return null;
		}

		if (min === null || isNaN(min)) {
			return dollars(max, true);
		}

		if (max === null || isNaN(max) || min === max) {
			return dollars(min, true);
		}

		return `${dollars(min, true)} ${separator} ${dollars(max, true)}`;
	}

	render() {
		const { classes } = this.props;
		const {
			event,
			venue,
			artists,
			organization,
			id,
			ticket_types,
			hasAvailableTickets
		} = selectedEvent;
		if (event === null) {
			return (
				<div>
					<PrivateEventDialog/>
					<Loader style={{ height: 400 }}/>
				</div>
			);
		}

		if (event === false) {
			return <NotFound>Event not found.</NotFound>;
		}

		const {
			name,
			displayEventStartDate,
			additional_info,
			top_line_info,
			age_limit,
			displayDoorTime,
			displayShowTime,
			eventStartDateMoment,
			is_external,
			tracking_keys,
			external_url,
			min_ticket_price,
			max_ticket_price,
			status,
			original_promo_image_url
		} = event;
		const eventIsCancelled = !!(event && event.cancelled_at);

		const promo_image_url = event.promo_image_url
			? optimizedImageUrl(event.promo_image_url)
			: null;
		const fixed_width_promo_image_url = original_promo_image_url ? optimizedImageUrl(original_promo_image_url, "low", { w: 430 }) : null;

		const ageLimitText = displayAgeLimit(age_limit);

		const mobilePromoImageStyle = {};
		if (fixed_width_promo_image_url) {
			mobilePromoImageStyle.backgroundImage = `url(${fixed_width_promo_image_url})`;
		}

		const priceTagText = this.priceTagText(min_ticket_price, max_ticket_price);

		const { enabled } = this.callToActionButtonDetails;

		const sharedContent = (
			<div>
				<div className={classes.callToActionContainer}>
					{status === "Closed" ? (
						<Button
							size={"mediumLarge"}
							className={classes.plainWhite}
							variant={"text"}
							title={"This event is now over 😢"}
							disabled={true}
						>
							This event is now over 😢
						</Button>
					) : this.renderCallToActionButton()}
				</div>

				<div className={classes.spacer}/>

				<EventDetail classes={classes} iconUrl={"/icons/events-black.svg"}>
					<Typography className={classes.eventDetailText}>
						<span className={classes.eventDetailBoldText}>
							{displayEventStartDate}
						</span>
						<br/>
						Doors {displayDoorTime} - Show {displayShowTime}
						<br/>
						{ageLimitText}
					</Typography>
				</EventDetail>

				{priceTagText ? (
					<div>
						<Divider className={classes.divider}/>

						<EventDetail classes={classes} iconUrl={"/icons/ticket-black.svg"}>
							<Typography className={classes.eventDetailText}>
								Tickets from {priceTagText}
							</Typography>
						</EventDetail>
					</div>
				) : null}

				<Divider className={classes.divider}/>

				<EventDetail classes={classes} iconUrl={"/icons/location-black.svg"}>
					<Typography className={classes.eventDetailText}>
						{venue.name}
						<br/>
						{addressLineSplit(venue.address)}
						<br/>
						{venue.city}, {venue.state}
					</Typography>
					{venue.googleMapsLink ? (
						<a target="_blank" href={venue.googleMapsLink}>
							<span className={classes.eventDetailLinkText}>View map</span>
						</a>
					) : null}
					<br/>
					<br/>
					<Typography className={classes.eventDetailText}>
						More Events at{" "}
						<Link to={`/venues/${venue.slug}`}>
							<span className={classes.eventDetailLinkText}>{venue.name}</span>{" "}
						</Link>
					</Typography>
					{venue.city_slug ? (
						<Typography className={classes.eventDetailText}>
							More Events in{" "}
							<Link to={`/cities/${venue.city_slug}`}>
								<span className={classes.eventDetailLinkText}>
									{venue.city}
								</span>
							</Link>
						</Typography>
					) : null}
				</EventDetail>
			</div>
		);

		//Need to move the description and artist details down and adjust the height of the main container. But we don't know how much space the overlayed div will take.
		const overlayCardHeightAdjustment = this.state.overlayCardHeight - 150;

		const options = {
			nl2br: true,
			className: classes.eventDescriptionLink
		};

		return (
			<div className={classes.root}>
				<OrgAnalytics trackingKeys={tracking_keys}/>
				<Meta
					{...event}
					venue={venue}
					artists={artists}
					additional_info={additional_info}
					organization={organization}
					doorTime={displayDoorTime}
					showTime={displayShowTime}
					type={"eventView"}
				/>

				{/*DESKTOP*/}
				<Hidden smDown>
					{enabled ? (
						<EventCallToActionAppBar
							isAuthenticated={user.isAuthenticated}
							venue={venue}
							{...event}
							promo_image_url={fixed_width_promo_image_url}
							ctaButton={this.renderCallToActionButton("secondary")}
						/>
					) : null}

					<EventHeaderImage
						{...event}
						artists={artists}
						organization={organization}
						venue={venue}
					/>

					<TwoColumnLayout
						containerClass={classes.desktopContent}
						containerStyle={{ minHeight: overlayCardHeightAdjustment }}
						col1={(
							<EventDescriptionBody
								eventIsCancelled={eventIsCancelled}
								organization={organization}
								artists={artists}
							>
								<FormattedAdditionalInfo>
									{additional_info}
								</FormattedAdditionalInfo>
							</EventDescriptionBody>
						)}
						col2={(
							<EventDetailsOverlayCard
								style={{
									width: "100%",
									top: -310,
									position: "relative"
								}}
								imageSrc={original_promo_image_url || promo_image_url}
								artists={artists}
								onHeightChange={this.onOverlayCardHeightChange.bind(this)}
							>
								<div className={classes.desktopCardContent}>
									{sharedContent}
								</div>
							</EventDetailsOverlayCard>
						)}
					/>
				</Hidden>

				{/*MOBILE*/}
				<Hidden mdUp>
					<MaintainAspectRatio aspectRatio={Settings().promoImageAspectRatio}>
						<div
							className={classes.mobileHeaderImage}
							style={mobilePromoImageStyle}
						/>
					</MaintainAspectRatio>
					<div className={classes.mobileContainer}>
						{top_line_info ? (
							<Typography className={classes.cardTopLineInfo}>
								{nl2br(top_line_info)}
							</Typography>
						) : null}

						<Typography
							variant={"display1"}
							className={classes.mobileEventName}
						>
							{name}
						</Typography>

						{artists && artists.length !== 0 ? (
							<Typography className={classes.cardArtists}>
								<SupportingArtistsLabel eventName={name} artists={artists}/>
							</Typography>
						) : null}

						{sharedContent}

						<Divider className={classes.divider}/>

						{additional_info ? (
							<div>
								<EventDetail
									classes={classes}
									iconUrl={"/icons/event-detail-black.svg"}
								>
									<FormattedAdditionalInfo>
										{additional_info}
									</FormattedAdditionalInfo>
								</EventDetail>

								{/*<Divider*/}
								{/*	className={classes.divider}*/}
								{/*	style={{ marginBottom: 0 }}*/}
								{/*/>*/}
							</div>
						) : null}

						{artists && artists.length !== 0 ? (
							<Grid
								className={classes.artistsContainer}
								container
								direction="row"
								justify="flex-start"
								alignItems="flex-start"
							>
								<Grid item xs={12} style={{ paddingBottom: 0, paddingTop: 0 }}>
									<h4 className={classes.artistsPerforming}>
										Artists Performing
									</h4>
								</Grid>
								{artists.map(({ artist, importance }, index) => (
									<Grid item xs={12} key={index}>
										<ArtistSummary headliner={importance === 0} {...artist}/>
										<Divider className={classes.divider}/>
									</Grid>
								))}
							</Grid>
						) : null}
					</div>

					<MobileBottomBarCTA
						button={this.renderCallToActionButton()}
						priceRange={this.priceTagText(
							min_ticket_price,
							max_ticket_price,
							"-"
						)}
					/>
				</Hidden>
			</div>
		);
	}
}

ViewEvent.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ViewEvent);
