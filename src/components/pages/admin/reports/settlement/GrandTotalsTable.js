import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core";
import Bn from "bn-api-node";
import TotalsRow from "./TotalsRow";
import { dollars } from "../../../../../helpers/money";
import { fontFamilyDemiBold, secondaryHex } from "../../../../../config/theme";

const statusEnums = Bn.Enums.SettlementStatus;

const GrandTotalsTable = props => {
	const {
		classes,
		totalFaceInCents,
		totalRevenueShareInCents,
		adjustmentsInCents,
		onAddAdjustment,
		totalSettlementInCents,
		status
	} = props;

	const columnStyles = [
		{ flex: 3, textAlign: "left" },
		{ flex: 3, textAlign: "right" },
		{ flex: 0 }
	];

	return (
		<div className={classes.root}>
			<TotalsRow columnStyles={columnStyles} heading>
				{["Total", "", ""]}
			</TotalsRow>

			<TotalsRow columnStyles={columnStyles}>
				{["Total face", dollars(totalFaceInCents), ""]}
			</TotalsRow>

			<TotalsRow columnStyles={columnStyles} gray>
				{["Total revenue share", dollars(totalRevenueShareInCents), ""]}
			</TotalsRow>

			<TotalsRow columnStyles={columnStyles}>
				{[
					<span key={"adjustments"} className={classes.adjustmentText}>
						Adjustments&nbsp;
						{onAddAdjustment && status === statusEnums.PENDING_SETTLEMENT ? (
							<span className={classes.editText} onClick={onAddAdjustment}>
								Add Adjustments
							</span>
						) : null}
					</span>,
					dollars(adjustmentsInCents),
					""
				]}
			</TotalsRow>

			<TotalsRow columnStyles={columnStyles} total>
				{["Total settlement", dollars(totalSettlementInCents), ""]}
			</TotalsRow>
		</div>
	);
};

const styles = theme => ({
	root: {
		marginBottom: theme.spacing.unit * 4,
		maxWidth: 400
	},
	boldText: {
		fontFamily: fontFamilyDemiBold
	},
	adjustmentText: {
		fontSize: theme.typography.fontSize * 0.9,
		fontFamily: fontFamilyDemiBold,
		marginTop: 10
	},
	editText: {
		fontFamily: fontFamilyDemiBold,
		cursor: "pointer",
		color: secondaryHex
	}
});

GrandTotalsTable.propTypes = {
	classes: PropTypes.object.isRequired,
	adjustmentsInCents: PropTypes.number.isRequired,
	onAddAdjustment: PropTypes.func,
	totalFaceInCents: PropTypes.number.isRequired,
	totalRevenueShareInCents: PropTypes.number.isRequired,
	totalSettlementInCents: PropTypes.number.isRequired,
	status: PropTypes.string
};

export default withStyles(styles)(GrandTotalsTable);
