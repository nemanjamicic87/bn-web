import React from "react";
import Card from "../../../../elements/Card";
import { Typography, Hidden, Grid } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import lineBreakHtmlToPlainText from "../../../../../helpers/lineBreakHtmlToPlainText";
import ReadMoreAdditionalInfo from "../../../../elements/event/ReadMoreAdditionalInfo";
import moment from "moment-timezone";
import splitByCamelCase from "../../../../../helpers/splitByCamelCase";

const DetailsOverview = ({
	classes,
	event,
	venue,
	displayEventStart,
	displayEventEnd,
	displayEventStartTime,
	displayEventEndTime
}) => {
	const {
		name,
		top_line_info,
		additional_info,
		displayDoorTime,
		age_limit,
		event_type,
		override_status,
		private_access_code
	} = event;
	// Top Line col styles
	const colStyles = [{ flex: 3 }, { flex: 2 }, { flex: 4 }];
	const headings = ["Event name", "Venue", "Top Line Info"];
	const values = [name, venue.name, top_line_info];

	// Col styles for dates and times
	const dateColStyles = [
		{ flex: 2 },
		{ flex: 2 },
		{ flex: 2 },
		{ flex: 2 },
		{ flex: 2 }
	];
	const dateHeadings = [
		`Event date`,
		`Show time`,
		"Door time",
		`End date`,
		`End time`
	];

	const dateValues = [
		displayEventStart,
		displayEventStartTime,
		displayDoorTime,
		displayEventEnd,
		displayEventEndTime
	];

	const mobileDateHeadings = [
		`Event date`,
		`Show time`,
		`End date`,
		`End time`,
		"Door time"
	];

	const mobileDateValues = [
		displayEventStart,
		displayEventStartTime,
		displayEventEnd,
		displayEventEndTime,
		displayDoorTime
	];

	const infoHeadings = [
		"Age limit",
		"Event type",
		"Private access code",
		"event status",
		""
	];

	const ageLimit =
		age_limit === "18"
			? "18 & over"
			: age_limit === "21"
				? "21 & over"
				: age_limit === "0"
					? "All Ages"
					: age_limit;

	const infoValues = [
		ageLimit,
		event_type,
		private_access_code,
		override_status ? splitByCamelCase(override_status) : "Auto",
		" "
	];
	return (
		<Card className={classes.detailsCardStyle}>
			{/*DESKTOP*/}
			<Hidden smDown>
				<div className={classes.detailsTopRow}>
					{headings.map((heading, index) => (
						<Typography
							key={index}
							style={colStyles[index]}
							className={classes.smallGreyCapTitle}
						>
							{heading}
						</Typography>
					))}
				</div>
				<div className={classes.detailsTopRow}>
					{values.map((value, index) => (
						<Typography
							key={index}
							style={colStyles[index]}
							className={classes.smallTitle}
						>
							{value ? value : "-"}
						</Typography>
					))}
				</div>
				<Divider className={classes.dividerStyle}/>
				{additional_info ? (
					<div>
						<Typography className={classes.smallGreyCapTitle}>
							Additional Event info
						</Typography>
						<ReadMoreAdditionalInfo
							readMoreText="View full description"
							readLessText="Hide full description"
						>
							{additional_info ? lineBreakHtmlToPlainText(additional_info) : ""}
						</ReadMoreAdditionalInfo>
						<Divider className={classes.dividerStyle}/>
					</div>
				) : null}
				<div className={classes.detailsTopRow}>
					{dateHeadings.map((heading, index) => (
						<Typography
							key={index}
							style={dateColStyles[index]}
							className={classes.smallGreyCapTitle}
						>
							{heading}
						</Typography>
					))}
				</div>
				<div className={classes.detailsTopRow}>
					{dateValues.map((value, index) => (
						<Typography
							key={index}
							style={dateColStyles[index]}
							className={classes.smallTitle}
						>
							{value ? value : "-"}
						</Typography>
					))}
				</div>

				<Divider className={classes.dividerStyle}/>
				<div className={classes.detailsTopRow}>
					{infoHeadings.map((heading, index) => (
						<Typography
							key={index}
							style={dateColStyles[index]}
							className={classes.smallGreyCapTitle}
						>
							{heading}
						</Typography>
					))}
				</div>
				<div className={classes.detailsTopRow}>
					{infoValues.map((value, index) => (
						<Typography
							key={index}
							style={dateColStyles[index]}
							className={classes.smallTitle}
						>
							{value ? value : "-"}
						</Typography>
					))}
				</div>
			</Hidden>
			{/*MOBILE*/}
			<Hidden mdUp>
				<div className={classes.detailsContainer}>
					<Typography className={classes.smallGreyCapTitle}>
						Event Name
					</Typography>
					<Typography className={classes.smallTitle}>
						{values[0] ? values[0] : "-"}
					</Typography>
				</div>
				<div className={classes.detailsContainer}>
					<Typography className={classes.smallGreyCapTitle}>Venue</Typography>
					<Typography className={classes.smallTitle}>
						{values[1] ? values[1] : "-"}
					</Typography>
				</div>
				<div className={classes.detailsContainer}>
					<Typography className={classes.smallGreyCapTitle}>
						Top Line Info
					</Typography>
					<Typography className={classes.smallTitle}>
						{values[2] ? values[2] : "-"}
					</Typography>
				</div>
				<Divider className={classes.dividerStyle}/>
				<Typography className={classes.smallGreyCapTitle}>
					Additional Event info
				</Typography>
				<ReadMoreAdditionalInfo
					readMoreText="View full description"
					readLessText="Hide full description"
				>
					{additional_info ? lineBreakHtmlToPlainText(additional_info) : ""}
				</ReadMoreAdditionalInfo>
				<Divider className={classes.dividerStyle}/>
				<Grid container>
					{mobileDateHeadings.map((heading, index) => (
						<Grid item xs={6} key={index}>
							<div className={classes.detailsContainer}>
								<Typography className={classes.smallGreyCapTitle}>
									{heading}
								</Typography>
								<Typography className={classes.smallTitle}>
									{mobileDateValues[index]}
								</Typography>
							</div>
						</Grid>
					))}
				</Grid>
				<Divider className={classes.dividerStyle}/>
				<Grid container>
					{infoHeadings.map((heading, index) => (
						<Grid item xs={6} key={index}>
							<div className={classes.detailsContainer}>
								<Typography className={classes.smallGreyCapTitle}>
									{heading}
								</Typography>
								<Typography className={classes.smallTitle}>
									{infoValues[index] ? infoValues[index] : "-"}
								</Typography>
							</div>
						</Grid>
					))}
				</Grid>
			</Hidden>
		</Card>
	);
};
export default DetailsOverview;
