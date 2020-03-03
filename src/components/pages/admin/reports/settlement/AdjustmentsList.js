import React, { Component } from "react";
import PropTypes from "prop-types";
import Bn from "bn-api-node";
import { Typography, withStyles } from "@material-ui/core";
import { dollars } from "../../../../../helpers/money";
import { fontFamilyDemiBold } from "../../../../../config/theme";
import IconButton from "../../../../elements/IconButton";
import DeleteDialog from "./DeleteDialog";

const typeEnums = Bn.Enums.ADJUSTMENT_TYPES;
const statusEnums = Bn.Enums.SettlementStatus;

class AdjustmentsList extends Component {
	constructor(props) {
		super(props);

		this.defaultState = {
			showDeleteDialog: false,
			id: ""
		};

		this.state = this.defaultState;

		this.onDeleteDialogClose = this.onDeleteDialogClose.bind(this);
	}

	onDeleteDialogClose() {
		this.setState({
			showDeleteDialog: null,
			id: ""
		});
	}

	onDeleteDialogOpen(id) {
		this.setState({
			showDeleteDialog: true,
			id: id
		});
	}

	render() {
		const { showDeleteDialog, id } = this.state;
		const { classes, adjustments, refreshAdjustments, status } = this.props;
		return (
			<div className={classes.root}>
				{id ? (
					<DeleteDialog
						open={!!showDeleteDialog}
						onClose={this.onDeleteDialogClose}
						refreshAdjustments={refreshAdjustments}
						id={id}
					/>
				) : null}
				<Typography className={classes.title}>Manual adjustments:</Typography>
				{adjustments.map(adjustment => {
					const {
						id,
						amount_in_cents,
						displayCreatedAt,
						note,
						settlement_adjustment_type
					} = adjustment;

					return (
						<div key={id} className={classes.itemContainer}>
							<Typography className={classes.text}>
								<span className={classes.boldText}>
									{typeEnums[settlement_adjustment_type]}
								</span>{" "}
								- {displayCreatedAt}
								{status === statusEnums.PENDING_SETTLEMENT && (
									<IconButton
										className={classes.icon}
										onClick={this.onDeleteDialogOpen.bind(this, id)}
										iconUrl="/icons/delete-gray.svg"
									>
										Delete
									</IconButton>
								)}
							</Typography>
							<Typography className={classes.text}>
								Value: {dollars(amount_in_cents)}
							</Typography>

							<Typography className={classes.text}>
								Note: {note || "-"}
							</Typography>
						</div>
					);
				})}
			</div>
		);
	}
}

const styles = theme => ({
	root: {
		marginTop: theme.spacing.unit * 2
	},
	text: {
		fontSize: 14
	},
	title: {
		fontFamily: fontFamilyDemiBold,
		fontSize: 17,
		textTransform: "capitalize"
	},
	itemContainer: {
		marginTop: theme.spacing.unit
	},
	boldText: {
		fontFamily: fontFamilyDemiBold
	},
	icon: {
		marginLeft: 30,
		marginBottom: 5
	}
});

AdjustmentsList.propTypes = {
	classes: PropTypes.object.isRequired,
	adjustments: PropTypes.array.isRequired,
	refreshAdjustments: PropTypes.func,
	status: PropTypes.string
};

export default withStyles(styles)(AdjustmentsList);
