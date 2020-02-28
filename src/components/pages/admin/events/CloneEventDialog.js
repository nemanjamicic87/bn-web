import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";

import notifications from "../../../../stores/notifications";
import Button from "../../../elements/Button";
import Dialog from "../../../elements/Dialog";
import Bigneon from "../../../../helpers/bigneon";
import { fontFamilyDemiBold } from "../../../../config/theme";
import InputGroup from "../../../common/form/InputGroup";
import eventUpdateStore from "../../../../stores/eventUpdate";
import {
	DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME,
	formatEventDataForInputs,
	validateEventFields
} from "./updateSections/Details";
import { validateTicketTypeFields } from "./updateSections/Tickets";
import DateTimePickerGroup from "../../../common/form/DateTimePickerGroup";
import SelectGroup from "../../../common/form/SelectGroup";
import moment from "moment-timezone";
import { updateTimezonesInObjects } from "../../../../helpers/time";
import user from "../../../../stores/user";
import removePhoneFormatting from "../../../../helpers/removePhoneFormatting";
import { withRouter } from "react-router-dom";

const styles = theme => ({
	btnStyle: {
		flex: 1,
		marginRight: theme.spacing.unit
	},
	explainerTextContainer: {
		maxWidth: 560,
		[theme.breakpoints.down("md")]: {
			width: "100%"
		}
	},
	explainerText: {
		color: "#58535D",
		fontSize: 20,
		lineHeight: "28px",
		textAlign: "center",
		paddingBottom: 20,
		[theme.breakpoints.down("md")]: {
			fontSize: 16
		}
	},
	eventIcon: {
		width: 80,
		height: 40,
		borderRadius: 4
	},
	btnContainer: {
		display: "flex",
		marginTop: theme.spacing.unit * 2,
		justifyItems: "space-between"
	},
	nameText: {
		marginTop: theme.spacing.unit,
		fontFamily: fontFamilyDemiBold
	},
	dialogContent: {
		paddingLeft: 30,
		paddingRight: 30
	}
});

class CloneEventDialog extends React.Component {
	static doorHoursOptions = Array.from(Array(10 + 2)).map((_, i) => {
		if (i === 0) {
			return { value: 0, label: "Same as showtime" };
		}
		if (i === 1) {
			return { value: 0.5, label: "30 minutes before showtime" };
		}
		return {
			value: i - 1,
			label:
				i - 1 === 1
					? "1 hour before showtime"
					: `${i - 1} hours before showtime`
		};
	});

	constructor(props) {
		super(props);

		this.state = {
			errors: {},
			name: "",
			eventDate: null,
			endTime: null,
			event_start: null,
			venueTimezone: null,
			event_end: null
		};
		this.validateFields = this.validateFields.bind(this);
	}

	componentDidUpdate(prevProps) {
		const { id } = this.props;

		if (id && prevProps.id !== id) {
			Bigneon()
				.events.read({ id })
				.then(response => {
					const { name, event_start, event_end, venue } = response.data;
					this.setState({
						name: name,
						eventDate: moment.utc(event_start).tz(venue.timezone),
						endTime: moment.utc(event_end).tz(venue.timezone),
						event_end,
						event_start,
						venueTimezone: venue.timezone
					});
				})
				.catch(error => {
					console.error(error);
					notifications.showFromErrorResponse({
						defaultMessage: "Loading event details failed.",
						error
					});
				});
		}
	}

	cloneEvent(e) {
		e.preventDefault();

		const { name, event_start, event_end } = this.state;
		const { id } = this.props;

		Bigneon()
			.events.clone({
				id,
				name,
				event_start,
				event_end
			})
			.then(response => {
				const { id } = response.data;
				this.props.onClose();
				this.updateUrl(id);
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					defaultMessage: "There was an error cloning this event.",
					error
				});
			});
	}

	updateUrl(id) {
		if (id) {
			this.props.history.push(`/admin/events/${id}/edit`);
		}
	}

	validateFields() {
		const errors = {};

		const { name, eventDate, endTime } = this.state;

		if (!name) {
			errors.name = "Event name required.";
		}

		if (!endTime) {
			errors.endTime = "Event end time required.";
		} else if (!eventDate) {
			errors.eventDate = "Event start time required.";
		} else if (endTime.diff(eventDate) <= 0) {
			errors.endTime = "End time must be after event date.";
		}

		if (Object.keys(errors).length > 0) {
			return errors;
		}

		return null;
	}

	render() {
		const { onClose, id, classes } = this.props;
		const { errors, name, eventDate, endTime, venueTimezone } = this.state;

		return (
			<Dialog
				open={!!id}
				onClose={onClose}
				iconUrl={"/icons/tickets-white.svg"}
				title={"Clone Event"}
			>
				<form
					noValidate
					autoComplete="off"
					onSubmit={this.cloneEvent.bind(this)}
					className={classes.dialogContent}
				>
					<div className={classes.explainerTextContainer}>
						<Typography className={classes.explainerText}>
							Quickly create a new event with the same settings including:
							image, artist(s), description, and ticket types. Begin by
							confirming the event name, and setting the new event’s start & end
							date/time below. You will be able to review the event for accuracy
							& make any necessary adjustments as needed before publishing.
						</Typography>
						<Typography className={classes.explainerText}>
							Note: scheduled price changes, ticket type fees, smart holds, and
							promo codes are not copied.
						</Typography>
					</div>
					<div className={classes.inputsContainer}>
						<Grid item xs={12} sm={12} md={12} lg={12}>
							<InputGroup
								error={errors.name}
								value={name}
								name="eventName"
								label="Event name *"
								type="text"
								onChange={e => this.setState({ name: e.target.value })}
								onBlur={this.validateFields}
							/>
						</Grid>
						<Grid container spacing={32}>
							<Grid item xs={6}>
								<DateTimePickerGroup
									type="date"
									error={errors.eventDate}
									value={eventDate}
									name="eventDate"
									label="Event date *"
									onChange={newEventDate => {
										newEventDate.set({
											hour: eventDate.get("hour"),
											minute: eventDate.get("minute"),
											second: eventDate.get("second")
										});

										this.setState({
											eventDate: newEventDate,
											event_start: moment
												.utc(newEventDate)
												.format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
										});
									}}
									onBlur={this.validateFields}
								/>
							</Grid>

							<Grid item xs={6}>
								<DateTimePickerGroup
									error={errors.eventDate}
									value={eventDate}
									name="show-time"
									label="Show time *"
									onChange={eventTime => {
										eventDate.set({
											hour: eventTime.get("hour"),
											minute: eventTime.get("minute"),
											second: eventTime.get("second")
										});
										this.setState({
											eventDate: eventDate,
											event_start: moment
												.utc(eventDate)
												.format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
										});
									}}
									onBlur={this.validateFields}
									format="HH:mm"
									type="time"
								/>
							</Grid>
						</Grid>

						<Grid container spacing={32}>
							<Grid item xs={6}>
								<DateTimePickerGroup
									type="date"
									error={errors.endTime}
									value={endTime}
									name="endTime"
									label="End date *"
									onChange={newEndDate => {
										const updatedEndTime = newEndDate;

										let adjustTime;

										//Adjust time part of newly selected date
										if (endTime) {
											adjustTime = endTime;
										} else if (eventDate) {
											adjustTime = moment(eventDate).add(
												DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME,
												"hours"
											);
										}

										if (adjustTime) {
											updatedEndTime.set({
												hour: adjustTime.get("hour"),
												minute: adjustTime.get("minute"),
												second: adjustTime.get("second")
											});
										}

										this.setState({
											endTime: updatedEndTime,
											event_end: moment
												.utc(updatedEndTime)
												.format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
										});
									}}
									onBlur={this.validateFields}
								/>
							</Grid>
							<Grid item xs={6}>
								<DateTimePickerGroup
									type="time"
									error={errors.endTime}
									value={endTime}
									name="endTime"
									label="End time *"
									onChange={newEndTime => {
										let updatedEndTime = moment();

										if (endTime) {
											updatedEndTime = moment(endTime);
										} else if (eventDate) {
											updatedEndTime = moment(eventDate).add(
												DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME,
												"hours"
											);
										}

										updatedEndTime.set({
											hour: newEndTime.get("hour"),
											minute: newEndTime.get("minute"),
											second: newEndTime.get("second")
										});

										this.setState({
											endTime: updatedEndTime,
											event_end: moment
												.utc(updatedEndTime)
												.format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
										});
									}}
									onBlur={this.validateFields}
								/>
							</Grid>
						</Grid>
					</div>
					<div className={classes.btnContainer}>
						<Button
							className={classes.btnStyle}
							onClick={onClose}
							size={"mediumLarge"}
							color="primary"
						>
							Cancel
						</Button>
						<Button
							className={classes.btnStyle}
							size={"mediumLarge"}
							type="submit"
							variant="callToAction"
						>
							Create
						</Button>
					</div>
				</form>
			</Dialog>
		);
	}
}

CloneEventDialog.propTypes = {
	id: PropTypes.string,
	onClose: PropTypes.func.isRequired
};

export default withStyles(styles)(withRouter(CloneEventDialog));
