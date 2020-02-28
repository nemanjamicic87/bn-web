import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "../../../../../../elements/Button";

class ActionButton extends Component {
	render() {
		const {
			scheduledAt,
			isNotificationAfterNow,
			isEventEnded,
			onAction,
			broadcastSent,
			onSendNow,
			hasEventStarted,
			inProgress
		} = this.props;

		if (scheduledAt && !broadcastSent) {
			return (
				<Button
					variant={"whiteCTA"}
					size={"large"}
					onClick={onAction}
					disabled={isEventEnded}
				>
					Change
				</Button>
			);
		} else if(isNotificationAfterNow && hasEventStarted && !inProgress) {
			return (
				<Button
					variant={"whiteCTA"}
					size={"large"}
					onClick={onSendNow}
					disabled={isEventEnded}
				>
					Send now
				</Button>
			);
		} else {
			return null;
		}
	}
}

ActionButton.propTypes = {
	classes: PropTypes.object.isRequired,
	scheduledAt: PropTypes.string,
	isSending: PropTypes.bool.isRequired,
	isNotificationAfterNow: PropTypes.bool.isRequired,
	isEventEnded: PropTypes.bool.isRequired,
	broadcastSent: PropTypes.bool,
	onAction: PropTypes.func.isRequired,
	onSendNow: PropTypes.func.isRequired,
	hasEventStarted: PropTypes.bool,
	inProgress: PropTypes.bool
};

export default ActionButton;
