import React, { Component } from "react";
import cubejs from "@cubejs-client/core";
import { QueryRenderer } from "@cubejs-client/react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import moment from "moment-timezone";
import Card from "../../../../../../elements/Card";
import {
	fontFamilyDemiBold,
	secondaryHex
} from "../../../../../../../config/theme";
import Loader from "../../../../../../elements/loaders/Loader";
import DoughnutChart from "./DoughnutChart";
import LegendRow from "./LegendRow";
import getScreenWidth from "../../../../../../../helpers/getScreenWidth";
import IconButton from "../../../../../../elements/IconButton";
import Hidden from "@material-ui/core/Hidden";

const COLORS = ["#00F1C5", "#00C5CB", "#FFC65F", secondaryHex];
const DEBOUNCE_DELAY = 250;

const CARD_WIDTH = 522;
const CARD_HEIGHT = 219;

const styles = theme => {
	return {
		root: {
			width: CARD_WIDTH,
			position: "fixed",
			minHeight: CARD_HEIGHT,
			padding: 33,
			boxShadow: "10px 10px 25px 2px rgba(43,43,43,0.12)",
			zIndex: 10,

			[theme.breakpoints.down("sm")]: {
				width: getScreenWidth() * 0.85
			}
		},
		dataContainer: {
			display: "flex",
			height: "100%",

			[theme.breakpoints.down("sm")]: {
				flexDirection: "column"
			}
		},
		pieContainer: {
			flex: 2,
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			alignItems: "center"
		},
		detailsContainer: {
			flex: 3,
			flexDirection: "column",
			justifyContent: "center"
		},
		title: {
			fontSize: 21,
			fontFamily: fontFamilyDemiBold
		},
		date: {
			fontSize: 15,
			marginTop: 10,
			marginBottom: 10
		},
		salesSourceRow: {
			display: "flex",
			justifyContent: "space-between",
			height: 16
		},
		emptyStateText: {
			fontSize: 15,
			color: "#979797"
		},
		emptyStateContainer: {
			marginTop: 20
		},
		emptyStateTitle: {
			textAlign: "center",
			fontSize: 22,
			fontFamily: fontFamilyDemiBold
		},
		closeButton: {
			position: "absolute",
			top: "10%",
			right: "5%",
			[theme.breakpoints.down("sm")]: {
				right: "10%"
			}
		}
	};
};

const DataRenderer = ({ resultSet, displayDate, classes, closeToolTip }) => {
	const rows = resultSet.tablePivot();

	//Ignore dummy data used to create a filled gray chart
	let hasData = false;

	rows.forEach(function (row, index) {
		if (row["PageViews.source"] !== "No data") {
			hasData = true;
		}
	});

	//Limit to 4 items
	const items = rows.map((row, index) => {
		if(index <= 3) {
			return row;
		}
	});

	//If more than 4 items put them all in "Other" and group tickets
	const sum = rows.map(function (object, index) {
		if(index > 3) {
			return Object.keys(object).reduce(function (sum, key) {
				const tickets = Number(object["PageViews.tickets"]);
				if (!isNaN(tickets)) {
					return sum + tickets;
				}
			}, 0);
		} else {
			return 0; //items before 4th
		}
	});

	const rowsUpdated = items.concat({
		"PageViews.source": "other",
		"PageViews.medium": "other",
		"PageViews.tickets": sum.reduce((a, b) => a + b, 0) //tally ticket numbers
	});

	return (
		<div className={classes.dataContainer}>
			<div className={classes.pieContainer}>
				<DoughnutChart resultSet={resultSet} colors={COLORS}/>
				<IconButton onClick={closeToolTip} iconUrl="/icons/delete-gray.svg" className={classes.closeButton}/>
			</div>
			<div className={classes.detailsContainer}>
				<Typography className={classes.title}>Ticket Sales Source</Typography>
				<Typography className={classes.date}>{displayDate}</Typography>
				{(hasData && rowsUpdated) ? (
					rowsUpdated.map((row, index) => {
						if(row) {
							let source = row["PageViews.source"];
							let medium = row["PageViews.medium"];
							const tickets = Number(row["PageViews.tickets"]);

							if (!source) {
								source = "www.bigneon.com";
							}

							if (!medium) {
								medium = "Direct";
							}

							return (
								<LegendRow
									key={index}
									color={COLORS[index]}
									label={`${source} - ${medium}`}
									valueLabel={`${tickets}`}
								/>
							);
						}
					})
				) : (
					<Typography className={classes.emptyStateText}>
						You do not have any ticket sales for this date. When a ticket is
						sold the top sale sources will be listed here.
					</Typography>
				)}
			</div>
		</div>
	);
};

const ChartRender = ChartComponent => ({ resultSet, error }) =>
	(resultSet && <ChartComponent resultSet={resultSet}/>) ||
	(error && error.toString()) || <Loader/>;

class TicketSalesTooltip extends Component {
	constructor(props) {
		super(props);

		this.state = {
			cubeJsApi: cubejs(props.token, {
				apiUrl: `${props.cubeApiUrl}/cubejs-api/v1`
			}),
			displayDate: "",
			screenWidth: getScreenWidth(),
			startDateStringFilter: "",
			endDateStringFilter: ""
		};
	}

	componentWillUnmount() {
		this.clearDebounceTimer();
	}

	clearDebounceTimer() {
		if (this.debounceTimeout) {
			clearTimeout(this.debounceTimeout);
		}
	}

	componentDidMount() {
		const { dateString, timezone } = this.props;

		if (dateString) {
			this.setDebounce(dateString, timezone);
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		//If date changed
		const { dateString, timezone } = this.props;
		if (dateString && prevProps.dateString !== dateString) {
			this.setDefaults();
			this.setDebounce(dateString, timezone);
		} else if (!dateString) {
			this.setDefaults();
		}
	}

	setDefaults() {
		this.setState({
			displayDate: null,
			startDateStringFilter: "",
			endDateStringFilter: "",
			screenWidth: getScreenWidth()
		});
	}

	setDebounce(dateString, timezone) {
		this.debounceTimeout = setTimeout(() => {
			//Triggers the query
			const displayDate = moment(dateString).format("ddd MM/DD/YYYY");

			const startDateStringFilter = moment
				.tz(dateString, timezone)
				.utc()

				.format();
			const endDateStringFilter = moment
				.tz(dateString, timezone)
				.endOf("day")
				.utc()
				.format();

			this.setState({
				displayDate,
				startDateStringFilter,
				endDateStringFilter
			});
		}, DEBOUNCE_DELAY);
	}

	render() {
		const {
			cubeJsApi,
			displayDate,
			screenWidth,
			startDateStringFilter,
			endDateStringFilter
		} = this.state;

		const { classes, timezone, closeToolTip, cutOffDateString } = this.props;

		let { top, left } = this.props;

		//Adjust to keep it on screen
		if (left * 1.3 > screenWidth) {
			left = left - left * 0.3;
		} else if (screenWidth * 0.3 > left) {
			left = left + left * 0.3;
		}

		//If the screen is too small, fix it to the left
		if (screenWidth < 500) {
			left = 20;
		} else {
			left = left - CARD_WIDTH / 2;
		}

		top = top - CARD_HEIGHT - 50;

		return (
			<Card
				className={classes.root}
				style={{
					top,
					left
				}}
			>
				{startDateStringFilter ? (
					moment.utc(startDateStringFilter).isAfter(cutOffDateString, "day") ? (
						<QueryRenderer
							query={{
								timezone,
								measures: [
									"PageViews.tickets"
									// "PageViews.uniqueViews",
									// "PageViews.conversionRate"
								],
								dimensions: ["PageViews.source", "PageViews.medium"],
								segments: [],
								order: {
									"PageViews.tickets": "desc"
								},
								filters: [
									{
										dimension: "PageViews.date",
										operator: "gte",
										values: [startDateStringFilter]
									},
									{
										dimension: "PageViews.date",
										operator: "lt",
										values: [endDateStringFilter]
									}
								]
							}}
							cubejsApi={cubeJsApi}
							render={ChartRender(props => (
								<DataRenderer
									{...props}
									classes={classes}
									displayDate={displayDate}
									closeToolTip={closeToolTip}
								/>
							))}
						/>
					) : (
						<div className={classes.emptyStateContainer}>
							<Typography className={classes.emptyStateTitle}>
								No Sales Source Data Available
							</Typography>
							<Typography align={"center"}>
								Sales source data is available for events that were put on sale after January 9, 2020.
							</Typography>
						</div>
					)
				) : (
					<Loader/>
				)}
			</Card>
		);
	}
}

TicketSalesTooltip.propTypes = {
	token: PropTypes.string.isRequired,
	cubeApiUrl: PropTypes.string.isRequired,
	dateString: PropTypes.string.isRequired,
	top: PropTypes.number.isRequired,
	left: PropTypes.number.isRequired,
	timezone: PropTypes.string.isRequired,
	closeToolTip: PropTypes.func,
	cutOffDateString: PropTypes.string
};

export default withStyles(styles)(TicketSalesTooltip);
