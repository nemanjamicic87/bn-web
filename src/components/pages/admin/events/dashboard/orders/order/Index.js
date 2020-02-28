import React, { Component } from "react";
import { Hidden, Typography, withStyles, Grid } from "@material-ui/core";
import { observer } from "mobx-react";
import PropTypes from "prop-types";

import user from "../../../../../../../stores/user";
import Loader from "../../../../../../elements/loaders/Loader";
import Card from "../../../../../../elements/Card";
import Bigneon from "../../../../../../../helpers/bigneon";
import moment from "moment-timezone";
import notifications from "../../../../../../../stores/notifications";
import Divider from "../../../../../../common/Divider";
import OrderItems from "./OrderItems";
import Header from "./Header";
import BackLink from "../../../../../../elements/BackLink";
import CreateNote from "./CreateNote";
import { fontFamilyDemiBold } from "../../../../../../../config/theme";
import RelatedOrders from "./RelatedOrders";
import OrderHistory from "./OrderHistory";
import { TIME_FORMAT_FULL_DESCRIPTION } from "../../../../../../../helpers/time";

const styles = theme => ({
	root: {
		padding: 31,
		paddingLeft: 65,
		paddingRight: 65
	},
	heading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: 20,
		textDecoration: "capitalize",
		marginTop: 20,
		marginBottom: 10
	}
});

class SingleOrder extends Component {
	constructor(props) {
		super(props);

		this.defaultState = {
			eventDetails: null,
			order: null,
			orderItems: null,
			orderHistory: null,
			showMobileTicketsView: false
		};

		this.state = {
			...this.defaultState,
			eventId: this.props.match.params.eventId,
			orderId: this.props.match.params.orderId,
			eventName: null,
			salesStartStringUtc: null,
			venueTimeZone: null
		};

		this.refreshOrder = this.loadAll.bind(this);
		this.loadOrderHistory = this.loadOrderHistory.bind(this);
	}

	componentDidMount() {
		this.loadAll();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		//If the event ID or order ID changes, reload the data
		const { eventId, orderId } = this.state;

		if (
			this.props.match.params.eventId !== eventId ||
			this.props.match.params.orderId !== orderId
		) {
			this.setState(
				{
					...this.defaultState,
					orderId: this.props.match.params.orderId,
					eventId: this.props.match.params.eventId
				},
				this.loadAll.bind(this)
			);
		}
	}

	async loadAll() {
		await this.loadOrder();
		await this.loadEventDetails();

		this.loadOrderItems();
		this.loadOrderHistory();
	}

	loadEventDetails() {
		const { eventId } = this.state;
		return new Promise((resolve, reject) => {
			Bigneon()
				.events.read({ id: eventId })
				.then(response => {
					const { data } = response;

					const { event_start, name, publish_date, venue } = data;

					const displayDate = moment
						.utc(event_start)
						.tz(venue.timezone)
						.format(TIME_FORMAT_FULL_DESCRIPTION);

					this.setState({
						eventName: name,
						salesStartStringUtc: publish_date,
						venueTimeZone: venue.timezone,
						eventDetails: { ...data, displayDate }
					});
					user.setCurrentOrganizationRolesAndScopes(data.organization_id);
					resolve();
				})
				.catch(error => {
					console.error(error);

					notifications.showFromErrorResponse({
						defaultMessage: "Loading event details failed.",
						error
					});
					reject();
				});
		});

	}

	loadOrder() {
		const { orderId, eventId } = this.state;
		const { timezone } = this.props;

		return new Promise((resolve, reject) => {
			Bigneon()
				.orders.read({ id: orderId })
				.then(response => {
					const { data } = response;
					const { is_box_office, items } = data;

					//Orders can only be linked to a single event currently. This would need to change if we allow multiple events on a single order.
					const orderEventId = [...new Set(items.map(i => i.event_id))].pop();
					if (orderEventId && orderEventId !== eventId) {
						//The event id in the url is from another event that is not related to this order, override it.
						this.props.match.params.eventId = orderEventId;
						this.setState({ eventId: orderEventId });
					}
					const platform = is_box_office ? "Box office" : data.platform || "";

					let fees_in_cents = 0;
					items.forEach(({ item_type, unit_price_in_cents, quantity }) => {
						//Only include fee type items
						if (
							["CreditCardFees", "PerUnitFees", "EventFees"].indexOf(
								item_type
							) > -1
						) {
							fees_in_cents += unit_price_in_cents * quantity;
						}
					});

					this.setState({
						order: { ...data, platform, fees_in_cents }
					});
					resolve();
				})
				.catch(error => {
					console.error(error);

					notifications.showFromErrorResponse({
						defaultMessage: "Loading order failed.",
						error
					});
					reject(error);
				});
		});

	}

	loadOrderItems() {
		const { orderId } = this.state;

		Bigneon()
			.orders.details({ id: orderId })
			.then(response => {
				const { data } = response;

				this.setState({ orderItems: data.items });
			})
			.catch(error => {
				console.error(error);

				notifications.showFromErrorResponse({
					defaultMessage: "Loading order details failed.",
					error
				});
			});
	}

	loadOrderHistory() {
		const { timezone } = this.props;
		const { orderId } = this.state;

		Bigneon()
			.orders.activity(
				{
					id: orderId
				},
				{},
				false,
				{ minTimeout: 120000 }
			)
			.then(response => {
				const { data } = response.data;

				const { venueTimeZone } = this.state;

				const orderHistory = data.map(item => {
					const { occurred_at, paid_at } = item;
					const date = paid_at ? paid_at : occurred_at;
					const occurredAt = date
						? moment
							.utc(date)
						    .tz(venueTimeZone)
							.format("llll")
						: "-";

					return { ...item, occurredAt };
				});

				this.setState({
					orderHistory
				});
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to load order history."
				});
			});
	}

	toggleMobileTicketsView() {
		this.setState(({ showMobileTicketsView }) => {
			return { showMobileTicketsView: !showMobileTicketsView };
		});
	}

	render() {
		const {
			order,
			orderItems,
			eventDetails,
			orderHistory,
			showMobileTicketsView,
			eventId,
			venueTimeZone
		} = this.state;
		const { classes, timezone, organizationId } = this.props;

		const isReady = order && eventDetails && orderItems;

		const header = isReady ? <Header {...order} timezone={venueTimeZone}/> : null;

		const orderDetails = isReady ? (
			<OrderItems
				eventDetails={eventDetails}
				order={order}
				items={orderItems}
				refreshOrder={this.refreshOrder}
				toggleMobileTicketsView={this.toggleMobileTicketsView.bind(this)}
				showMobileTicketsView={showMobileTicketsView}
				timezone={venueTimeZone || timezone}
			/>
		) : null;

		if (showMobileTicketsView) {
			return (
				<React.Fragment>
					<BackLink onClick={this.toggleMobileTicketsView.bind(this)}>
						Back to order
					</BackLink>
					{orderDetails}
				</React.Fragment>
			);
		}

		return (
			<React.Fragment>
				<BackLink to={`/admin/events/${eventId}/dashboard/orders/manage`}>
					Back to sales
				</BackLink>

				{!isReady ? <Loader/> : null}

				{/*DESKTOP*/}
				<Hidden smDown>
					{isReady ? (
						<Card className={classes.root}>
							{header}
							<Divider style={{ marginTop: 20, marginBottom: 20 }}/>
							{orderDetails}
						</Card>
					) : null}
				</Hidden>

				{/*MOBILE*/}
				<Hidden mdUp>
					{header}
					{orderDetails}
				</Hidden>

				{isReady ? (
					<React.Fragment>
						<Typography className={classes.heading}>Order history</Typography>
						{orderHistory ? (
							<OrderHistory
								orderHistory={orderHistory}
								userId={
									order.on_behalf_of_user_id
										? order.on_behalf_of_user_id
										: order.user_id
								}
								eventDetails={eventDetails}
							/>
						) : (
							<Loader>Loading history...</Loader>
						)}

						<Typography className={classes.heading}>Add note</Typography>
						<CreateNote orderId={order.id} onSuccess={this.loadOrderHistory}/>

						<Typography className={classes.heading}>Related orders</Typography>
						<RelatedOrders
							eventId={eventId}
							organizationId={organizationId}
							timezone={timezone}
							user={
								order.on_behalf_of_user ? order.on_behalf_of_user : order.user
							}
							eventId={eventDetails.id}
							orderId={order.id}
						/>
					</React.Fragment>
				) : null}
			</React.Fragment>
		);
	}
}

SingleOrder.propTypes = {
	classes: PropTypes.object.isRequired,
	match: PropTypes.object.isRequired,
	timezone: PropTypes.string.isRequired,
	organizationId: PropTypes.string.isRequired
};

const Index = observer(props => {
	const { currentOrgTimezone, currentOrganizationId } = user;

	if (!currentOrgTimezone) {
		return <Loader>Loading organization details...</Loader>;
	}

	return (
		<SingleOrder
			{...props}
			timezone={currentOrgTimezone}
			organizationId={currentOrganizationId}
		/>
	);
});

export default withStyles(styles)(Index);
