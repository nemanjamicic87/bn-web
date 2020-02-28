import React from "react";
import Card from "../../../../elements/Card";
import { Typography, Grid, Hidden } from "@material-ui/core";
import moment from "moment-timezone";

const PublishedOverview = ({ classes, event }) => {
	const {
		publish_date,
		cancelled_at,
		publishedDateFormatted,
		publishStatus,
		publishStatusHeading,
		unpublishedDateFormatted,
		status
	} = event;

	// Top Line col styles
	const colStyles = [{ flex: 1 }, { flex: 4 }];

	const headings = ["Status", publishStatusHeading];
	const values = [publishStatus, publish_date && status !== "Draft" ? publishedDateFormatted : ""];
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
							{values[index] ? values[index] + " " : "Not Published"}
						</Typography>
					))}
				</div>
			</Hidden>
			{/*MOBILE*/}
			<Hidden mdUp>
				<Grid container>
					{headings.map((heading, index) => (
						<Grid item key={index} xs={index === 0 ? 4 : 8}>
							<Typography className={classes.smallGreyCapTitle}>
								{heading}
							</Typography>
							<Typography className={classes.smallTitle}>
								{values[index] ? values[index] + " " : "Not Published"}
							</Typography>
						</Grid>
					))}
				</Grid>
			</Hidden>
		</Card>
	);
};
export default PublishedOverview;
