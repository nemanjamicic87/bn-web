import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import moment from "moment-timezone";
import { observer } from "mobx-react";

import Button from "../../../../elements/Button";
import { fontFamilyDemiBold, secondaryHex } from "../../../../../config/theme";
import notifications from "../../../../../stores/notifications";
import Loader from "../../../../elements/loaders/Loader";
import Bigneon from "../../../../../helpers/bigneon";
import GrandTotalsTable from "./GrandTotalsTable";
import Card from "../../../../elements/Card";
import getUrlParam from "../../../../../helpers/getUrlParam";
import AdjustmentDialog from "./AdjustmentDialog";
import AdjustmentsList from "./AdjustmentsList";
import Bn from "bn-api-node";
import SingleEventSettlement from "./SingleEventSettlement";
import splitByCamelCase from "../../../../../helpers/splitByCamelCase";
import downloadCSV from "../../../../../helpers/downloadCSV";
import { dollars } from "../../../../../helpers/money";
import user from "../../../../../stores/user";
import DeleteDialog from "./DeleteDialog";

const statusEnums = Bn.Enums.SETTLEMENT_STATUS;
const typeEnums = Bn.Enums.ADJUSTMENT_TYPES;

const styles = theme => ({
	root: {
		padding: theme.spacing.unit * 4,
		marginBottom: theme.spacing.unit
	},
	boldText: {
		fontFamily: fontFamilyDemiBold
	},
	titleSection: {
		marginBottom: 25
	},
	title: {
		fontFamily: fontFamilyDemiBold,
		fontSize: 28,
		marginBottom: theme.spacing.unit,
		textTransform: "capitalize"
	},
	subtitle: {
		fontFamily: fontFamilyDemiBold,
		color: secondaryHex,
		textTransform: "uppercase",
		fontSize: 13,
		marginBottom: theme.spacing.unit
	}
});

@observer
class SettlementReport extends Component {
	constructor(props) {
		super(props);

		this.state = {
			orgName: "",
			adjustments: null,
			event_entries: null,
			settlement: null,
			grandTotals: null,

			showAdjustmentDialog: false
		};
	}

	componentDidMount() {
		const settlementId = getUrlParam("id") || this.props.settlementId;
		if (!settlementId) {
			return notifications.show({
				message: "Report not found.",
				variant: "error"
			});
		}

		this.setState({ settlementId }, () => {
			this.loadSettlementDetails(this.props.onLoad);
			this.loadOrgDetails();
		});
	}

	loadSettlementDetails(onSuccess = () => {}) {
		//If we have an ID, load those details instead of allowing them to set dates

		const { settlementId } = this.state;

		Bigneon()
			.settlements.read({ id: settlementId })
			.then(response => {
				const { adjustments, event_entries, settlement } = response.data;

				const { start_time, end_time } = settlement;

				const { organizationTimezone } = this.props;

				const dateFormat = "MMM D, YYYY";
				const dateTimeFormat = "MMM D, YYYY, h:mm A z";

				const startDate = moment.utc(start_time).tz(organizationTimezone);
				const endDate = moment.utc(end_time).tz(organizationTimezone);

				//Back one day if needed for display
				if (endDate.diff(startDate, "days") > 1) {
					endDate.add("d", -1);
				}

				const displayDateRange = `${startDate.format(
					dateFormat
				)} to ${endDate.format(dateFormat)}`;

				let adjustmentsInCents = 0;
				let totalFaceInCents = 0;
				let totalRevenueShareInCents = 0;
				let totalSettlementInCents = 0;

				event_entries.forEach(eventEntry => {
					const { entries } = eventEntry;
					entries.forEach(entry => {
						const {
							face_value_in_cents,
							revenue_share_value_in_cents,
							total_sales_in_cents,
							online_sold_quantity,
							fee_sold_quantity
						} = entry;

						totalFaceInCents =
							totalFaceInCents + face_value_in_cents * online_sold_quantity;
						totalRevenueShareInCents =
							totalRevenueShareInCents +
							revenue_share_value_in_cents * fee_sold_quantity;
						totalSettlementInCents =
							totalSettlementInCents + total_sales_in_cents;
					});
				});

				adjustments.forEach(adjustment => {
					const { amount_in_cents, created_at } = adjustment;
					adjustmentsInCents = adjustmentsInCents + amount_in_cents;
					adjustment.displayCreatedAt = moment
						.utc(created_at)
						.tz(organizationTimezone)
						.format(dateFormat);
				});

				totalSettlementInCents = totalSettlementInCents + adjustmentsInCents;

				const grandTotals = {
					adjustmentsInCents,
					totalFaceInCents,
					totalRevenueShareInCents,
					totalSettlementInCents
				};

				//Format dates in event_entries
				event_entries.forEach(({ event }) => {
					let timezone = organizationTimezone;
					if (event.venue && event.venue.timezone) {
						timezone = event.venue.timezone;
					}

					event.displayStartTime = moment
						.utc(event.event_start)
						.tz(timezone)
						.format(dateTimeFormat);
				});

				const eventList = event_entries.map(({ event }) => event);

				this.setState(
					{
						adjustments,
						event_entries,
						settlement: {
							...settlement,
							displayDateRange,
							isPostEventSettlement: settlement.only_finished_events
						},
						grandTotals,
						eventList
					},
					onSuccess
				);
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading settlement report failed."
				});
			});
	}

	loadOrgDetails() {
		const { organizationId } = this.props;

		Bigneon()
			.organizations.read({ id: organizationId })
			.then(response => {
				const { name: orgName, ...rest } = response.data;

				this.setState({ orgName });
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading organization details failed."
				});
			});
	}

	exportToCsv() {
		const {
			orgName,
			settlement,
			grandTotals,
			adjustments,
			eventList,
			event_entries
		} = this.state;

		const { displayDateRange, isPostEventSettlement } = settlement;

		const csvRows = [];

		csvRows.push([orgName, "Settlement Report"]);
		csvRows.push([
			`Settlement type: ${isPostEventSettlement ? "Post Event" : "Rolling"}`
		]);
		csvRows.push([
			`${
				isPostEventSettlement ? "Events" : "Sales occurring"
			} from ${displayDateRange}`
		]);

		csvRows.push([]);

		const {
			totalFaceInCents,
			totalRevenueShareInCents,
			adjustmentsInCents,
			onAddAdjustment,
			totalSettlementInCents
		} = grandTotals;

		csvRows.push(["Grand totals"]);
		csvRows.push(["Total Face", dollars(totalFaceInCents)]);
		csvRows.push(["Total revenue share", dollars(totalRevenueShareInCents)]);
		csvRows.push(["Adjustments", dollars(adjustmentsInCents)]);
		csvRows.push(["Total settlement", dollars(totalSettlementInCents)]);

		csvRows.push([]);
		csvRows.push(["Manual Adjustments"]);
		adjustments.map(adjustment => {
			const {
				id,
				amount_in_cents,
				displayCreatedAt,
				note,
				settlement_adjustment_type
			} = adjustment;

			csvRows.push([
				`${typeEnums[settlement_adjustment_type]} - ${displayCreatedAt}`,
				dollars(amount_in_cents),
				note
			]);
		});

		// csvRows.push([]);
		// csvRows.push([
		// 	`${
		// 		only_finished_events ? "Events" : "Sales occurring"
		// 	} from ${displayDateRange}`
		// ]);
		// csvRows.push([
		// 	"Event start Date/Time",
		// 	"Event End Date/Time",
		// 	"Venue",
		// 	"Event Name"
		// ]);
		//
		// eventList.forEach(event => {
		// 	const { displayStartTime, venue, name } = event;
		// 	csvRows.push([displayStartTime, venue.name, name]);
		// });

		csvRows.push([]);
		csvRows.push(["Event summary"]);
		csvRows.push([]);

		event_entries.forEach(({ event: eventDetails, entries }, index) => {
			const { displayStartTime, venue, name } = eventDetails;

			let totalOnlineSoldQuantity = 0;
			let totalFaceInCents = 0;
			let totalRevShareInCents = 0;
			let totalSalesInCents = 0;

			csvRows.push([name]);
			csvRows.push([displayStartTime]);
			csvRows.push([venue.name]);

			csvRows.push([
				" ",
				"Face",
				"Rev share",
				"Online sold",
				"Total face",
				"Total rev share",
				"Total"
			]);

			entries.forEach(entry => {
				const {
					settlement_entry_type,
					ticket_type_name,
					face_value_in_cents,
					fee_sold_quantity,
					online_sold_quantity,
					revenue_share_value_in_cents,
					total_sales_in_cents
				} = entry;

				totalOnlineSoldQuantity =
					totalOnlineSoldQuantity + online_sold_quantity;
				totalFaceInCents =
					totalFaceInCents + face_value_in_cents * online_sold_quantity;
				totalRevShareInCents =
					totalRevShareInCents +
					revenue_share_value_in_cents * fee_sold_quantity;
				totalSalesInCents = totalSalesInCents + total_sales_in_cents;

				let description = ticket_type_name;
				if (
					!description &&
					settlement_entry_type &&
					settlement_entry_type !== "TicketType"
				) {
					description = splitByCamelCase(settlement_entry_type);
				}

				csvRows.push([
					description,
					dollars(face_value_in_cents),
					dollars(revenue_share_value_in_cents),
					online_sold_quantity,
					dollars(face_value_in_cents * online_sold_quantity),
					dollars(revenue_share_value_in_cents * fee_sold_quantity),
					dollars(total_sales_in_cents)
				]);
			});

			csvRows.push([
				"Total",
				"",
				"",
				totalOnlineSoldQuantity,
				dollars(totalFaceInCents),
				dollars(totalRevShareInCents),
				dollars(totalSalesInCents)
			]);
		});

		downloadCSV(csvRows, "settlement-report");
	}

	onCloseAdjustmentDialog() {
		this.setState({ showAdjustmentDialog: false });
	}

	onAdjustmentAdded() {
		this.onCloseAdjustmentDialog();
		this.loadSettlementDetails();
	}

	renderTitleSection() {
		const { classes } = this.props;

		const { settlement } = this.state;

		const { displayDateRange, isPostEventSettlement } = settlement;

		return (
			<div className={classes.titleSection}>
				<Typography className={classes.subtitle}>Settlement report</Typography>
				<Typography>
					Settlement type:{" "}
					<span className={classes.boldText}>
						{isPostEventSettlement ? "Post Event" : "Rolling"}
					</span>
				</Typography>
				<Typography>
					{isPostEventSettlement ? "Events" : "Sales occurring"} from{" "}
					<span className={classes.boldText}>{displayDateRange}</span>
				</Typography>
				{/*<Typography>*/}
				{/*	Status:{" "}*/}
				{/*	<span className={classes.boldText}>{statusEnums[status]}</span>*/}
				{/*</Typography>*/}
			</div>
		);
	}

	renderReportContent() {
		const { classes, printVersion } = this.props;

		const {
			settlement,
			event_entries,
			adjustments,
			grandTotals,
			eventList
		} = this.state;

		const { isPostEventSettlement, displayDateRange } = settlement;

		let onAddAdjustment = null;
		if (!printVersion && user.isAdmin) {
			onAddAdjustment = () => this.setState({ showAdjustmentDialog: true });
		}

		return (
			<React.Fragment>
				<Typography className={classes.title}>Grand totals</Typography>
				<GrandTotalsTable onAddAdjustment={onAddAdjustment} {...grandTotals}/>

				{adjustments && adjustments.length > 0 ? (
					<React.Fragment>
						<AdjustmentsList adjustments={adjustments} refreshAdjustments={this.onAdjustmentAdded.bind(this)}/> <br/>
						<br/>
					</React.Fragment>
				) : null}

				{/*{eventList && eventList.length > 0 ? (*/}
				{/*	<React.Fragment>*/}
				{/*		<EventListTable*/}
				{/*			eventList={eventList}*/}
				{/*			displayDateRange={displayDateRange}*/}
				{/*			isPostEventSettlement={isPostEventSettlement}*/}
				{/*		/>*/}
				{/*		<br/>*/}
				{/*		<br/>*/}
				{/*	</React.Fragment>*/}
				{/*) : null}*/}

				<Typography className={classes.title}>Event summary</Typography>

				{!event_entries || event_entries.length === 0 ? (
					<Typography>No events</Typography>
				) : (
					event_entries.map(({ event: eventDetails, entries }, index) => (
						<SingleEventSettlement
							key={index}
							eventDetails={eventDetails}
							entries={entries}
						/>
					))
				)}
			</React.Fragment>
		);
	}

	render() {
		const { classes, printVersion } = this.props;
		const { settlement, showAdjustmentDialog, settlementId } = this.state;

		if (!settlement) {
			return <Loader>Loading settlement report...</Loader>;
		}

		if (printVersion) {
			return (
				<React.Fragment>
					{this.renderTitleSection()}
					{this.renderReportContent()}
				</React.Fragment>
			);
		}

		return (
			<Card variant={"block"}>
				{settlementId ? (
					<AdjustmentDialog
						settlementId={settlementId}
						open={showAdjustmentDialog}
						onClose={this.onCloseAdjustmentDialog.bind(this)}
						onSuccess={this.onAdjustmentAdded.bind(this)}
					/>
				) : null}
				<div className={classes.root}>
					<div
						style={{
							display: "flex",
							minHeight: 40,
							alignItems: "center"
						}}
					>
						{this.renderTitleSection()}

						<span style={{ flex: 1 }}/>
						<Button
							iconUrl="/icons/pdf-active.svg"
							variant="text"
							target={"_blank"}
							href={`/exports/reports/?type=settlement&settlement_id=${
								settlement.id
							}`}
						>
							Export PDF
						</Button>
						<Button
							iconUrl="/icons/csv-active.svg"
							variant="text"
							onClick={this.exportToCsv.bind(this)}
						>
							Export CSV
						</Button>
					</div>

					{this.renderReportContent()}
				</div>
			</Card>
		);
	}
}

SettlementReport.propTypes = {
	classes: PropTypes.object.isRequired,
	organizationId: PropTypes.string.isRequired,
	organizationTimezone: PropTypes.string.isRequired,
	onLoad: PropTypes.func,
	printVersion: PropTypes.bool
};

export default withStyles(styles)(SettlementReport);
