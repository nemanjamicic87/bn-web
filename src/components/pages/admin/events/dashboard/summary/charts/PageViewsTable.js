import React, { Component } from "react";
import cubejs from "@cubejs-client/core";
import { QueryRenderer } from "@cubejs-client/react";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import PageViewsRow from "./PageViewsRow";
import Loader from "../../../../../../elements/loaders/Loader";
import { withStyles } from "@material-ui/core/styles";
import { fontFamilyDemiBold } from "../../../../../../../config/theme";

const upperFirstChar = string =>
	string ? string[0].toUpperCase() + string.slice(1) : "";

const columnHeadingMap = {
	"PageViews.uniqueViews": "Unique Visitors",
	"PageViews.source": "Source",
	"PageViews.medium": "Medium",
	"PageViews.tickets": "Tickets Sold",
	"PageViews.conversionRate": "Order Conversion Rate"
};

const formatValueFunctions = {
	"PageViews.uniqueViews": (row, classes, totalUniquePageViews) => {
		const value = Number(row["PageViews.uniqueViews"]);

		const percent = totalUniquePageViews
			? `${Math.round((value / totalUniquePageViews) * 100 * 100) / 100}%`
			: "0%";

		return (
			<span key={"PageViews.uniqueViews"}>
				{value} <span className={classes.percentText}>({percent})</span>
			</span>
		);
	},
	"PageViews.source": (row, classes, totalUniquePageViews) => {
		const val = row["PageViews.source"];

		return upperFirstChar(val);
	},
	"PageViews.medium": (row, classes, totalUniquePageViews) => {
		const val = row["PageViews.medium"];

		return upperFirstChar(val);
	},
	"PageViews.conversionRate": (row, classes, totalUniquePageViews) => {
		const percent = Number(row["PageViews.conversionRate"]);

		return `${Math.round(percent * 100) / 100}%`;
	}
};

const TableRender = ({ resultSet, classes, salesSourceUnavailableMessage }) => {
	const rows = resultSet.tablePivot();

	let totalUniquePageViews = 0;
	rows.forEach(r => {
		totalUniquePageViews += Number(r["PageViews.uniqueViews"]);
	});

	return (
		<div className={classes.pageViewsTable}>
			<PageViewsRow heading>
				{resultSet.tableColumns().map(c => columnHeadingMap[c.key] || c.title)}
			</PageViewsRow>
			{rows.length > 0 && !salesSourceUnavailableMessage ? (
				rows.map((row, index) => {
					return (
						<PageViewsRow key={index} gray={!!(index % 2)}>
							{Object.keys(row).map(key => {
								let value = "";
								const formatFunc = formatValueFunctions[key];
								value = formatFunc
									? formatFunc(row, classes, totalUniquePageViews)
									: row[key];

								return value;
							})}
						</PageViewsRow>
					);
				})
			) : (
				<div className={classes.emptyStateRoot}>
					<div className={classes.emptyStateContainer}>
						<Typography className={classes.emptyStateTitle}>
							No Sales Source Data Available
						</Typography>
						<Typography className={classes.emptyStateMessage}>
							{salesSourceUnavailableMessage ||
								"There is no Sales Source data available yet. When a ticket is purchased, information on the source will show up here."}
						</Typography>
					</div>
				</div>
			)}
		</div>
	);
};

const ChartRender = ChartComponent => ({ resultSet, error }) =>
	(resultSet && <ChartComponent resultSet={resultSet}/>) ||
	(error && error.toString()) || <Loader/>;

const styles = theme => {
	return {
		emptyStateRoot: {
			display: "flex",
			justifyContent: "center"
		},
		emptyStateContainer: {
			marginTop: 40,
			maxWidth: 360
		},
		emptyStateTitle: {
			textAlign: "center",
			fontSize: 22,
			fontFamily: fontFamilyDemiBold
		},
		emptyStateMessage: {
			textAlign: "center",
			fontSize: 15,
			color: "#979797",
			marginTop: 15
		},
		percentText: {
			fontSize: 12,
			color: "#9DA3B4"
		},
		pageViewsTable: {
			[theme.breakpoints.down("xs")]: {
				minWidth: "200vw"
			}
		}
	};
};

class PageViewsTable extends Component {
	constructor(props) {
		super(props);
		this.state = {
			cubeJsApi: cubejs(props.token, {
				apiUrl: `${props.cubeApiUrl}/cubejs-api/v1`
			})
		};
	}

	render() {
		const { cubeJsApi } = this.state;
		const {
			startDate,
			endDate,
			timezone,
			salesSourceUnavailableMessage,
			classes
		} = this.props;

		const filters = [];

		if (startDate) {
			filters.push({
				dimension: "PageViews.date",
				operator: "gte",
				values: [
					startDate
						.clone()
						.utc()
						.format()
				]
			});
		}

		if (endDate) {
			filters.push({
				dimension: "PageViews.date",
				operator: "lt",
				values: [
					endDate
						.clone()
						.utc()
						.format()
				]
			});
		}

		return (
			<QueryRenderer
				query={{
					measures: [
						"PageViews.tickets",
						"PageViews.uniqueViews",
						"PageViews.conversionRate"
					],
					dimensions: ["PageViews.source", "PageViews.medium"],
					segments: [],
					order: {
						"PageViews.tickets": "desc",
						"PageViews.uniqueViews": "desc"
					},
					filters,
					timezone
				}}
				cubejsApi={cubeJsApi}
				render={ChartRender(props => (
					<TableRender
						{...props}
						classes={classes}
						salesSourceUnavailableMessage={salesSourceUnavailableMessage}
					/>
				))}
			/>
		);
	}
}

PageViewsTable.propTypes = {
	token: PropTypes.string.isRequired,
	cubeApiUrl: PropTypes.string.isRequired,
	startDate: PropTypes.object,
	endDate: PropTypes.object,
	timezone: PropTypes.string.isRequired,
	salesSourceUnavailableMessage: PropTypes.string
};

export default withStyles(styles)(PageViewsTable);
