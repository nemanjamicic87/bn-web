import React, { Component } from "react";
import { Dialog, Typography, withStyles } from "@material-ui/core";
import { observer } from "mobx-react";
import PropTypes from "prop-types";
import Hidden from "@material-ui/core/Hidden";
import Slide from "@material-ui/core/Slide";
import CustomButton from "../../elements/Button";
import notifications from "../../../stores/notifications";
import selectedEvent from "../../../stores/selectedEvent";
import cart from "../../../stores/cart";
import EventDetailsOverlayCard from "../../elements/event/EventDetailsOverlayCard";
import {
	fontFamily,
	fontFamilyBold,
	fontFamilyDemiBold,
	secondaryHex
} from "../../../config/theme";
import Meta from "./Meta";
import Loader from "../../elements/loaders/Loader";
import PrivateEventDialog from "./PrivateEventDialog";
import NotFound from "../../common/NotFound";
import TwoColumnLayout from "./TwoColumnLayout";
import Divider from "../../common/Divider";
import user from "../../../stores/user";
import getUrlParam from "../../../helpers/getUrlParam";
import getPhoneOS from "../../../helpers/getPhoneOS";
import servedImage from "../../../helpers/imagePathHelper";
import OrgAnalytics from "../../common/OrgAnalytics";
import Bigneon from "../../../helpers/bigneon";
import moment from "moment-timezone";
import Settings from "../../../config/settings";
import classNames from "classnames";
import PurchaseDetails from "./PurchaseDetails";
import Hero from "./SuccessHero";
import removeCountryFromAddress from "../../../helpers/removeCountryFromAddress";
import { loadDrift } from "../../../helpers/drift";

const heroHeight = 586;

const iPhone5MediaQuery = "@media (max-width:321px)";

const styles = theme => {
	return {
		root: {
			backgroundColor: "#FFFFFF"
		},
		mobileContent: {
			// flex: 1,
			paddingTop: 40,
			flexDirection: "column",
			background: "linear-gradient(180deg, #9C2D82 0%, #3965A6 40%)",
			display: "flex"
		},
		mobileTopContent: {
			// flex: 1,
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			alignItems: "center",
			minHeight: "70vh",
			paddingLeft: 22,
			paddingRight: 22,
			[iPhone5MediaQuery]: {
				paddingLeft: 16,
				paddingRight: 16
			}
		},
		mobileHeaderRow: {
			height: 50,
			display: "flex",
			justifyContent: "space-between",
			alignItems: "flex-end",
			paddingLeft: 22,
			paddingRight: 22,
			[iPhone5MediaQuery]: {
				paddingLeft: 16,
				paddingRight: 16
			}
		},
		mobileHeaderIcon: {
			width: 18,
			height: "auto"
		},
		mobilePopupCard: {
			backgroundColor: "#FFFFFF",
			borderRadius: "15px 15px 0 0",
			paddingTop: 35,
			paddingBottom: 20,
			textAlign: "left",
			paddingLeft: 22,
			paddingRight: 22,
			[iPhone5MediaQuery]: {
				paddingLeft: 16,
				paddingRight: 16
			},
			[theme.breakpoints.down("md")]: {
				marginTop: theme.spacing.unit * 2
			}
		},
		mobileSuccessHeading: {
			fontSize: 22,
			color: "#FFFFFF",
			lineHeight: 1,
			fontFamily: fontFamilyDemiBold,
			[iPhone5MediaQuery]: {
				fontSize: theme.typography.fontSize * 1.5
			}
		},
		mobileSuccessText: {
			marginTop: 8,
			fontSize: theme.typography.fontSize * 1.065,
			color: "#FFFFFF"
		},
		desktopHeroContent: {
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			paddingBottom: theme.spacing.unit * 2,
			height: heroHeight
		},
		desktopEventPromoImg: {
			height: "140px",
			width: "273px",
			borderRadius: "3px",
			backgroundImage: "linear-gradient(255deg, #e53d96, #5491cc)",
			backgroundRepeat: "no-repeat",
			backgroundSize: "cover",
			OBackgroundSize: "cover",
			MozBackgroundSize: "cover",
			WebkitBackgroundSize: "cover",
			boxShadow: "0 4px 15px 2px rgba(0,0,0,0.15)",
			backgroundPosition: "center",
			[theme.breakpoints.down("md")]: {
				height: 170,
				width: 332
			}
		},
		downloadBtn: {
			width: 140,
			height: 47
		},
		desktopCardContent: {
			paddingRight: theme.spacing.unit * 4,
			paddingLeft: theme.spacing.unit * 4,
			textAlign: "center"
		},
		mobileCardContent: {
			paddingRight: theme.spacing.unit,
			paddingLeft: theme.spacing.unit,
			textAlign: "center"
		},
		desktopCoverImage: {
			height: heroHeight,
			width: "100%",
			backgroundRepeat: "no-repeat",
			backgroundSize: "cover",
			backgroundPosition: "center",
			position: "absolute",
			marginBottom: theme.spacing.unit * 2,
			background: "linear-gradient(180deg, #9C2D82 0%, #3965A6 100%)"
		},
		desktopHeroTopLine: {
			color: "#FFFFFF",
			fontSize: 26,
			lineHeight: "30px",
			fontFamily: fontFamilyBold
		},
		desktopHeroOrderTag: {
			marginTop: theme.spacing.unit * 2,
			marginBottom: theme.spacing.unit * 2,
			color: "#FFFFFF",
			fontSize: 15,
			lineHeight: "23px",
			fontFamily: fontFamily
		},
		desktopOverlayCardHeader: {
			background: "linear-gradient(-135deg, #9C2D82 0%, #3965A6 100%)",
			height: 167,
			padding: theme.spacing.unit,
			paddingLeft: 65,
			paddingRight: 65,
			display: "flex",
			alignItems: "center",
			[theme.breakpoints.down("md")]: {
				paddingLeft: 25,
				paddingRight: 25
			}
		},
		desktopEventDetailText: {
			color: "#FFFFFF",
			fontSize: 15,
			lineHeight: "18px",
			[theme.breakpoints.down("md")]: {
				textAlign: "center"
			}
		},
		boldText: {
			fontFamily: fontFamilyDemiBold,
			fontSize: 17,
			lineHeight: "21px"
		},
		desktopSuccessTitle: {
			fontFamily: fontFamilyDemiBold,
			fontSize: theme.typography.fontSize * 1.75,
			color: "#FFFFFF",
			lineHeight: 1,
			[theme.breakpoints.down("md")]: {
				fontSize: theme.typography.fontSize * 1.52
			}
		},
		desktopFooterText: {
			color: "#3C383F",
			fontSize: 17,
			lineHeight: "20px",
			marginTop: 10,
			fontFamily: fontFamilyDemiBold
		},
		desktopFooterTextTitle: {
			marginBottom: 15
		},
		fakeList: {
			color: "#3C383F",
			fontSize: 17,
			lineHeight: "20px",
			fontFamily: fontFamilyDemiBold,
			maxWidth: 220,
			display: "flex",
			margin: "0 auto",
			textAlign: "left"
		},
		desktopCardFooterContainer: {
			// padding: 10,
			// paddingRight: 10,
			// paddingLeft: 10,
			textAlign: "center",
			[theme.breakpoints.down("md")]: {
				textAlign: "left"
			}
		},
		greyTitleBold: {
			color: "#8885B8",
			textTransform: "uppercase",
			fontFamily: fontFamilyBold,
			fontSize: 15,
			marginTop: "25px",
			lineHeight: "18px",
			[theme.breakpoints.down("md")]: {
				fontSize: 14,
				fontFamily: fontFamilyDemiBold,
				lineHeight: "16px"
			}
		},
		greyTitleDemiBold: {
			color: "#3C383F",
			textTransform: "uppercase",
			fontFamily: fontFamilyDemiBold,
			marginBottom: theme.spacing.unit,
			fontSize: 15,
			lineHeight: "18px",
			opacity: "0.6",
			[theme.breakpoints.down("md")]: {
				fontSize: 14,
				lineHeight: "16px",
				marginBottom: 4
			}
		},
		iconText: {
			display: "flex",
			flexDirection: "column",
			alignItems: "flex-start",
			marginLeft: theme.spacing.unit * 6,
			marginBottom: 25,
			[theme.breakpoints.down("md")]: {
				marginLeft: 0,
				marginBottom: theme.spacing.unit * 2
			}
		},
		iconHolder: {
			width: 26,
			marginRight: theme.spacing.unit * 2,
			flexDirection: "column",
			alignItems: "center",
			display: "flex"
		},
		icon: {
			maxWidth: 24,
			marginRight: 10
		},
		heartLogo: {
			height: 55,
			width: 53,
			marginTop: 25,
			marginBottom: 25
		},
		cardLargeText: {
			color: "#3C383F",
			fontSize: 24,
			fontFamily: fontFamilyBold,
			lineHeight: "28px",
			[theme.breakpoints.down("md")]: {
				fontSize: 22,
				fontFamily: fontFamilyBold,
				lineHeight: "24px"
			}
		},
		cardMedText: {
			color: "#3C383F",
			fontSize: 18,
			fontFamily: fontFamilyBold,
			lineHeight: "21px",
			marginTop: 0,
			marginBottom: 25
		},
		btnContainer: {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-around",
			maxWidth: 330,
			margin: "25px auto 25px auto"
		},
		purchaseInfoBlock: {
			padding: theme.spacing.unit * 4,
			maxWidth: 796,
			borderRadius: 10,
			backgroundColor: "rgba(89,83,155,0.05)",
			display: "flex",
			flexDirection: "column",
			margin: "0 auto"
		},
		purchaseInfo: {
			display: "flex",
			flexDirection: "row",
			justifyContent: "space-between"
		},
		purchaseText: {
			color: "#000",
			fontSize: 15,
			lineHeight: "18px"
		},
		purchaseTicketText: {
			color: "#3C383F",
			fontSize: 17,
			lineHeight: "19px",
			fontFamily: fontFamilyDemiBold,
			textAlign: "right",
			[theme.breakpoints.down("md")]: {
				textAlign: "left"
			}
		},
		divider: {
			height: 1,
			width: "100%",
			opacity: "0.2",
			backgroundColor: "rgba(0,0,0,0.75)",
			marginTop: 25,
			marginBottom: 25
		},
		leftColumn: {
			display: "flex",
			width: "45%"
		},
		rightColumn: {
			display: "flex",
			flexDirection: "row",
			justifyContent: "space-between",
			width: "55%"
		},
		orderTotalTitle: {
			color: "#3C383F",
			fontSize: 17,
			fontFamily: fontFamilyBold,
			lineHeight: "19px",
			textTransform: "uppercase"
		},
		orderTotalValue: {
			color: "#3C383F",
			fontSize: 24,
			fontFamily: fontFamilyDemiBold,
			lineHeight: "24px"
		},
		mobiBoldOrder: {
			color: "#6A7C94",
			fontSize: 17,
			fontFamily: fontFamilyBold,
			lineHeight: "19px"
		},
		plainGreyText: {
			opacity: "0.4",
			color: "#3C383F",
			fontSize: 16,
			lineHeight: "23px",
			margin: "25px auto 0 auto",
			textAlign: "center"
		},
		questionsText: {
			fontSize: 17,
			color: "#3C383F",
			fontFamily: fontFamilyDemiBold,
			lineHeight: "19px",
			maxWidth: 420,
			textAlign: "center",
			margin: "-90px auto 30px auto",
			[theme.breakpoints.down("md")]: {
				marginTop: theme.spacing.unit * 3,
				textAlign: "center",
				marginBottom: theme.spacing.unit * 3
			}
		},
		pinkSpan: {
			color: secondaryHex,
			fontSize: 17,
			fontFamily: fontFamilyDemiBold,
			textDecoration: "none",
			lineHeight: "19px"
		}
	};
};

@observer
class CheckoutSuccess extends Component {
	constructor(props) {
		super(props);

		this.state = {
			mobileDialogOpen: true,
			mobileCardSlideIn: true,
			order_id: null,
			appId: null,
			interactionId: null,
			order: null,
			phoneOS: getPhoneOS()
		};
	}

	componentDidMount() {
		this.setState(
			{
				appId: Settings().driftBotAppID,
				interactionId: Settings().driftBotOrderConfirmationInteractionID
			},
			() => {
				const { appId, interactionId } = this.state;
				if (appId && interactionId) {
					loadDrift(appId, () => {
						window.driftt.api.startInteraction({
							interactionId: Number(interactionId),
							goToConversation: true
						});
					});
				}
			}
		);
		cart.emptyCart(); //TODO move this to after they've submitted the final form

		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			const { id } = this.props.match.params;

			selectedEvent.refreshResult(id, errorMessage => {
				notifications.show({
					message: errorMessage,
					variant: "error"
				});
			});

			const order_id = getUrlParam("order_id");

			if (order_id) {
				this.setState({ order_id }, () => {
					this.getOrderInformation();
				});
			}
		} else {
			//TODO return 404
		}
	}

	getOrderInformation() {
		const { order_id } = this.state;

		Bigneon()
			.orders.read({ id: order_id })
			.then(response => {
				const { data } = response;
				const { is_box_office, items } = data;
				const platform = is_box_office ? "Box office" : data.platform || "";

				let fees_in_cents = 0;
				items.forEach(({ item_type, unit_price_in_cents, quantity }) => {
					//Only include fee type items
					if (
						["CreditCardFees", "PerUnitFees", "EventFees"].indexOf(item_type) >
						-1
					) {
						fees_in_cents += unit_price_in_cents * quantity;
					}
				});

				this.setState({
					order: { ...data, platform, fees_in_cents }
				});
			})
			.catch(error => {
				console.error(error);

				notifications.showFromErrorResponse({
					defaultMessage: "Loading order failed.",
					error
				});
			});
	}

	goHome() {
		this.setState({ mobileCardSlideIn: false }, () => {
			setTimeout(() => {
				this.setState({ mobileDialogOpen: false }, () => {
					setTimeout(() => {
						this.props.history.push("/");
					}, 80);
				});
			}, 200);
		});
	}

	render() {
		const { classes } = this.props;
		const { event, venue, artists, organization } = selectedEvent;
		const firstName = user.firstName;
		const {
			mobileDialogOpen,
			mobileCardSlideIn,
			order,
			order_id,
			phoneOS,
			appId
		} = this.state;
		if (event === null || order === null) {
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
			displayEventStartDate,
			additional_info,
			promo_image_url,
			displayDoorTime,
			displayShowTime,
			eventStartDateMoment,
			tracking_keys
		} = event;

		const eventDateFormatted = moment
			.utc(eventStartDateMoment)
			.tz(venue.timezone)
			.format("llll z");

		const ticketItem = order.items.filter(item => item.item_type === "Tickets");
		const promoImageStyle = {};
		if (promo_image_url) {
			promoImageStyle.backgroundImage = `url(${promo_image_url})`;
		}
		let qty = 0;
		if (ticketItem.length > 0) {
			ticketItem.forEach(item => {
				qty = qty + item.quantity;
			});
		}
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
					type={"success"}
				/>

				{/*DESKTOP*/}
				<Hidden smDown>
					<div style={{ height: heroHeight * 1.2 }}>
						<Hero
							order_id={order_id}
							order={order}
							promoImg={promo_image_url}
							venue={venue}
							firstName={firstName}
							qty={qty}
							classes={classes}
							promoImgStyle={promoImageStyle}
							displayEventStartDate={eventDateFormatted}
							event={event}
						/>
						<TwoColumnLayout
							containerClass={classes.desktopHeroContent}
							containerStyle={{ minHeight: heroHeight }}
							col1={null}
							col2={(
								<EventDetailsOverlayCard
									style={{
										minWidth: "390px",
										position: "relative"
									}}
								>
									<div>
										<div className={classes.desktopCardContent}>
											<img
												alt="Bigneon Logo"
												className={classes.heartLogo}
												src={servedImage(
													"/site/images/big-neon-heart-logo.png"
												)}
											/>
											<Typography className={classes.cardLargeText}>
												Get your tickets now by downloading the Big Neon App
											</Typography>
											<div className={classes.btnContainer}>
												<a href={Settings().appStoreIos} target="_blank">
													<img
														className={classes.downloadBtn}
														src={servedImage("/images/appstore-apple.png")}
														alt="App Store download button"
													/>
												</a>
												{/*<AppButton*/}
												{/*	color="pinkBackground"*/}
												{/*	variant="ios"*/}
												{/*	href={Settings().appStoreIos}*/}
												{/*	style={{ marginRight: 5 }}*/}
												{/*>*/}
												{/*	APP STORE*/}
												{/*</AppButton>*/}
												<a href={Settings().appStoreAndroid} target="_blank">
													<img
														className={classes.downloadBtn}
														src={servedImage(
															"/images/appstore-google-play.png"
														)}
														alt="Google Play download button"
													/>
												</a>
												{/*<AppButton*/}
												{/*	color="pinkBackground"*/}
												{/*	variant="android"*/}
												{/*	href={Settings().appStoreAndroid}*/}
												{/*	style={{ marginRight: 5 }}*/}
												{/*>*/}
												{/*	GOOGLE PLAY*/}
												{/*</AppButton>*/}
											</div>
											<Typography className={classes.cardMedText}>
												2 ways to get your tickets:
											</Typography>
											<Typography className={classes.fakeList}>
												1. Get the App (Quickest entry)
												<br/>
												2. Show your ID at the door
											</Typography>
										</div>

										<div className={classes.divider}/>

										<div className={classes.desktopCardFooterContainer}>
											<Typography
												className={classNames({
													[classes.desktopFooterText]: true,
													[classes.desktopFooterTextTitle]: true
												})}
											>
												With the Big Neon App you can:
											</Typography>
											<div className={classes.iconText}>
												<Typography className={classes.desktopFooterText}>
													<span className={classes.icon}>&#x1F46F;</span>
													Transfer tickets to friends
												</Typography>
												<Typography className={classes.desktopFooterText}>
													<span className={classes.icon}>&#x1F430;</span>
													Speed through the line
												</Typography>
												<Typography className={classes.desktopFooterText}>
													<span className={classes.icon}>&#x1F379;</span>
													Score presale access to events
												</Typography>
											</div>
										</div>
									</div>
								</EventDetailsOverlayCard>
							)}
						/>
					</div>
					<Typography className={classes.questionsText}>
						Any questions?&nbsp;
						<span>
							<a
								className={classes.pinkSpan}
								href={Settings().submitSupportLink}
							>
								Big Neon Customer Support
							</a>
						</span>
					</Typography>
					<PurchaseDetails
						displayEventStartDate={eventDateFormatted}
						order={order}
						event={event}
						venue={venue}
						classes={classes}
					/>
					<Typography className={classes.plainGreyText}>
						Receipt has been sent to {user.email}
					</Typography>
				</Hidden>

				{/*MOBILE*/}
				<Hidden mdUp>
					<div style={{ marginBottom: 500 }}/>
					<Dialog
						fullScreen
						aria-labelledby="dialog-title"
						onEntering={() => {
						}}
						onExiting={() => {
						}}
						open={mobileDialogOpen}
					>
						<div className={classes.mobileContent}>
							<div className={classes.mobileHeaderRow}>
								{/*TODO once my-events is mobile friendly redirect there?*/}
								<div onClick={this.goHome.bind(this)}>
									<img
										className={classes.mobileHeaderIcon}
										alt="close"
										src={servedImage("/icons/close-white.svg")}
									/>
								</div>
							</div>

							<div className={classes.mobileTopContent}>
								<Typography className={classes.mobileSuccessHeading}>
									{user.firstName},<br/>
									Your Big Neon order is confirmed!
								</Typography>
								<Typography className={classes.mobileSuccessText}>
									Order #{order.order_number} |&nbsp;{qty} Tickets
								</Typography>
								<br/>
								{promoImageStyle ? (
									<div
										className={classes.desktopEventPromoImg}
										style={promoImageStyle}
									/>
								) : null}

								<Typography className={classes.greyTitleBold}>Event</Typography>

								<Typography className={classes.desktopEventDetailText}>
									<span className={classes.boldText}>{event.name}</span>
									<br/>
									{displayEventStartDate}
								</Typography>

								<Typography className={classes.greyTitleBold}>
									Location
								</Typography>

								<Typography className={classes.desktopEventDetailText}>
									<span className={classes.boldText}>{venue.name}</span>
									<br/>
									{removeCountryFromAddress(venue.address)}
								</Typography>
							</div>
							<div>
								<Slide direction="up" in={mobileCardSlideIn}>
									<div className={classes.mobilePopupCard}>
										<div className={classes.mobileCardContent}>
											<Typography className={classes.cardLargeText}>
												Get your tickets now by downloading the Big Neon App
											</Typography>
											<div className={classes.btnContainer}>
												<a
													href={
														phoneOS === "ios"
															? Settings().appStoreIos
															: Settings().appStoreAndroid
													}
													target="_blank"
												>
													<CustomButton
														variant="secondary"
														style={{ width: "80vw" }}
													>
														DOWNLOAD THE BIG NEON APP
													</CustomButton>
												</a>
											</div>
										</div>

										<Divider/>

										<div className={classes.desktopCardFooterContainer}>
											<Typography className={classes.desktopFooterText}>
												With the Big Neon App you can:
											</Typography>
											<br/>
											<div className={classes.iconText}>
												<Typography className={classes.desktopFooterText}>
													<span className={classes.icon}>&#x1F46F;</span>
													Transfer tickets to friends
												</Typography>
												<Typography className={classes.desktopFooterText}>
													<span className={classes.icon}>&#x1F430;</span>
													Speed through the line
												</Typography>
												<Typography className={classes.desktopFooterText}>
													<span className={classes.icon}>&#x1F379;</span>
													Score presale access to events
												</Typography>
											</div>
										</div>
										<Divider/>

										<Typography className={classes.questionsText}>
											Any questions?&nbsp;
											<span>
												<a
													className={classes.pinkSpan}
													href={Settings().submitSupportLink}
												>
													Big Neon Customer Support
												</a>
											</span>
										</Typography>
										<PurchaseDetails
											displayEventStartDate={eventDateFormatted}
											order={order}
											event={event}
											venue={venue}
											classes={classes}
										/>
										<Typography className={classes.plainGreyText}>
											Receipt has been sent to {user.email}
										</Typography>
									</div>
								</Slide>
							</div>
						</div>
					</Dialog>
				</Hidden>
			</div>
		);
	}
}

CheckoutSuccess.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired
};

export default withStyles(styles)(CheckoutSuccess);
