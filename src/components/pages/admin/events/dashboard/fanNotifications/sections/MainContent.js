import React, { Component } from "react";
import { Grid } from "@material-ui/core";
import PropTypes from "prop-types";
import NotificationProgress from "./NotificationProgress";
import ScheduleButton from "./ScheduleButton";
import ActionButton from "./ActionButton";
import ScheduleSelector from "./ScheduleSelector";
import getPhoneOS from "../../../../../../../helpers/getPhoneOS";

class MainContent extends Component {
	render() {
		const {
			classes,
			broadcastSent,
			scheduleProgress,
			scheduledAt,
			eventStart,
			eventEnd,
			timezone,
			isNotificationAfterNow,
			isEventEnded,
			scheduleSent,
			isSending,
			isCustom,
			renderTimes,
			onSend,
			onAction,
			onSendNow,
			hasEventStarted,
			inProgress,
			details
		} = this.props;

		return (
			<Grid container alignItems="center" spacing={getPhoneOS() ? 24 : 0}>
				<Grid item xs={12} md={7}>
					{scheduledAt ?
						(
							<NotificationProgress
								classes={classes}
								broadcastSent={broadcastSent}
								scheduleProgress={scheduleProgress}
								scheduledAt={scheduledAt}
								eventStart={eventStart}
								eventEnd={eventEnd}
								timezone={timezone}
								isNotificationAfterNow={isNotificationAfterNow}
								isEventEnded={isEventEnded}
								scheduleSent={scheduleSent}
								renderTimes={renderTimes}
								inProgress={inProgress}
							/>
						)
						:
						(
							<ScheduleSelector
								classes={classes}
								isEventEnded={isEventEnded}
								renderTimes={renderTimes}
							/>
						)
					}
				</Grid>
				<Grid item xs={12} md={5}>
					<Grid container alignItems="center" justify="flex-end">
						<Grid item xs={6}>
							<div className={classes.actionButtonContainer}>
								<ScheduleButton
									classes={classes}
									scheduledAt={scheduledAt}
									isSending={isSending}
									isNotificationAfterNow={isNotificationAfterNow}
									isEventEnded={isEventEnded}
									timezone={timezone}
									onSend={onSend}
									broadcastSent={broadcastSent}
									inProgress={inProgress}
								/>
							</div>
						</Grid>
						<Grid item xs={4}>
							{!broadcastSent && (
								<ActionButton
									classes={classes}
									scheduledAt={scheduledAt}
									isSending={isSending}
									isNotificationAfterNow={isNotificationAfterNow}
									isEventEnded={isEventEnded}
									isCustom={isCustom}
									onAction={onAction}
									onSendNow={onSendNow}
									broadcastSent={broadcastSent}
									hasEventStarted={hasEventStarted}
									inProgress={inProgress}
								/>
							)}
						</Grid>
					</Grid>
				</Grid>
				<br/>
				<br/>
				{details}
			</Grid>
		);
	}
}

MainContent.propTypes = {
	classes: PropTypes.object.isRequired,
	canTrigger: PropTypes.bool,
	broadcastSent: PropTypes.bool,
	scheduleProgress: PropTypes.number,
	scheduledAt: PropTypes.string,
	eventStart: PropTypes.string,
	eventEnd: PropTypes.string,
	timezone: PropTypes.string,
	isNotificationAfterNow: PropTypes.bool,
	isEventEnded: PropTypes.bool,
	hasEventStarted: PropTypes.bool,
	inProgress: PropTypes.bool,
	scheduleSent: PropTypes.number,
	isSending: PropTypes.bool,
	isCustom: PropTypes.bool,
	renderTimes: PropTypes.object,
	onSend: PropTypes.func,
	onAction: PropTypes.func,
	onSendNow: PropTypes.func,
	details: PropTypes.object,
	eventId: PropTypes.string
};

export default MainContent;
