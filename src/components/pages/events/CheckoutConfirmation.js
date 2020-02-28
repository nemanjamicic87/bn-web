import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Hidden from "@material-ui/core/Hidden";
import { observer } from "mobx-react";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import { Link, Redirect } from "react-router-dom";

import OrgAnalytics from "../../common/OrgAnalytics";
import CheckoutForm from "../../common/cart/CheckoutFormWrapper";
import Button from "../../elements/Button";
import Bigneon from "../../../helpers/bigneon";
import notifications from "../../../stores/notifications";
import selectedEvent from "../../../stores/selectedEvent";
import cart from "../../../stores/cart";
import user from "../../../stores/user";
import EventHeaderImage from "../../elements/event/EventHeaderImage";
import {
	fontFamilyDemiBold,
	primaryHex,
	secondaryHex,
	fontFamily
} from "../../../config/theme";
import EventDetailsOverlayCard from "../../elements/event/EventDetailsOverlayCard";
import Divider from "../../common/Divider";
import orders from "../../../stores/orders";
import tickets from "../../../stores/tickets";
import Meta from "./Meta";
import Loader from "../../elements/loaders/Loader";
import PrivateEventDialog from "./PrivateEventDialog";
import NotFound from "../../common/NotFound";
import TwoColumnLayout from "./TwoColumnLayout";
import EventDescriptionBody from "./EventDescriptionBody";
import analytics from "../../../helpers/analytics";
import getAllUrlParams from "../../../helpers/getAllUrlParams";
import FormattedAdditionalInfo from "./FormattedAdditionalInfo";
import getUrlParam from "../../../helpers/getUrlParam";
import removeURLParam from "../../../helpers/removeURLParam";

const styles = theme => ({
	root: {
		paddingBottom: theme.spacing.unit * 10
	},
	ticketLineEntry: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit
	},
	lintEntryTitle: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.9,
		textTransform: "uppercase"
	},
	lineEntryText: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.9,
		paddingRight: theme.spacing.unit / 2
	},
	ticketLineTotalContainer: {
		marginTop: theme.spacing.unit * 3,
		marginBottom: theme.spacing.unit
	},
	subTotal: {
		fontFamily: fontFamily,
		fontSize: theme.typography.fontSize * 0.9
	},
	cartExpiry: {
		color: primaryHex,
		marginTop: theme.spacing.unit * 2,
		textAlign: "center"
	},
	backLink: {
		color: secondaryHex,
		fontFamily: fontFamilyDemiBold
	},
	mobileContainer: {
		background: "#FFFFFF",
		padding: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 10
	},
	desktopContent: {
		backgroundColor: "#FFFFFF"
	},
	desktopCardContent: {
		padding: theme.spacing.unit * 2
	}
});

const TicketLineEntry = ({ col1, col2, col3, classes }) => (
	<Grid alignItems="center" container className={classes.ticketLineEntry}>
		<Grid item xs={6} sm={6} md={6} lg={6}>
			<Typography className={classes.lineEntryText}>{col1}</Typography>
		</Grid>
		<Grid item xs={3} sm={3} md={3} lg={3}>
			<Typography
				className={classes.lineEntryText}
				style={{ textAlign: "right" }}
			>
				{col2}
			</Typography>
		</Grid>
		<Grid item xs={3} sm={3} md={3} lg={3}>
			<Typography
				className={classes.lineEntryText}
				style={{ textAlign: "right" }}
			>
				{col3}
			</Typography>
		</Grid>
	</Grid>
);

const TicketLineTotal = ({ col1, col2, col3, classes }) => (
	<Grid alignItems="center" container>
		<Grid item xs={6} sm={6} md={6} lg={6}>
			<Typography className={classes.lineEntryText}>{col1}</Typography>
		</Grid>
		<Grid item xs={4} sm={4} md={4} lg={4}>
			<Typography
				className={classes.lineEntryText}
				style={{ textAlign: "right" }}
			>
				{col2}
			</Typography>
		</Grid>
		<Grid item xs={2} sm={2} md={2} lg={2}>
			<Typography
				className={classes.lineEntryText}
				style={{ textAlign: "right" }}
			>
				{col3}
			</Typography>
		</Grid>
	</Grid>
);

@observer
class CheckoutConfirmation extends Component {
	constructor(props) {
		super(props);

		this.state = {
			overlayCardHeight: 600
		};
	}

	componentDidMount() {
		cart.refreshCart();

		//TODO
		//https://github.com/big-neon/bn-web/issues/408

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

			this.checkForAbandonedCart(order_id);
		} else {
			//TODO return 404
		}
	}

	checkForAbandonedCart(id) {
		if (!id) {
			return;
		}

		Bigneon()
			.cart.duplicate({
				id
			})
			.then(response => {
				removeURLParam("order_id", window.location.search);
			})
			.catch(error => {
				notifications.showFromErrorResponse({
					defaultMessage: "Could not restore abandoned cart.",
					error
				});
				console.error(error);
			});
	}

	onFreeCheckout() {
		const cartItems = cart.ticketCount;

		Bigneon()
			.cart.checkout({
				amount: 0,
				method: {
					type: "Free"
				},
				tracking_data: {
					...user.getCampaignTrackingData(),
					...getAllUrlParams()
				}
			})
			.then(response => {
				const { data } = response;
				const { history } = this.props;
				const { id, event } = selectedEvent;
				const { slug } = event;
				analytics.purchaseCompleted(
					event.id,
					{ ...user.getCampaignTrackingData(), ...getAllUrlParams() },
					"USD",
					cartItems,
					0
				);
				cart.refreshCart();
				orders.refreshOrders();
				tickets.refreshTickets();
				user.clearCampaignTrackingData();

				if (id) {
					//If they're checking out for a specific event then we have a custom success page for them
					history.push(
						`/tickets/${slug}/tickets/success${window.location.search ||
							"?"}&order_id=${data.id}`
					);
				} else {
					history.push(`/`); //TODO go straight to tickets when route is available
				}
			})
			.catch(error => {
				notifications.showFromErrorResponse({
					defaultMessage: "Checkout failed.",
					error
				});
				console.error(error);
			});
	}

	onCheckout(paymentMethod, provider, stripeToken, onError) {
		let method = {
			type: paymentMethod,
			provider: provider
		};

		if (provider === "Stripe") {
			method = {
				...method,
				token: stripeToken.id,
				save_payment_method: false,
				set_default: false
			};
		}

		const cartItems = [];
		for (let i = 0; i < cart.items.length; i++) {
			if (cart.items[i].item_type === "Tickets") {
				cartItems.push({
					eventId: event.id,
					name: event.name,
					category: event.event_type,
					organizationId: event.organization_id,
					ticketTypeName: cart.items[i].description,
					price: cart.items[i].unit_price_in_cents / 100,
					quantity: cart.items[i].quantity
				});
			}
		}
		const total = cart.total_in_cents / 100;

		Bigneon()
			.cart.checkout({
				method: method,
				tracking_data: {
					...user.getCampaignTrackingData(),
					...getAllUrlParams()
				}
			})
			.then(response => {
				const { data } = response;
				if (data.status !== "Paid" && data.checkout_url) {
					window.location = data.checkout_url;
					return;
				}

				const { history } = this.props;
				const { id, event } = selectedEvent;
				const { slug } = event;
				analytics.purchaseCompleted(
					event.id,
					{ ...user.getCampaignTrackingData(), ...getAllUrlParams() },
					"USD",
					cartItems,
					total
				);

				cart.refreshCart();
				orders.refreshOrders();
				tickets.refreshTickets();
				user.clearCampaignTrackingData();

				if (id) {
					//If they're checking out for a specific event then we have a custom success page for them
					history.push(
						`/tickets/${slug}/tickets/success${window.location.search ||
							"?"}&order_id=${data.id}`
					);
				} else {
					history.push(`/`); //TODO go straight to tickets when route is available
				}
			})
			.catch(error => {
				notifications.showFromErrorResponse({
					defaultMessage: "Checkout failed.",
					error
				});
				console.error(error);
				onError();
			});
	}

	onOverlayCardHeightChange(overlayCardHeight) {
		this.setState({ overlayCardHeight });
	}

	renderTickets() {
		const { classes } = this.props;
		const { cartSummary } = cart;

		if (!cartSummary) {
			return null;
		}

		const { ticketItemList } = cartSummary;

		return ticketItemList.map(item => {
			const {
				id,
				item_type,
				pricePerTicketInCents,
				quantity,
				description
			} = item;

			if (!quantity || item_type === "Fees") {
				return null;
			}

			return (
				<div key={id}>
					<TicketLineEntry
						col1={`${quantity} x ${description}`}
						col2={`$ ${(pricePerTicketInCents / 100).toFixed(2)}`}
						col3={`$ ${((pricePerTicketInCents / 100) * quantity).toFixed(2)}`}
						classes={classes}
					/>
					<Divider/>
				</div>
			);
		});
	}

	renderTotals() {
		const { classes } = this.props;
		const { id } = selectedEvent;
		const { cartSummary } = cart;

		if (!cartSummary) {
			return null;
		}

		const { orderTotalInCents, serviceFeesInCents } = cartSummary;

		return (
			<div>
				<div className={classes.ticketLineTotalContainer}>
					<TicketLineTotal
						col1={(
							<Link to={`/tickets/${id}/tickets${window.location.search}`}>
								<span className={classes.backLink}>Change tickets</span>
							</Link>
						)}
						col2={<span className={classes.subTotal}>Service fees:</span>}
						col3={`$${(serviceFeesInCents / 100).toFixed(2)}`}
						classes={classes}
					/>

					<TicketLineTotal
						col1={null}
						col2={<span className={classes.subTotal}>Order total:</span>}
						col3={`$${(orderTotalInCents / 100).toFixed(2)}`}
						classes={classes}
					/>
				</div>
				<Divider/>
			</div>
		);
	}

	render() {
		const { classes } = this.props;

		const { cartSummary, formattedExpiryTime, cartExpired } = cart;

		const { event, artists, id, venue, organization } = selectedEvent;
		const eventIsCancelled = !!(event && event.cancelled_at);

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

		if (event.is_external) {
			return <Redirect to={`/events/${id}`}/>;
		}

		const {
			promo_image_url,
			organization_id,
			additional_info,
			displayDoorTime,
			displayShowTime,
			tracking_keys
		} = event;

		let cryptoIcons;
		//FIXME remove hardcoded org ID.
		//waiting on api to return these https://github.com/big-neon/bn-api/issues/1092
		if (organization_id === "714e776e-9934-492a-b844-332fef381db8") {
			cryptoIcons = ["crypto/LTC.png"];
		}

		// if (cartExpired) {
		// 	return (
		// 		<Redirect to={`/tickets/${id}/tickets${window.location.search}`}/>
		// 	);
		// }

		const sharedContent = (
			<div>
				<TicketLineEntry
					key={id}
					col1={<span className={classes.lintEntryTitle}>Ticket</span>}
					col2={<span className={classes.lintEntryTitle}>Price</span>}
					col3={<span className={classes.lintEntryTitle}>Subtotal</span>}
					classes={classes}
				/>

				{this.renderTickets()}
				{this.renderTotals()}

				{user.isAuthenticated && cartSummary ? (
					<div>
						{cartSummary.orderTotalInCents > 0 ? (
							<CheckoutForm
								cryptoIcons={cryptoIcons}
								onSubmit={this.onCheckout.bind(this)}
								allowedPaymentMethods={cart.allowed_payment_methods}
							/>
						) : (
							<Button
								disabled={eventIsCancelled}
								variant="callToAction"
								style={{ width: "100%" }}
								onClick={this.onFreeCheckout.bind(this)}
							>
								Complete
							</Button>
						)}
						{formattedExpiryTime ? (
							<Typography className={classes.cartExpiry}>
								Cart expires in {formattedExpiryTime}
							</Typography>
						) : null}
					</div>
				) : null}
			</div>
		);

		//On mobile we need to move the description and artist details down. But we don't know how much space the overlayed div will take.
		const { overlayCardHeight } = this.state;
		const overlayCardHeightAdjustment = overlayCardHeight - 250;

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
					type={"checkout"}
				/>

				{/*DESKTOP*/}
				<Hidden smDown>
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
								imageSrc={promo_image_url}
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
					<div className={classes.mobileContainer}>{sharedContent}</div>
				</Hidden>
			</div>
		);
	}
}

CheckoutConfirmation.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CheckoutConfirmation);
