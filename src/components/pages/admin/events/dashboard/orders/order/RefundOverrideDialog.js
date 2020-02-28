import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import classnames from "classnames";

import Button from "../../../../../../elements/Button";
import Dialog from "../../../../../../elements/Dialog";
import notification from "../../../../../../../stores/notifications";
import Bigneon from "../../../../../../../helpers/bigneon";
import { dollars } from "../../../../../../../helpers/money";
import { Hidden, Typography } from "@material-ui/core";
import {
	fontFamilyDemiBold,
	secondaryHex
} from "../../../../../../../config/theme";
import SelectGroup from "../../../../../../common/form/SelectGroup";
import CheckBox from "../../../../../../elements/form/CheckBox";
import TicketCard from "./TicketCard";
import Divider from "../../../../../../common/Divider";

const styles = theme => ({
	content: {
		[theme.breakpoints.up("sm")]: {
			minWidth: 550
		}
	},
	successContent: {
		[theme.breakpoints.up("sm")]: {
			maxWidth: 400
		}
	},
	actionButtonsContainer: {
		display: "flex",
		justifyContent: "center",
		marginTop: 20
	},
	desktopOrderRow: {
		display: "flex",
		paddingLeft: 20,
		paddingRight: 20
	},
	desktopOrderRowBorder: {
		borderRadius: 6,
		border: "1px solid rgba(222, 226, 232, 0.56)",
		paddingTop: 20,
		paddingBottom: 20,
		marginTop: 10,
		marginBottom: 10
	},
	headingText: {
		color: "#939bad",
		fontSize: 14,
		fontFamily: fontFamilyDemiBold,
		textTransform: "uppercase",
		opacity: 0.7
	},
	desktopOrderDetailsContainer: {
		marginTop: 20
	},
	userText: {
		color: secondaryHex,
		fontFamily: fontFamilyDemiBold
	},
	subText: {
		color: "#8b94a7",
		fontSize: 14
	},
	formLabelText: {
		fontFamily: fontFamilyDemiBold,
		marginBottom: 8
	},
	refundAmountBox: {
		backgroundColor: "#f6f7f9",
		padding: 20,
		paddingBottom: 12,
		borderRadius: 8
	},
	refundAmountRow: {
		display: "flex",
		justifyContent: "space-between",
		marginBottom: 8
	},
	valueText: {
		fontFamily: fontFamilyDemiBold
	},
	valueTextActive: {
		color: secondaryHex
	},
	orderTotalRow: {
		backgroundColor: "#f6f7f9",
		display: "flex",
		justifyContent: "space-between",
		padding: 16,
		borderRadius: 8
	},
	orderTotalRowLabel: {
		fontFamily: fontFamilyDemiBold,
		fontSize: 14
	},
	orderTotalRowValue: {
		fontFamily: fontFamilyDemiBold,
		fontSize: 16,
		color: secondaryHex,
		textAlign: "right"
	},
	successDetailsRow: {
		marginTop: 20,
		display: "flex",
		justifyContent: "space-between"
	},
	userDetailsText: {
		fontFamily: fontFamilyDemiBold,
		color: secondaryHex
	},
	successRefundType: {
		color: "#8b94a7",
		fontSize: 14,
		textTransform: "uppercase"
	}
});

const refundReasons = [
	{
		value: "empty",
		label: "Select a reason",
		disabled: true
	},
	{
		value: "cancellation",
		label: "Cancellation/Postponement"
	},
	{
		value: "exchange",
		label: "Exchange/Upgrade"
	},
	{
		value: "overcart",
		label: "Overcart"
	},
	{
		value: "unable-to-attend",
		label: "Unable to attend"
	},
	{
		value: "fraud",
		label: "Fraud/Chargeback"
	},
	{
		value: "snad",
		label: "SNAD (significantly not as described)"
	},
	{
		value: "price",
		label: "Price discrepancy"
	},
	{
		value: "other",
		label: "Other"
	}
];

class RefundOverrideDialog extends Component {
	constructor(props) {
		super(props);

		this.defaultState = {
			reasonVal: "empty",
			selectedRefundType: "fullRefund",
			isRefunding: false,
			selectedRefundOrderItem: {},
			refundAmountInCents: 0,
			refundSuccessDetails: null
		};

		this.state = this.defaultState;

		this.onClose = this.onClose.bind(this);
	}

	static getDerivedStateFromProps(props, state) {
		const { selectedRefundOrderItem } = props;

		return { selectedRefundOrderItem };
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevProps.open === false && this.props.open === true) {
			this.setRefundAmount();
		}
	}

	toggleRefundOrderItem(index) {
		this.setState(({ selectedRefundOrderItem }) => {
			selectedRefundOrderItem[index] = !selectedRefundOrderItem[index];
			return { selectedRefundOrderItem };
		}, this.setRefundAmount.bind(this));
	}

	setRefundAmount() {
		const { items } = this.props;
		const { selectedRefundOrderItem } = this.state;

		let refundAmountInCents = 0;
		if (items) {
			items.forEach((item, index) => {
				if (selectedRefundOrderItem && selectedRefundOrderItem[index]) {
					const { total_price_in_cents } = item;
					refundAmountInCents += total_price_in_cents;
				}
			});
		}
		this.setState({ refundAmountInCents });
	}

	onClose() {
		const { onClose } = this.props;
		const { refundSuccessDetails } = this.state;
		onClose();

		if (refundSuccessDetails) {
			//Reset the dialog content just after it's finished hiding so the user doesn't notice
			setTimeout(() => this.setState(this.defaultState), 500);
		}
	}

	refund() {
		const { order, items: itemDetails, type } = this.props;

		const { id } = order;

		const { selectedRefundOrderItem } = this.state;

		//TODO use selectedRefundType to adjust which items should be refunded for type===full

		const items = [];

		if (itemDetails) {
			itemDetails.forEach((item, index) => {
				const { order_item_id, ticket_instance_id, refundable, ...rest } = item;
				if (refundable) {
					if (type === "full" || selectedRefundOrderItem[index]) {
						items.push({
							order_item_id,
							ticket_instance_id
						});
					}
				}
			});
		}

		this.setState({ isRefunding: true });
		const manual_override = true;
		Bigneon()
			.orders.refund({
				id,
				items,
				manual_override
			})
			.then(response => {
				const { amount_refunded, refund_breakdown } = response.data;

				this.props.onSuccess();
				this.setState({
					refundSuccessDetails: { amount_refunded, refund_breakdown }
				});
			})
			.catch(error => {
				notification.showFromErrorResponse({
					error,
					defaultMessage: "Refund failed."
				});
			})
			.finally(() => {
				this.setState({
					mobileOptionsControlOpen: false,
					isRefunding: false
				});
			});
	}

	renderSuccessContent() {
		const { classes, type, order } = this.props;
		const { refundSuccessDetails } = this.state;
		const { amount_refunded } = refundSuccessDetails;

		let userDetails = "";

		if (order && order.user) {
			const { first_name, last_name, email } = order.user;

			userDetails = `${first_name} ${last_name} (${email})`;
		}

		const refundTypeText = type === "full" ? "full refund" : "partial refund";

		return (
			<div className={classes.successContent}>
				<div className={classes.successDetailsRow}>
					<Typography className={classes.successRefundType}>
						{refundTypeText}
					</Typography>

					<Typography className={classes.orderTotalRowValue}>
						{dollars(amount_refunded)}
					</Typography>
				</div>

				<Divider/>

				<div style={{ textAlign: "center", marginTop: 20 }}>
					<Typography>
						The {refundTypeText} was sent to purchaser
						{userDetails ? (
							<span>
								{" "}
								- <span className={classes.userDetailsText}>{userDetails}</span>
							</span>
						) : null}
					</Typography>

					<Button
						variant={"secondary"}
						style={{ marginTop: 20 }}
						onClick={this.onClose}
					>
						Got it
					</Button>
				</div>
			</div>
		);
	}

	render() {
		const { classes, open, type } = this.props;
		const { isRefunding, refundSuccessDetails } = this.state;

		let title = `Refund ${type === "full" ? "full " : ""}Override`;
		if (refundSuccessDetails) {
			title = "Refund successful";
		}

		return (
			<Dialog open={open} title={title} onClose={this.onClose}>
				{refundSuccessDetails ? (
					this.renderSuccessContent()
				) : (
					<div className={classes.content}>
						<Typography align="center">
							<b>Are you sure you want to process the refund?</b>
							<br/>
							By processing a refund override, funds will not be returned to the
							original purchaser. Please ensure funds are returned to the
							customer from an alternate method. Tickets will be returned to
							sellable inventory. Reporting will be updated to reflect the
							refund.
						</Typography>
						<div className={classes.actionButtonsContainer}>
							<Button
								style={{ marginRight: 5, width: 150 }}
								variant="default"
								onClick={this.onClose}
							>
								Cancel
							</Button>
							<Button
								style={{ marginLeft: 5, width: 150 }}
								variant="secondary"
								disabled={isRefunding}
								onClick={this.refund.bind(this)}
							>
								{isRefunding ? "Refunding..." : "Confirm"}
							</Button>
						</div>
					</div>
				)}
			</Dialog>
		);
	}
}

RefundOverrideDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onSuccess: PropTypes.func.isRequired,
	items: PropTypes.array.isRequired,
	order: PropTypes.object.isRequired,
	selectedRefundOrderItem: PropTypes.object,
	type: PropTypes.oneOf(["full", "items"])
};

export default withStyles(styles)(RefundOverrideDialog);
