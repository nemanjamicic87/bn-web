import React from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { dollars } from "../../../../../../../helpers/money";
import {
	fontFamilyDemiBold,
	secondaryHex
} from "../../../../../../../config/theme";
import moment from "moment-timezone";
import { TIME_FORMAT_FULL_DESCRIPTION } from "../../../../../../../helpers/time";

const styles = theme => ({
	root: {},
	linkText: {
		color: secondaryHex,
		fontFamily: fontFamilyDemiBold
	},
	orderNumber: {
		fontSize: 28,
		fontFamily: fontFamilyDemiBold
	},
	headerText: {
		[theme.breakpoints.down("xs")]: {
			fontSize: 15
		}
	},
	orderTotalText: {
		fontSize: 17,
		fontFamily: fontFamilyDemiBold,
		textTransform: "uppercase",
		marginTop: 16
	},
	feesText: {
		fontFamily: fontFamilyDemiBold,
		color: "#8b94a7",
		textTransform: "uppercase"
	},
	refundedText: {
		marginLeft: 20,
		textTransform: "uppercase",
		fontFamily: fontFamilyDemiBold,
		fontSize: 17,
		color: secondaryHex
	},
	demiBoldSpan: {
		fontFamily: fontFamilyDemiBold
	}
});

const Header = (
	{
		classes,
		order_number,
		user,
		on_behalf_of_user,
		date: dateOfPurchase,
		payment_method,
		payment_provider,
		platform,
		total_in_cents,
		fees_in_cents,
		total_refunded_in_cents,
		timezone
	}
) => {
	const { first_name, last_name, id: userId, email } = on_behalf_of_user
		? on_behalf_of_user
		: user;

	const orderTotalInCents = total_in_cents - fees_in_cents;

	const displayDateOfPurchase = moment.utc(dateOfPurchase).tz(timezone).format(TIME_FORMAT_FULL_DESCRIPTION);
	return (
		<div>
			<Typography className={classes.orderNumber}>
				Order #{order_number}
			</Typography>

			<Typography className={classes.headerText}>
				Purchased by{" "}
				<Link to={`/admin/fans/${userId}`}>
					<span className={classes.linkText}>
						{first_name} {last_name}
					</span>
				</Link>{" "}
				- {email}
			</Typography>

			<Typography className={classes.headerText}>
				<span className={classes.demiBoldSpan}>
					Date of Purchase:
				</span>{" "}
				{displayDateOfPurchase}
			</Typography>

			<Typography className={classes.headerText}>
				<span className={classes.demiBoldSpan}>
					Method of Payment:
				</span>{" "}
				{payment_method ? `${payment_method}` : ""}{" "}
				{payment_provider ? `(${payment_provider})` : ""}{" "}
				{platform ? `via ${platform}` : ""}
				{on_behalf_of_user ? ` - ${user.first_name} ${user.last_name}` : ""}
			</Typography>

			<Typography className={classes.orderTotalText}>
				Order total: {dollars(orderTotalInCents)}{" "}
				<span className={classes.feesText}>
					+ {dollars(fees_in_cents)} fees
				</span>
				{total_refunded_in_cents ? (
					<span className={classes.refundedText}>
						&nbsp;Refunded: ({dollars(total_refunded_in_cents)})
					</span>
				) : null}
			</Typography>
		</div>
	);
};

Header.propTypes = {
	classes: PropTypes.object.isRequired,
	order_number: PropTypes.string.isRequired,
	user: PropTypes.object.isRequired,
	date: PropTypes.string.isRequired,
	payment_method: PropTypes.string,
	payment_provider: PropTypes.string,
	platform: PropTypes.string.isRequired,
	total_in_cents: PropTypes.number.isRequired,
	fees_in_cents: PropTypes.number.isRequired,
	timezone: PropTypes.string.isRequired
};

export default withStyles(styles)(Header);
