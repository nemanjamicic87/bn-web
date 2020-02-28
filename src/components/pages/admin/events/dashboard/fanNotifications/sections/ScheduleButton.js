import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment-timezone";
import { Typography } from "@material-ui/core";
import Button from "../../../../../../elements/Button";
import {
	TIME_FORMAT_YYYY_MM_DD_NO_TIMEZONE,
	TIME_FORMAT_MM_DD_YYYY_NO_TIMEZONE
} from "../../../../../../../helpers/time";

class ScheduleButton extends Component {
	render() {
		const {
			scheduledAt,
			isSending,
			broadcastSent,
			isEventEnded,
			timezone,
			classes,
			onSend
		} = this.props;

		if (scheduledAt) {
			const scheduledAtFormatted = moment.utc(scheduledAt).tz(timezone).format(TIME_FORMAT_MM_DD_YYYY_NO_TIMEZONE);
			return (
				<Typography className={classes.notificationBg}>
					Notification {broadcastSent ? `sent on ` : `scheduled for `}
					<span className={classes.pinkText}>
						&nbsp;{scheduledAtFormatted}
					</span>
				</Typography>
			);

		} else {
			if (isEventEnded) {
				return null;
			} else {
				return (
					<Button
						variant={"secondary"}
						size={"large"}
						disabled={isSending}
						onClick={onSend}
						style={{ width: "100%" }}
					>
						{isSending ? "Updating..." : "Schedule Last Call"}
					</Button>
				);
			}
		}
	}
}

ScheduleButton.propTypes = {
	classes: PropTypes.object.isRequired,
	scheduledAt: PropTypes.string,
	isSending: PropTypes.bool.isRequired,
	isNotificationAfterNow: PropTypes.bool.isRequired,
	isEventEnded: PropTypes.bool.isRequired,
	timezone: PropTypes.string,
	onSend: PropTypes.func.isRequired,
	broadcastSent: PropTypes.bool,
	inProgress: PropTypes.bool
};

export default ScheduleButton;
