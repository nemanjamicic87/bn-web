import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import moment from "moment-timezone";
import { Link } from "react-router-dom";
import classNames from "classnames";
import Card from "../Card";
import { fontFamilyDemiBold, secondaryHex } from "../../../config/theme";
import MaintainAspectRatio from "../MaintainAspectRatio";
import optimizedImageUrl from "../../../helpers/optimizedImageUrl";
import Settings from "../../../config/settings";
import getPhoneOS from "../../../helpers/getPhoneOS";
import HoldRow from "../../pages/admin/events/dashboard/holds/children/ChildRow";
import analytics from "../../../helpers/analytics";
import stateToAbbr from "../../../helpers/stateToAbbr";
import lowerCaseTime from "../../../helpers/lowerCaseTime";

const styles = theme => ({
	card: {
		maxWidth: 450,
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.07)"
	},
	media: {
		height: "100%",
		width: "100%",
		backgroundImage: "linear-gradient(255deg, #e53d96, #5491cc)",
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "center",

		padding: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit,
		display: "flex",
		justifyContent: "flex-end",
		alignItems: "flex-start",
		flexDirection: "column"
	},
	name: {
		marginTop: theme.spacing.unit,
		color: "#000000",
		fontFamily: fontFamilyDemiBold,
		fontSize: 21,
		lineHeight: "21px",
		textAlign: "left",
		lineClamp: 2,
		display: "-webkit-box",
		WebkitLineClamp: 3,
		WebkitBoxOrient: "vertical",
		overflow: "hidden",
		height: 42,
		textOverflow: "ellipsis"
	},
	abbr: {
		textDecoration: "none",
		marginTop: theme.spacing.unit,
		color: "#000000",
		fontFamily: fontFamilyDemiBold,
		fontSize: 21,
		lineHeight: "21px",
		borderBottom: "none",
		height: 42
	},
	detailsContent: {
		// height: 105,
		display: "flex",
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2,
		paddingTop: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit
	},
	singleDetail: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		justifyContent: "center"
	},
	label: {
		fontSize: theme.typography.fontSize,
		textTransform: "uppercase",
		color: "#cccfd9"
	},
	date: {
		color: secondaryHex,
		fontSize: theme.typography.fontSize,
		fontWeight: 600,
		lineHeight: "18px"
	},
	value: {
		fontSize: theme.typography.fontSize,
		color: "#9DA3B4",
		fontWeight: 500
	},
	addressHolder: {
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2,
		paddingTop: 0,
		paddingBottom: theme.spacing.unit * 2
	},
	priceTag: {
		backgroundColor: "#fff4fb",
		padding: "6px 6px 4px 6px",
		borderRadius: "6px 6px 6px 0",
		marginBottom: theme.spacing.unit
	},
	priceTagText: {
		color: secondaryHex,
		fontFamily: fontFamilyDemiBold,
		lineHeight: "17px",
		fontSize: 17
	},
	hoverCard: {
		"&:hover": {
			boxShadow: "5px 5px 5px 0 rgba(0,0,0,0.15)",
			transition: "box-shadow .3s ease-out"
		},
		boxShadow: "none",
		transition: "box-shadow .3s ease-in",
		maxWidth: 400
	},
	noHover: {
		transition: "box-shadow .3s ease-out",
		maxWidth: 400,
		[theme.breakpoints.down("sm")]: {
			maxWidth: "90vw"
		}
	}
});

const PriceTag = ({ classes, min, max }) => {
	if (!min || !max) {
		return null;
	}

	const minDollars = Math.round(min / 100);
	const maxDollars = Math.round(max / 100);
	let text = `$${minDollars} - $${maxDollars}`;

	if (min === max) {
		text = `$${minDollars}`;
	}

	return (
		<div className={classes.priceTag}>
			<Typography className={classes.priceTagText}>{text}</Typography>
		</div>
	);
};

class EventResultCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			hoverId: null
		};
	}

	trackClick() {
		const {
			id,
			name,
			event_type,
			organization_id,
			position,
			list
		} = this.props;
		analytics.eventClick(id, name, event_type, organization_id, position, list);
	}

	render() {
		const {
			classes,
			id,
			name,
			promo_image_url,
			original_promo_image_url,
			event_start,
			venueName,
			city,
			state,
			door_time,
			min_ticket_price,
			max_ticket_price,
			venueTimezone,
			slug
		} = this.props;
		const { hoverId } = this.state;

		const style = {};
		if (original_promo_image_url || promo_image_url) {
			style.backgroundImage = `url(${optimizedImageUrl(
				original_promo_image_url || promo_image_url,
				"low",
				{ w: 430 }
			)})`;
		}

		const newVenueTimezone = venueTimezone || "America/Los_Angeles";
		const eventStartDateMoment = moment.utc(event_start);

		const displayEventStartDate = eventStartDateMoment
			.tz(newVenueTimezone)
			.format("MMM D");
		const displayShowTime = lowerCaseTime(
			moment(eventStartDateMoment)
				.tz(newVenueTimezone)
				.format("ddd, h:mmA")
		);

		return (
			<Link
				onMouseEnter={e => this.setState({ hoverId: id })}
				onMouseLeave={e => this.setState({ hoverId: null })}
				to={`/tickets/${slug || id}`}
				onClick={this.trackClick.bind(this)}
				// to={`/events/${slug || id}`}
			>
				<Card
					className={classNames({
						[classes.noHover]: true,
						[classes.hoverCard]: hoverId === id
					})}
					borderLess
					variant="default"
				>
					<MaintainAspectRatio aspectRatio={Settings().promoImageAspectRatio}>
						<div className={classes.media} style={style}/>
					</MaintainAspectRatio>
					<div className={classes.detailsContent}>
						<div className={classes.singleDetail} style={{ textAlign: "left" }}>
							<Typography className={classes.value}>
								<span className={classes.date}>{displayEventStartDate}</span>{" "}
								&middot; {displayShowTime}
							</Typography>
							<Typography
								className={classNames({
									[classes.name]: true
								})}
							>
								<abbr className={classes.abbr} title={name}>
									{name}
								</abbr>
							</Typography>
						</div>
						{/*<div style={{ textAlign: "right" }}>*/}
						{/*	<PriceTag*/}
						{/*		min={min_ticket_price}*/}
						{/*		max={max_ticket_price}*/}
						{/*		classes={classes}*/}
						{/*	/>*/}
						{/*</div>*/}
					</div>
					<div className={classes.addressHolder}>
						<Typography className={classes.value}>
							{venueName}
							{city ? `, ${city}` : null}
							{state ? `, ${stateToAbbr(state, "abbr")}` : null}
						</Typography>
					</div>
				</Card>
			</Link>
		);
	}
}

EventResultCard.propTypes = {
	id: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	promo_image_url: PropTypes.string,
	event_start: PropTypes.string.isRequired,
	door_time: PropTypes.string.isRequired,
	min_ticket_price: PropTypes.number.isRequired,
	max_ticket_price: PropTypes.number.isRequired,
	venueTimezone: PropTypes.string
};

export default withStyles(styles)(EventResultCard);
