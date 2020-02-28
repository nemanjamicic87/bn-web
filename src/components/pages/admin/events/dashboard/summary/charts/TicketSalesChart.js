// import "antd/dist/antd.css";
import React, { Component } from "react";
import cubejs from "@cubejs-client/core";
import { QueryRenderer } from "@cubejs-client/react";
import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";
import moment from "moment-timezone";
import Loader from "../../../../../../elements/loaders/Loader";
import TicketSalesTooltip from "./TicketSalesTooltip";
import getScreenWidth from "../../../../../../../helpers/getScreenWidth";
import { TIME_FORMAT_YYYY_MM_DD, TIME_FORMAT_DD_MMM } from "../../../../../../../helpers/time";

const COLORS_SERIES = ["#707CED"];
const FILL_SERIES = ["rgba(112,124,237,0.06)"];

class SalesLine extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showTooltip: false,
			tooltipTop: 0,
			tooltipLeft: 0,
			tooltipDateString: "",
			xaxisUnits: "days"
		};

		this.chartRef = React.createRef();
	}

	hideTooltip() {
		this.setState({ showTooltip: false });
	}

	setPositionAndData({ top, left, dateString }) {
		const {
			showTooltip,
			tooltipTop,
			tooltipLeft,
			tooltipDateString
		} = this.state;

		if (
			showTooltip == true &&
			tooltipTop == top &&
			tooltipLeft == left &&
			tooltipDateString == dateString
		) {
			return;
		}

		this.setState({
			showTooltip: true,
			tooltipTop: top,
			tooltipLeft: left,
			tooltipDateString: dateString
		});
	}

	render() {
		const {
			showTooltip,
			tooltipDateString,
			tooltipTop,
			tooltipLeft
		} = this.state;
		let { xaxisUnits } = this.state;
		const {
			resultSet,
			startDate,
			endDate,
			token,
			cubeApiUrl,
			timezone,
			cutOffDateString
		} = this.props;

		let borderWidth = 2;
		if (getScreenWidth() < 500) {
			borderWidth = 1;
		}

		const chartEnd =  moment.utc(endDate).isAfter(moment()) ? moment().add(1, "days") :  endDate;

		resultSet.categories().forEach( c => c.category = moment.utc(c.category).startOf("week").weekday(0));

		// Adjust the x-axis to display by days or weeks
		resultSet.series().forEach(function(s, index) {
			if(s.series.length >= 0){
				const firstDate = moment(s.series[0].category);
				const lastDate = moment(s.series[s.series.length - 1].category).startOf("day");
				const countDays = Math.abs(firstDate.diff(lastDate, "days"));

				if(countDays > 30) {
					xaxisUnits = "weeks";
				}
			}
		});

		const data = {
			labels: resultSet.categories().map(c => c.category),
			datasets: resultSet.series().map((s, index) => ({
				label: s.title,
				data: s.series.map(r => r.value),
				borderColor: COLORS_SERIES[index],
				backgroundColor: FILL_SERIES[index],
				fill: true,
				lineTension: 0,

				pointHitRadius: 20,
				pointRadius: s.series.map(r => (r.value === 0) ? 0 : 3),
				borderWidth,
				pointHoverRadius: 5,
				pointHoverBorderWidth: 2
			}))
		};
		const options = {
			legend: {
				display: false
			},
			elements: {
				point: {
					radius: 0,
					hitRadius: 20
				}
			},
			hover: {
				mode: "nearest",
				intersect: false
			},
			tooltips: {
				enabled: false,
				mode: "point",
				position: "nearest",
				intersect: false,
				custom: tooltipModel => {
					// hide the tooltip
					if (tooltipModel.opacity === 0) {
						//this.hideTooltip();
						return;
					}

					const position = this.chartRef.current.chartInstance.canvas.getBoundingClientRect();

					// set position of tooltip
					const left = Math.round(position.left + tooltipModel.caretX);
					const top = Math.round(position.top + tooltipModel.caretY);

					const { dataPoints } = tooltipModel;
					if (dataPoints.length > 0) {
						const { xLabel, yLabel } = dataPoints[0];

						this.setPositionAndData({
							top,
							left,
							dateString: xLabel
						});
					}
				}
			},
			scales: {
				xAxes: [
					{
						type: "time",
						gridLines: {
							display: false
						},
						ticks: {
							min: startDate,
							max: chartEnd,
							lineHeight: "14px",
							fontColor: "#2C3136",
							fontSize: "12px",
							callback: (label, index, labels) => {
								return moment(label, TIME_FORMAT_YYYY_MM_DD).format(TIME_FORMAT_DD_MMM);
							}
						},
						time: {
							unit: xaxisUnits
						}
					}
				],
				yAxes: [
					{
						gridLines: {
							color: "rgba(112,124,237,0.1)",
							borderDash: [5, 2],
							drawBorder: false
						},
						ticks: {
							min: 0,
							callback: function(label, index, labels) {
								if (Number(label) % 1 != 0) {
									return "";
								} else {
									return label;
								}
							}
						}
					}
				]
			},
			animation: {
				duration: 0
			},
			responsive: "true"
		};

		return (
			<div onMouseLeave={this.hideTooltip.bind(this)}>
				<Line data={data} options={options} ref={this.chartRef}/>
				{showTooltip ? (
					<TicketSalesTooltip
						token={token}
						cubeApiUrl={cubeApiUrl}
						dateString={tooltipDateString}
						top={tooltipTop}
						left={tooltipLeft}
						timezone={timezone}
						closeToolTip={this.hideTooltip.bind(this)}
						cutOffDateString={cutOffDateString}
					/>
				) : null}
			</div>
		);
	}
}

const SalesChart = Component => ({ resultSet, error }) =>
	(resultSet && <Component resultSet={resultSet}/>) ||
	(error && error.toString()) || <Loader/>;

class TicketSalesChart extends Component {
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
		const { startDate, endDate, timezone, token, cubeApiUrl, cutOffDateString } = this.props;

		return (
			<QueryRenderer
				query={{
					measures: ["OrderItems.ticketCount"],
					timeDimensions: [
						{
							dimension: "Orders.paidAt",
							granularity: "day"
						}
					],
					timezone
					// filters: [
					// 	{
					// 		dimension: "Orders.paidAt",
					// 		operator: "gt",
					// 		values: [startDate]
					// 	}
					// ]
				}}
				cubejsApi={cubeJsApi}
				render={SalesChart(props => (
					<SalesLine
						{...props}
						startDate={startDate}
						endDate={endDate}
						token={token}
						cubeApiUrl={cubeApiUrl}
						timezone={timezone}
						cutOffDateString={cutOffDateString}
					/>
				))}
			/>
		);
	}
}

TicketSalesChart.propTypes = {
	token: PropTypes.string.isRequired,
	startDate: PropTypes.string.isRequired,
	endDate: PropTypes.string.isRequired,
	cubeApiUrl: PropTypes.string.isRequired,
	timezone: PropTypes.string.isRequired,
	cutOffDateString: PropTypes.string
};

export default TicketSalesChart;
