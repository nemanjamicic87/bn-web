import React, { Component } from "react";
import { Typography } from "@material-ui/core";
import Button from "../../../../../../elements/Button";
import Dialog from "../../../../../../elements/Dialog";
import PropTypes from "prop-types";

class SendDialog extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const {
			classes,
			openConfirmDialog,
			isCustom,
			isSending,
			sendNow,
			onDialogClose
		} = this.props;

		const customLabel = "Send custom notification";
		const lastCallLabel = "Send last call notification";

		return (
			<Dialog
				open={openConfirmDialog}
				title={isCustom ? customLabel : lastCallLabel}
				iconUrl={"/icons/drinks-white.svg"}
				onClose={onDialogClose}
			>
				<div className={classes.content}>
					<div className={classes.dialogContainer}>
						<Typography className={classes.description}>
							<span className={classes.descriptionHeading}>
								You may only send this notification once per event. &nbsp;
							</span>
							All attendees who have enabled notifications on their devices will
							receive the Last Call notification.
						</Typography>
					</div>
					<div style={{ display: "flex" }}>
						<Button
							variant={"plainWhite"}
							style={{ flex: 1, marginRight: 5 }}
							onClick={onDialogClose}
						>
							Cancel
						</Button>
						<Button
							onClick={sendNow}
							variant={"secondary"}
							disabled={isSending && isCustom}
							style={{ flex: 1, marginLeft: 5, fontSize: 18 }}
						>
							{isCustom && isSending ? "Sending..." : "Send"}
						</Button>
					</div>
				</div>
			</Dialog>
		);
	}
}

SendDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	openConfirmDialog: PropTypes.bool.isRequired,
	isSending: PropTypes.bool.isRequired,
	onDialogClose: PropTypes.func.isRequired,
	sendNow: PropTypes.func.isRequired
};

export default SendDialog;
