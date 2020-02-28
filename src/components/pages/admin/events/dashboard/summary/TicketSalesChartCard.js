import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Typography, Hidden, Card } from "@material-ui/core";
import PropTypes from "prop-types";
import moment from "moment-timezone";

import CollapseCard from "./CollapseCard";
import {
	fontFamilyDemiBold,
	secondaryHex
} from "../../../../../../config/theme";
import TicketSalesChart from "./charts/TicketSalesChart";
import ticketCountReport from "../../../../../../stores/reports/ticketCountReport";
import EventTicketCountTable from "../../../reports/counts/EventTicketCountTable";
import Loader from "../../../../../elements/loaders/Loader";
import getScreenWidth from "../../../../../../helpers/getScreenWidth";

const styles = theme => {
	return {
		root: {},
		titleText: {
			fontFamily: fontFamilyDemiBold,
			fontSize: 19,
			marginBottom: 20
		},
		showHideLink: {
			fontSize: 14,
			color: secondaryHex,
			fontFamily: fontFamilyDemiBold,
			textAlign: "center",
			cursor: "pointer"
		},
		tableContainer: {
			paddingBottom: 20,
			paddingTop: 20
		},
		dropDownIcon: {
			height: "auto",
			width: 9,
			marginLeft: 8,
			marginBottom: 1
		},
		scroll: {
			display: "flex",
			flexWrap: "nowrap",
			overflowX: "auto",
			WebkitOverflowScrolling: "touch",

			[theme.breakpoints.down("xs")]: {
				maxWidth: getScreenWidth() - 60
			}
		},
		block: {
			flex: 1
		},
		chartContainer: {
			[theme.breakpoints.down("xs")]: {
				position: "relative",
				margin: "auto",
				width: "80vw"
			}
		}
	};
};

class TicketSalesChartCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			ticketCounts: null,
			showTicketCounts: false,
			publishDateMinusOneDayUTC: moment(props.publish_date)
				.subtract(1, "days")
				.format()
		};
	}

	refreshData() {
		const { organization_id, id } = this.props;
		const queryParams = { organization_id, event_id: id };

		ticketCountReport.fetchCountAndSalesData(queryParams, false, () => {
			const ticketCounts = ticketCountReport.dataByPrice[id];

			this.setState({ ticketCounts });
		});
	}

	render() {
		const {
			classes,
			token,
			event_end,
			venue,
			cubeApiUrl,
			name,
			organization_id,
			id,
			publish_date,
			cutOffDateString,
			...rest
		} = this.props;

		const title = "Ticket Sales";

		const {
			ticketCounts,
			showTicketCounts,
			publishDateMinusOneDayUTC
		} = this.state;
		if (!ticketCounts) {
			this.refreshData();
		}

		return (
			<CollapseCard
				title={title}
				className={classes.root}
				iconPath={"/icons/graph.png"}
			>
				<div className={classes.root}>
					<Hidden smDown>
						<Typography className={classes.titleText}>{title}</Typography>
					</Hidden>

					<TicketSalesChart
						cubeApiUrl={cubeApiUrl}
						token={token}
						timezone={venue.timezone}
						startDate={publishDateMinusOneDayUTC}
						endDate={event_end}
						cutOffDateString={cutOffDateString}
					/>
				</div>
			</CollapseCard>
		);
	}
}

TicketSalesChartCard.propTypes = {
	classes: PropTypes.object.isRequired,
	token: PropTypes.string.isRequired,
	publish_date: PropTypes.string.isRequired,
	event_end: PropTypes.string.isRequired,
	venue: PropTypes.object.isRequired,
	cubeApiUrl: PropTypes.string.isRequired,
	cutOffDateString: PropTypes.string
};

export default withStyles(styles)(TicketSalesChartCard);
