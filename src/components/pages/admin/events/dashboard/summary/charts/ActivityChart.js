import React, { Component } from "react";
import cubejs from "@cubejs-client/core";
import { QueryRenderer } from "@cubejs-client/react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Hidden, Typography } from "@material-ui/core";
import DoughnutChart from "./DoughnutChart";
import {
	fontFamilyDemiBold,
	primaryHex,
	secondaryHex
} from "../../../../../../../config/theme";
import LegendRow from "./LegendRow";

const COLORS_SERIES = ["#00F1B9", "#008CF1", primaryHex, secondaryHex];

const styles = theme => {
	return {
		root: {
			display: "flex",
			flex: 1,
			justifyContent: "flex-start",

			[theme.breakpoints.down("md")]: {
				flexDirection: "column",
				justifyContent: "center"
			}
		},
		legendContainer: {
			flex: 3,
			display: "flex",
			flexDirection: "column",
			justifyContent: "flex-start",

			marginTop: 20,
			marginBottom: 30,
			paddingLeft: 0,
			paddingRight: 0,

			//Desktop
			[theme.breakpoints.up("sm")]: {
				marginTop: 0,
				marginBottom: 0,
				paddingLeft: 0,
				paddingRight: 20
			}
		},
		legendTitle: {
			fontFamily: fontFamilyDemiBold,
			fontSize: 17,
			marginBottom: 10,
			textAlign: "center",

			[theme.breakpoints.up("sm")]: {
				textAlign: "left",
				marginBottom: 16
			}
		}
	};
};

const appendMissingDatasets = (resultSet, legendKeyMap) => {
	if (!resultSet || !resultSet.loadResponse) {
		return resultSet;
	}

	const { loadResponse } = resultSet;
	const { data, query } = loadResponse;
	data.forEach(entry => {
		const elements = Object.keys(entry);

		if (elements.length < 2) {
			return;
		}

		const key = entry[elements[0]];

		if (key === "No data") {
			return;
		}

		if (legendKeyMap[key]) {
			entry[elements[0]] = legendKeyMap[key];
			legendKeyMap[key] = null;
		}
	});

	//Append entries from legendKeyMap
	Object.keys(legendKeyMap).forEach(key => {
		const label = legendKeyMap[key];
		if (label == null || data.find(x => x[query.dimensions[0]] === label)) {
			//Don't append ones we've used just above
			return;
		}

		if (
			!query.measures ||
			!query.dimensions ||
			query.measures < 1 ||
			query.dimensions < 1
		) {
			return;
		}

		data.push({
			[query.dimensions[0]]: label,
			[query.measures[0]]: "0"
		});
	});

	resultSet.loadResponse = { ...loadResponse, data };

	return resultSet;
};

const LegendRows = ({ resultSet }) => {
	if (!resultSet || !resultSet.loadResponse) {
		return null;
	}

	const { data } = resultSet.loadResponse;

	let total = 0;

	const entries = [];
	data.forEach((entry, index) => {
		const elements = Object.keys(entry);

		if (elements.length < 2) {
			return;
		}

		const label = entry[elements[0]];

		if (label == "No data") {
			return;
		}

		const value = entry[elements[elements.length - 1]];
		total = total + Number(value);

		entries.push({
			label,
			value
		});
	});

	//Include all legend labels even if they're not in the dataset
	return entries.map(({ label, value }, index) => {
		const percent =
			total == 0 ? 0 : Math.round((value / total) * 100 * 100) / 100;

		return (
			<LegendRow
				key={index}
				color={COLORS_SERIES[index]}
				label={label}
				valueLabel={`${value}`}
				subValueLabel={`${percent}%`}
			/>
		);
	});
};

class ActivityChart extends Component {
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
			timezone,
			title,
			legendKeyMap,
			measures,
			dimensions,
			segments,
			classes,
			renewQuery
		} = this.props;

		const query = {
			measures,
			timeDimensions: [],
			dimensions,
			filters: [],
			timezone,
			renewQuery
		};

		if (segments) {
			query.segments = segments;
		}

		return (
			<QueryRenderer
				query={query}
				cubejsApi={cubeJsApi}
				render={props => {
					const { resultSet } = props;

					const completeResultSet = appendMissingDatasets(
						resultSet,
						legendKeyMap
					);

					return (
						<div className={classes.root}>
							<Hidden smUp>
								<Typography className={classes.legendTitle}>{title}</Typography>
							</Hidden>
							<DoughnutChart
								{...props}
								colors={COLORS_SERIES}
								resultSet={completeResultSet}
							/>
							<div className={classes.legendContainer}>
								<Hidden smDown>
									<Typography className={classes.legendTitle}>
										{title}
									</Typography>
								</Hidden>
								<LegendRows resultSet={completeResultSet}/>
							</div>
						</div>
					);
				}}
			/>
		);
	}
}

ActivityChart.propTypes = {
	token: PropTypes.string.isRequired,
	cubeApiUrl: PropTypes.string.isRequired,
	timezone: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	legendKeyMap: PropTypes.object.isRequired,
	measures: PropTypes.array.isRequired,
	dimensions: PropTypes.array.isRequired,
	segments: PropTypes.array,
	renewQuery: PropTypes.bool
};

export default withStyles(styles)(ActivityChart);
