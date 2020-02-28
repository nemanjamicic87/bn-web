import React, { Component } from "react";
import { Hidden, Typography, withStyles, Grid } from "@material-ui/core";
import { observer } from "mobx-react";
import PropTypes from "prop-types";
import Bigneon from "../../../../../../helpers/bigneon";
import ellipsis from "../../../../../../helpers/ellipsis";

import user from "../../../../../../stores/user";
import Container from "../Container";
import Loader from "../../../../../elements/loaders/Loader";
import notifications from "../../../../../../stores/notifications";
import Divider from "../../../../../common/Divider";
import {
	fontFamilyDemiBold,
	secondaryHex
} from "../../../../../../config/theme";
import SelectGroup from "../../../../../common/form/SelectGroup";
import moment from "moment-timezone";
import SearchBox from "../../../../../elements/SearchBox";
import OrderRow from "./OrderRow";
import { Pagination, urlPageParam } from "../../../../../elements/pagination";
import { TIME_FORMAT_MM_DD_YYYY_NO_TIMEZONE } from "../../../../../../helpers/time";

const styles = theme => ({
	root: {},

	pageSubTitle: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.75,
		textTransform: "uppercase",
		color: secondaryHex
	},
	pageTitle: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.75
	},
	mobilePageTitleContainer: {
		marginTop: theme.spacing.unit * 3,
		marginBottom: theme.spacing.unit * 2
	},
	desktopHeadingRow: {
		display: "flex",
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2
	},
	desktopHeadingText: { fontFamily: fontFamilyDemiBold }
});

const columnStyles = [
	{ flex: 2 },
	{ flex: 4 },
	{ flex: 8 },
	{ flex: 2 },
	{ flex: 3 },
	{ flex: 2 }
];

@observer
class OrderList extends Component {
	constructor(props) {
		super(props);

		this.eventId = this.props.match.params.id;

		this.state = {
			orders: null,
			promoCodes: [],
			promoFilterId: "",
			ticketTypes: [],
			ticketTypeFilterId: "",
			paging: null,
			ticketTypesKeyValue: {},
			eventName: null,
			salesStartStringUtc: null,
			venueTimeZone: null
		};

		this.onChangePromoFilter = this.onChangePromoFilter.bind(this);
		this.onChangeTicketTypeFilter = this.onChangeTicketTypeFilter.bind(this);
		this.onSearch = this.onSearch.bind(this);
	}

	componentDidMount() {
		const eventId = this.props.match.params.id;

		Bigneon()
			.events.read({ id: eventId })
			.then(response => {
				const { name, publish_date, venue } = response.data;
				this.setState({
					eventName: name,
					salesStartStringUtc: publish_date,
					venueTimeZone: venue.timezone
				});
				this.refreshOrders();
			})
			.catch(error => {
				console.error(error);
			});

		this.loadPromoCodes();
		this.loadTicketTypes();
	}

	refreshOrders(query = "", page = 0) {
		this.setState({ orders: null, paging: null });

		const params = { event_id: this.eventId, query, page, limit: 20 };

		const { promoFilterId, ticketTypeFilterId } = this.state;
		if (promoFilterId) {
			params.promo_code = promoFilterId;
		}

		if (ticketTypeFilterId) {
			params.ticket_type_id = ticketTypeFilterId;
		}

		Bigneon()
			.admin.orders(params)
			.then(response => {
				const { data, paging } = response.data;
				const { venueTimeZone } = this.state;
				//Set the qty of tickets bought and the formatted date
				data.forEach(o => {
					const { paid_at: paidAt, date: orderDate } = o;
					let orderDisplayDate = paidAt ? paidAt : orderDate;
					orderDisplayDate = orderDisplayDate ?
						moment
							.utc(orderDisplayDate)
							.tz(venueTimeZone)
							.format(TIME_FORMAT_MM_DD_YYYY_NO_TIMEZONE)
						: null;

					o.displayDate = orderDisplayDate;
					o.ticketCount = 0;
					o.ticketTypeIds = [];
					o.items.forEach(
						({ item_type, quantity, ticket_type_id, ...rest }) => {
							if (item_type === "Tickets") {
								o.ticketCount += quantity;
								o.ticketTypeIds.push(ticket_type_id);
							}
						}
					);
					o.platform = o.is_box_office ? "Box office" : o.platform || "-";
				});

				this.setState({ orders: data, paging });
			})
			.catch(error => {
				console.error(error);

				notifications.showFromErrorResponse({
					defaultMessage: "Loading orders failed.",
					error
				});
			});
	}

	onSearch(query) {
		this.query = query;
		this.refreshOrders(query);
	}

	changePage(page = urlPageParam()) {
		this.refreshOrders(this.query || "", page);
	}

	loadPromoCodes() {
		const promoCodes = [
			{
				value: "none",
				label: "Clear filter"
			}
		];

		Bigneon()
			.events.codes.index({ event_id: this.eventId })
			.then(response => {
				const codes = response.data.data;
				codes.forEach(c => {
					promoCodes.push({ value: c.redemption_codes[0], label: c.name });
				});

				this.setState({ promoCodes });
			});
	}

	loadTicketTypes() {
		const ticketTypes = [
			{
				value: "none",
				label: "Clear filter"
			}
		];

		const ticketTypesKeyValue = {};

		Bigneon()
			.events.ticketTypes.index({ event_id: this.eventId })
			.then(response => {
				const types = response.data.data;

				types.forEach(t => {
					ticketTypes.push({ value: t.id, label: t.name });
					ticketTypesKeyValue[t.id] = t.name;
				});

				this.setState({ ticketTypes, ticketTypesKeyValue });
			});
	}

	onChangePromoFilter(e) {
		let id = e.target.value;

		if (id === "none") {
			id = "";
		}

		this.setState({ promoFilterId: id }, this.refreshOrders.bind(this));
	}

	onChangeTicketTypeFilter(e) {
		let id = e.target.value;

		if (id === "none") {
			id = "";
		}

		this.setState({ ticketTypeFilterId: id }, this.refreshOrders.bind(this));
	}

	renderDesktopHeadings() {
		const { classes } = this.props;
		const headings = [
			"Order #",
			"Date & Time",
			"Customer",
			"QTY",
			"Order value",
			"POS"
		];

		return (
			<div className={classes.desktopHeadingRow}>
				{headings.map((heading, index) => (
					<Typography
						key={index}
						className={classes.desktopHeadingText}
						style={columnStyles[index]}
					>
						{heading}
					</Typography>
				))}
			</div>
		);
	}

	renderPromoCodeFilter() {
		const { promoFilterId, promoCodes } = this.state;

		return (
			<SelectGroup
				value={promoFilterId}
				items={promoCodes}
				name={"promo-filter"}
				label={"Filter by promo"}
				onChange={this.onChangePromoFilter}
			/>
		);
	}

	renderTicketTypeFilter() {
		const { ticketTypeFilterId, ticketTypes } = this.state;

		return (
			<SelectGroup
				value={ticketTypeFilterId}
				items={ticketTypes}
				name={"ticket-type-filter"}
				label={"Filter by ticket type"}
				onChange={this.onChangeTicketTypeFilter}
			/>
		);
	}

	renderList() {
		const { orders, ticketTypesKeyValue } = this.state;

		if (orders === null) {
			return <Loader>Loading orders...</Loader>;
		}

		return (
			<div>
				<Hidden smDown>{this.renderDesktopHeadings()}</Hidden>
				{orders.map(({ ticketTypeIds, ...order }) => {
					const ticketTypeList = ticketTypeIds.map(ttId =>
						ticketTypesKeyValue[ttId]
							? ellipsis(ticketTypesKeyValue[ttId], 12)
							: null
					);

					return (
						<OrderRow
							key={order.id}
							eventId={this.eventId}
							columnStyles={columnStyles}
							ticketTypeList={ticketTypeList}
							{...order}
						/>
					);
				})}
			</div>
		);
	}

	renderDesktopContent() {
		const { classes } = this.props;

		return (
			<Container
				eventId={this.eventId}
				subheading={"orders"}
				layout={"childrenInsideCard"}
			>
				<Grid container spacing={24}>
					<Grid item sm={2} md={2} lg={2}>
						<Typography className={classes.pageSubTitle}>
							Order management
						</Typography>
						<Typography className={classes.pageTitle}>
							Orders
						</Typography>
					</Grid>
					<Grid item sm={3} md={3} lg={3}>
						{this.renderPromoCodeFilter()}
					</Grid>
					<Grid item sm={3} md={3} lg={3}>
						{this.renderTicketTypeFilter()}
					</Grid>
					<Grid item sm={4} md={4} lg={4} style={{ marginTop: 10 }}>
						<SearchBox
							placeholder="Search Order #, Name, Email, Ticket #"
							onSearch={this.onSearch}
						/>
					</Grid>
				</Grid>

				<Divider style={{ marginBottom: 40 }}/>

				{this.renderList()}
			</Container>
		);
	}

	renderMobileContent() {
		const { classes } = this.props;

		return (
			<Container
				eventId={this.eventId}
				subheading={"orders"}
				layout={"childrenOutsideNoCard"}
			>
				<div className={classes.mobilePageTitleContainer}>
					<Typography className={classes.pageSubTitle}>
						Order management
					</Typography>
					<Typography className={classes.pageTitle}>
						Orders
					</Typography>
				</div>

				<Grid container spacing={24}>
					<Grid item xs={6}>
						{this.renderPromoCodeFilter()}
					</Grid>
					<Grid item xs={6}>
						{this.renderTicketTypeFilter()}
					</Grid>
				</Grid>
				<SearchBox
					placeholder="Search Order #, Name, Email, Ticket #"
					onSearch={this.onSearch}
				/>

				{this.renderList()}
			</Container>
		);
	}

	render() {
		const { paging } = this.state;
		return (
			<React.Fragment>
				<Hidden smDown>{this.renderDesktopContent()}</Hidden>
				<Hidden mdUp>{this.renderMobileContent()}</Hidden>

				{paging !== null ? (
					<Pagination
						isLoading={false}
						paging={paging}
						onChange={this.changePage.bind(this)}
					/>
				) : (
					<div/>
				)}
			</React.Fragment>
		);
	}
}

OrderList.propTypes = {
	classes: PropTypes.object.isRequired,
	match: PropTypes.object.isRequired,
	timezone: PropTypes.string.isRequired
};

const Orders = observer(props => {
	const { currentOrgTimezone } = user;
	if (!currentOrgTimezone) {
		return <Loader>Loading organization details...</Loader>;
	}

	return <OrderList {...props} timezone={currentOrgTimezone}/>;
});

export default withStyles(styles)(Orders);
