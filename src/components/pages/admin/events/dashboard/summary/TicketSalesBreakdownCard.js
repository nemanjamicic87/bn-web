import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Typography, Hidden, Collapse } from "@material-ui/core";
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
		ticketSalesBreakdown: {
			[theme.breakpoints.down("xs")]: {
				minWidth: "400vw"
			}
		}
	};
};

class TicketSalesBreakdownCard extends Component {
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

		const footerContent = (
			<React.Fragment>
				<Typography
					className={classes.showHideLink}
					onClick={() => this.setState({ showTicketCounts: !showTicketCounts })}
				>
					{showTicketCounts ? "Hide" : "Show"} Ticket Type Breakdown
					<img
						src={`/icons/${showTicketCounts ? "up" : "down"}-active.svg`}
						className={classes.dropDownIcon}
					/>
				</Typography>
				<Collapse in={showTicketCounts}>
					{ticketCounts ? (
						<div className={classes.tableContainer}>
							<div className={classes.scroll}>
								<div className={classes.block}>
									<EventTicketCountTable
										ticketCounts={ticketCounts}
										hideDetails={true}
									/>
								</div>
							</div>
						</div>
					) : (
						<Loader>Loading Ticket Type Breakdown</Loader>
					)}
				</Collapse>
			</React.Fragment>
		);

		return (
			<CollapseCard
				title={title}
				className={classes.root}
				iconPath={"/icons/graph.png"}
				footerContent={footerContent}
			>
			</CollapseCard>
		);
	}
}

TicketSalesBreakdownCard.propTypes = {
	classes: PropTypes.object.isRequired,
	token: PropTypes.string.isRequired,
	publish_date: PropTypes.string.isRequired,
	event_end: PropTypes.string.isRequired,
	venue: PropTypes.object.isRequired,
	cubeApiUrl: PropTypes.string.isRequired
};

export default withStyles(styles)(TicketSalesBreakdownCard);
