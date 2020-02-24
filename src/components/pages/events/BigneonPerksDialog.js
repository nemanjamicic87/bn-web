import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import Dialog from "../../elements/Dialog";
import { fontFamily, fontFamilyDemiBold } from "../../../config/theme";
import Button from "../../elements/Button";

const styles = theme => ({
	root: {},
	btnStyle: {
		flex: 1,
		marginRight: theme.spacing.unit
	},
	nameText: {
		marginTop: theme.spacing.unit,
		fontFamily: fontFamilyDemiBold
	},
	lightGreyText: {
		fontSize: 16,
		color: "#9BA3B5",
		fontFamily: fontFamily,
		lineHeight: "18px",
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2
	},
	modalContainer: {
		maxWidth: 400
	},
	customTitle: {
		fontSize: 26
	},
	withBNtext: {
		color: "#3C383F",
		fontSize: 15,
		lineHeight: "18px",
		marginTop: 10,
		fontFamily: fontFamilyDemiBold
	},
	iconText: {
		marginBottom: 15
	},
	btnContainer: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center"
	}
});

class BigneonPerksDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			name: "",
			isSubmitting: false
		};
	}

	render() {
		const { onClose, open, classes, isDelete } = this.props;
		const { name, isSubmitting } = this.state;

		return (
			<Dialog
				// open={open}
				open={true}
				onClose={onClose}
				title={"Life is Better with the Big Neon App!"}
			>
				<div className={classes.root}>
					<div className={classes.modalContainer}>
						<Typography className={classes.lightGreyText}>
							The Big Neon app makes your tickets more secure and unlocks a
							richer experience at the event. Don’t want to use the app? Just
							bring your photo ID to the event instead.
						</Typography>
						<div className={classes.desktopCardFooterContainer}>
							<div className={classes.iconText}>
								<Typography className={classes.withBNtext}>
									With the Big Neon App you can:
								</Typography>
								<Typography className={classes.withBNtext}>
									<span className={classes.icon}>&#x1F46F;</span>
									Transfer tickets to friends
								</Typography>
								<Typography className={classes.withBNtext}>
									<span className={classes.icon}>&#x1F430;</span>
									Speed through the line
								</Typography>
								<Typography className={classes.withBNtext}>
									<span className={classes.icon}>&#x1F379;</span>
									Score presale access to events
								</Typography>
							</div>
						</div>
						<div className={classes.btnContainer}>
							<Button
								variant={"secondary"}
								size={"mediumLarge"}
								onClick={onClose()}
							>
								Awesome
							</Button>
						</div>
					</div>
				</div>
			</Dialog>
		);
	}
}

BigneonPerksDialog.propTypes = {
	id: PropTypes.string,
	onClose: PropTypes.func.isRequired
};

export default withStyles(styles)(BigneonPerksDialog);