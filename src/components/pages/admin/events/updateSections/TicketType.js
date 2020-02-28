import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import {
	withStyles,
	Typography,
	InputAdornment,
	Collapse,
	Hidden,
	Grid
} from "@material-ui/core";
import classnames from "classnames";
import Bn from "bn-api-node";

import InputGroup from "../../../../common/form/InputGroup";
import Button from "../../../../elements/Button";
import IconButton from "../../../../elements/IconButton";
import DateTimePickerGroup from "../../../../common/form/DateTimePickerGroup";
import PricePoint from "./PricePoint";
import eventUpdateStore from "../../../../../stores/eventUpdate";
import user from "../../../../../stores/user";
import SelectGroup from "../../../../common/form/SelectGroup";
import { dollars } from "../../../../../helpers/money";
import CheckBox from "../../../../elements/form/CheckBox";
import RadioButton from "../../../../elements/form/RadioButton";
import moment from "moment-timezone";

const styles = theme => {
	return {
		root: {
			paddingLeft: theme.spacing.unit * 12,
			paddingRight: theme.spacing.unit * 2,

			[theme.breakpoints.down("sm")]: {
				paddingRight: theme.spacing.unit,
				paddingLeft: theme.spacing.unit
			}
		},
		ticketHeader: {
			display: "flex",
			justifyContent: "space-between"
		},
		inactiveContent: {
			paddingTop: theme.spacing.unit * 2,
			paddingBottom: theme.spacing.unit * 2
		},
		activeContent: {
			paddingTop: theme.spacing.unit * 3,
			paddingBottom: theme.spacing.unit * 3
		},
		title: {
			textTransform: "uppercase",
			fontFamily: "TTCommons-DemiBold"
		},
		simpleInputContainer: {
			paddingRight: theme.spacing.unit * 4,

			[theme.breakpoints.down("sm")]: {
				paddingRight: theme.spacing.unit
			}
		},
		additionalInputContainer: {
			paddingRight: theme.spacing.unit * 4,
			alignItems: "center",

			[theme.breakpoints.down("sm")]: {
				paddingRight: theme.spacing.unit
			}
		},
		inactive: {
			opacity: 0.5
		},
		boxOfficeAvailabilityCheckboxContainer: {
			display: "flex"
		}
	};
};

const FormHeading = ({ className, children }) => (
	<Typography className={className} variant="subheading">
		{children}
	</Typography>
);

const TicketHeading = ({
	classes,
	index,
	name,
	onEditClick,
	deleteTicketType,
	active,
	isCancelled,
	onMoveUp,
	onMoveDown
}) => (
	<div className={classes.ticketHeader}>
		<FormHeading
			className={classnames({
				[classes.title]: true,
				[classes.inactive]: isCancelled
			})}
		>
			{name
				? `${index + 1}. ${name}${isCancelled ? " (Cancelled)" : ""}`
				: "Add your new ticket"}
		</FormHeading>
		{isCancelled ? (
			<div>
				<IconButton
					onClick={onEditClick}
					iconUrl={`/icons/${active ? "up-active" : "down-gray"}.svg`}
				>
					Expand
				</IconButton>
			</div>
		) : (
			<div>
				<IconButton
					onClick={onMoveUp}
					iconUrl={`/icons/up-gray.svg`}
					disabled={!onMoveUp}
				>
					Move up
				</IconButton>
				<IconButton
					onClick={onMoveDown}
					iconUrl={`/icons/down-gray.svg`}
					disabled={!onMoveDown}
				>
					Move down
				</IconButton>
				<IconButton
					onClick={onEditClick}
					iconUrl={`/icons/edit-${active ? "active" : "gray"}.svg`}
				>
					Edit
				</IconButton>
				<IconButton onClick={deleteTicketType} iconUrl="/icons/delete-gray.svg">
					Delete
				</IconButton>
			</div>
		)}
	</div>
);

const InactiveContent = props => {
	const { classes, onEditClick, deleteTicketType } = props;
	return (
		<div className={classes.inactiveContent}>
			<TicketHeading {...props}/>
		</div>
	);
};

const TicketDetails = observer(props => {
	const {
		id,
		index,
		classes,
		errors,
		validateFields,
		updateTicketType,
		name,
		capacity,
		saleStartTimeOption,
		startDate,
		startTime,
		saleEndTimeOption,
		endDate,
		endTime,
		priceAtDoor,
		increment,
		limitPerPerson,
		description,
		pricing,
		eventStartDate,
		ticketTimesDirty,
		priceForDisplay,
		visibility,
		autoFocus,
		isCancelled,
		parentId,
		ticketTypes,
		showMaxTicketsPerCustomer,
		showVisibility,
		showCartQuantityIncrement,
		showAdditionalFee,
		additionalFeeInDollars,
		onChangeDate,
		appSalesEnabled,
		webSalesEnabled,
		boxOfficeSalesEnabled
	} = props;

	const pricingErrors = errors && errors.pricing ? errors.pricing : {};

	//If we have errors with fields under 'additional options' or 'schedule a price change', then we need to force fields to be visible
	let { showAdditionalOptions, showPricing } = props;

	if (errors && Object.keys(errors).length > 0) {
		//Check if error is not with name, capacity, priceForDisplay. If there are other errors then show additional options.
		Object.keys(errors).forEach(errorKey => {
			if (
				errorKey !== "name" &&
				errorKey !== "capacity" &&
				errorKey !== "priceForDisplay"
			) {
				showAdditionalOptions = true;
			}
		});

		if (Object.keys(pricingErrors).length > 0) {
			showAdditionalOptions = true;
			showPricing = true;
		}
	}

	const parentTicketTypes = ticketTypes
		.map((tt, i) => {
			return {
				index: i,
				inner: tt
			};
		})
		// Cannot choose yourself, and cannot choose a ticket type that is parented to yourself
		.filter(
			tt =>
				tt.index !== index &&
				(tt.inner.parentId || -1) !== index &&
				(tt.inner.parentId || "") !== id &&
				tt.inner.status !== "Cancelled"
		);

	const ticketTypeVisibilitiesEnum = Bn.Enums ? Bn.Enums.VISIBILITY : {};

	const visibilitySelectOptions = [];
	Object.keys(ticketTypeVisibilitiesEnum).forEach(visKey => {
		visibilitySelectOptions.push({
			value: visKey,
			label: ticketTypeVisibilitiesEnum[visKey]
		});
	});

	const timezone = eventUpdateStore.timezone
		? eventUpdateStore.timezone
		: user.currentOrgTimezone;

	const onShowAdditionalOptions = () => {
		updateTicketType(index, {
			showAdditionalOptions: true
		});
	};

	const showCustomStartTimes = saleStartTimeOption === "custom";
	const showStartSaleWhenTicketSaleEnds = saleStartTimeOption === "parent";

	const showCustomEndTime = saleEndTimeOption === "custom";

	const saleStartOptions = [
		{
			value: "immediately",
			label: "Immediately"
		},
		{
			value: "custom",
			label: "At a specific time"
		}
	];

	if (parentTicketTypes.length > 0) {
		saleStartOptions.push({
			value: "parent",
			label: "When sales end for..."
		});
	}

	const allAvailabilitySelected =
		appSalesEnabled && webSalesEnabled && boxOfficeSalesEnabled;
	const onlineSalesEnabledSelected =
		webSalesEnabled && appSalesEnabled && !allAvailabilitySelected;
	const boxOfficeSalesEnabledSelected =
		boxOfficeSalesEnabled && !allAvailabilitySelected;

	const onSelectAllChannelsAvailable = () => {
		updateTicketType(index, {
			appSalesEnabled: true,
			webSalesEnabled: true,
			boxOfficeSalesEnabled: true
		});
	};

	const onSelectOnlineOnlyAvailable = () => {
		updateTicketType(index, {
			appSalesEnabled: true,
			webSalesEnabled: true,
			boxOfficeSalesEnabled: false
		});
	};

	const onSelectBoxOfficeOnly = () => {
		updateTicketType(index, {
			appSalesEnabled: false,
			webSalesEnabled: false,
			boxOfficeSalesEnabled: true
		});
	};

	return (
		<div className={classes.activeContent}>
			<TicketHeading {...props}/>

			<Grid container spacing={32}>
				<Grid className={classes.simpleInputContainer} item xs={12} sm={6}>
					<InputGroup
						disabled={isCancelled}
						autoFocus={autoFocus}
						error={errors.name}
						value={name}
						name="name"
						label="Ticket name *"
						placeholder="General Admission"
						type="text"
						onChange={e => {
							updateTicketType(index, {
								name: e.target.value
							});
						}}
						onBlur={validateFields}
					/>
				</Grid>

				<Grid className={classes.simpleInputContainer} item xs={6} sm={3}>
					<InputGroup
						disabled={isCancelled}
						error={errors.capacity}
						value={capacity || ""}
						name="capacity"
						label="Qty *"
						placeholder="1"
						type="number"
						onChange={e => {
							updateTicketType(index, {
								capacity: e.target.value
							});
						}}
						onBlur={validateFields}
					/>
				</Grid>

				<Grid className={classes.simpleInputContainer} item xs={6} sm={3}>
					<InputGroup
						disabled={isCancelled}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">$</InputAdornment>
							)
						}}
						error={errors.priceForDisplay}
						value={priceForDisplay}
						name="value"
						label="Price *"
						placeholder=""
						type="number"
						onChange={e => {
							updateTicketType(index, {
								priceForDisplay: e.target.value
							});
						}}
						onBlur={validateFields}
					/>
				</Grid>
			</Grid>

			{!showAdditionalOptions ? (
				<div>
					<Hidden mdUp>
						<Button
							style={{
								width: "100%"
							}}
							variant="additional"
							onClick={onShowAdditionalOptions}
						>
							Additional options
						</Button>
					</Hidden>
					<Hidden smDown>
						<Button variant="additional" onClick={onShowAdditionalOptions}>
							Additional options
						</Button>
					</Hidden>
				</div>
			) : null}

			<Collapse in={!!showAdditionalOptions}>
				<Grid container spacing={32}>
					<Grid
						className={classes.additionalInputContainer}
						item
						xs={12}
						sm={6}
					>
						<SelectGroup
							disabled={isCancelled}
							value={saleStartTimeOption || "immediately"}
							items={saleStartOptions}
							name={"sales-start-times"}
							label={"Sales start *"}
							onChange={e => {
								updateTicketType(index, {
									saleStartTimeOption: e.target.value,
									startDate: e.target.value !== "custom" ? null :  startDate ? startDate : moment.utc().tz(timezone),
									startTime: e.target.value !== "custom" ? null : startTime ? startTime : startDate ? startDate : moment.utc().tz(timezone).startOf("hour"),
									parentId:
										e.target.value === "parent"
											? parentTicketTypes[0].inner.id ||
											  parentTicketTypes[0].index
											: null
								});
							}}
						/>
					</Grid>

					{showCustomStartTimes ? (
						<Grid
							className={classes.additionalInputContainer}
							item
							xs={6}
							sm={3}
						>
							<DateTimePickerGroup
								disabled={isCancelled}
								error={errors.startDate}
								value={startDate}
								name="startDate.date"
								label="Start date *"
								type="date"
								onChange={startDate => {
									onChangeDate();
									updateTicketType(index, {
										parentId: null,
										startDate
									});
								}}
								onBlur={validateFields}
								minDate={false}
							/>
						</Grid>
					) : null}

					{showCustomStartTimes ? (
						<Grid
							className={classes.additionalInputContainer}
							item
							xs={6}
							sm={3}
						>
							<DateTimePickerGroup
								disabled={isCancelled}
								error={errors.startTime}
								value={startTime}
								name="startTime"
								label="Start time *"
								type="time"
								onChange={startTime => {
									onChangeDate();
									updateTicketType(index, {
										parentId: null,
										startTime
									});
								}}
								onBlur={validateFields}
								minDate={false}
							/>
						</Grid>
					) : null}

					{showStartSaleWhenTicketSaleEnds ? (
						<Grid
							className={classes.additionalInputContainer}
							item
							xs={12}
							sm={6}
						>
							<SelectGroup
								disabled={isCancelled}
								error={errors.parentId}
								value={parentId}
								name="parentId"
								label="Select ticket type *"
								items={parentTicketTypes.map(tt => {
									return {
										value: tt.inner.id || tt.index,
										label: tt.inner.name
									};
								})}
								onChange={e =>
									updateTicketType(index, {
										parentId: e.target.value,
										startDate: null,
										startTime: null
									})
								}
							/>
						</Grid>
					) : null}
				</Grid>

				<Grid container spacing={32}>
					<Grid
						className={classes.additionalInputContainer}
						item
						xs={12}
						sm={6}
					>
						<SelectGroup
							disabled={isCancelled}
							value={saleEndTimeOption || "close"}
							items={[
								{
									value: "door",
									label: "Door Time"
								},
								{
									value: "start",
									label: "Event Start"
								},
								{
									value: "close",
									label: "Event End"
								},
								{
									value: "custom",
									label: "At a specific time"
								}
							]}
							name={"close-times"}
							label={"Sales end *"}
							onChange={e => {
								updateTicketType(index, {
									saleEndTimeOption: e.target.value
								});
							}}
						/>
					</Grid>

					{showCustomEndTime ? (
						<Grid
							className={classes.additionalInputContainer}
							item
							xs={6}
							sm={3}
						>
							<DateTimePickerGroup
								disabled={isCancelled}
								error={errors.endDate}
								value={endDate}
								name="endDate"
								type="date"
								label="End date *"
								onChange={endDate => {
									onChangeDate();
									updateTicketType(index, {
										endDate
									});
								}}
								onBlur={validateFields}
								minDate={false}
							/>
						</Grid>
					) : null}

					{showCustomEndTime ? (
						<Grid
							className={classes.additionalInputContainer}
							item
							xs={6}
							sm={3}
						>
							<DateTimePickerGroup
								disabled={isCancelled}
								error={errors.endTime}
								value={endTime}
								name="endTime"
								type="time"
								label="End time *"
								onChange={endTime => {
									onChangeDate();
									updateTicketType(index, {
										endTime
									});
								}}
								onBlur={validateFields}
								minDate={false}
							/>
						</Grid>
					) : null}
				</Grid>

				<Grid container spacing={32}>
					{/*<div className={classes.additionalInputContainer}>*/}
					{/*	<InputGroup*/}
					{/*		disabled={isCancelled}*/}
					{/*		InputProps={{*/}
					{/*			startAdornment: (*/}
					{/*				<InputAdornment position="start">$</InputAdornment>*/}
					{/*			)*/}
					{/*		}}*/}
					{/*		error={errors.priceAtDoor}*/}
					{/*		value={priceAtDoor}*/}
					{/*		name="value"*/}
					{/*		label="Price at door"*/}
					{/*		placeholder=""*/}
					{/*		type="number"*/}
					{/*		onChange={e => {*/}
					{/*			updateTicketType(index, { priceAtDoor: e.target.value });*/}
					{/*		}}*/}
					{/*		onBlur={validateFields}*/}
					{/*	/>*/}
					{/*</div>*/}
					<Grid className={classes.additionalInputContainer} item xs={12}>
						<InputGroup
							disabled={isCancelled}
							error={errors.description}
							value={description}
							name="description"
							label="Ticket description"
							placeholder="Short description of this ticket type"
							type="text"
							onChange={e => {
								updateTicketType(index, {
									description: e.target.value
								});
							}}
							onBlur={validateFields}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={32}>
					<Grid
						className={classes.additionalInputContainer}
						item
						xs={12}
						sm={6}
					>
						<Collapse in={!showMaxTicketsPerCustomer}>
							<Button
								variant="additional"
								onClick={() => {
									updateTicketType(index, {
										showMaxTicketsPerCustomer: true
									});
								}}
							>
								Set max tix per customer
							</Button>
						</Collapse>

						<Collapse in={showMaxTicketsPerCustomer}>
							<InputGroup
								disabled={isCancelled}
								error={errors.limitPerPerson}
								value={limitPerPerson}
								name="maxTicketsPerCustomer"
								label="Max tickets per customer"
								placeholder=""
								type="number"
								onChange={e => {
									updateTicketType(index, {
										limitPerPerson: e.target.value
									});
								}}
								onBlur={validateFields}
							/>
						</Collapse>
					</Grid>
				</Grid>

				<Grid container spacing={32}>
					<Grid
						className={classes.additionalInputContainer}
						item
						xs={12}
						sm={6}
					>
						<Collapse in={!showVisibility}>
							<Button
								variant="additional"
								onClick={() => {
									updateTicketType(index, {
										showVisibility: true
									});
								}}
							>
								Set visibility/access rules
							</Button>
						</Collapse>

						<Collapse in={showVisibility}>
							<SelectGroup
								disabled={isCancelled}
								value={visibility || "Always"}
								items={visibilitySelectOptions}
								name={"visibility"}
								label={"Visibility *"}
								onChange={e => {
									updateTicketType(index, {
										visibility: e.target.value
									});
								}}
							/>
						</Collapse>
					</Grid>
				</Grid>

				<Collapse in={showVisibility}>
					<Grid container spacing={32}>
						<Grid
							className={classes.additionalInputContainer}
							item
							xs={12}
							sm={12}
						>
							<FormHeading>Point of sale availability</FormHeading>
							<br/>
							<div className={classes.boxOfficeAvailabilityCheckboxContainer}>
								<RadioButton
									name={"allSalesEnabled"}
									active={allAvailabilitySelected}
									onClick={onSelectAllChannelsAvailable}
								>
									All
								</RadioButton>
								<RadioButton
									name={"onlineSalesEnabled"}
									active={onlineSalesEnabledSelected}
									onClick={onSelectOnlineOnlyAvailable}
								>
									Online only
								</RadioButton>
								<RadioButton
									name={"boxOfficeSalesEnabled"}
									active={!!boxOfficeSalesEnabledSelected}
									onClick={onSelectBoxOfficeOnly}
								>
									Box office only
								</RadioButton>
							</div>
						</Grid>
					</Grid>
				</Collapse>

				<div style={{ marginTop: 20 }}/>

				<Grid container spacing={32}>
					<Grid
						className={classes.additionalInputContainer}
						item
						xs={12}
						sm={6}
					>
						<Collapse in={!showCartQuantityIncrement}>
							<Button
								variant="additional"
								onClick={() => {
									updateTicketType(index, {
										showCartQuantityIncrement: true
									});
								}}
							>
								Enforce qty increment
							</Button>
						</Collapse>

						<Collapse in={showCartQuantityIncrement}>
							<InputGroup
								disabled={isCancelled}
								error={errors.increment}
								value={increment}
								name="increment"
								label="Cart quantity increment"
								placeholder=""
								type="number"
								onChange={e => {
									updateTicketType(index, {
										increment: e.target.value
									});
								}}
								onBlur={validateFields}
							/>
						</Collapse>
					</Grid>
				</Grid>

				<Grid container spacing={32}>
					<Grid
						className={classes.additionalInputContainer}
						item
						xs={12}
						sm={6}
					>
						<Collapse in={!showAdditionalFee}>
							<Button
								variant="additional"
								onClick={() => {
									updateTicketType(index, {
										showAdditionalFee: true
									});
								}}
							>
								Increase service fee/rev share
							</Button>
						</Collapse>

						<Collapse in={showAdditionalFee}>
							<InputGroup
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">$</InputAdornment>
									)
								}}
								disabled={isCancelled}
								error={errors.additionalFeeInDollars}
								value={additionalFeeInDollars}
								name="additionalFeeInDollars"
								label={`Per ticket fee increase ${
									eventUpdateStore.maxTicketTypeAdditionalFeeInCents
										? `(Max ${dollars(
											eventUpdateStore.maxTicketTypeAdditionalFeeInCents,
											true
										  )})`
										: ""
								}`}
								placeholder=""
								type="text"
								onChange={e => {
									updateTicketType(index, {
										additionalFeeInDollars: e.target.value
									});
								}}
								onBlur={validateFields}
							/>
						</Collapse>
					</Grid>
				</Grid>

				<br/>
				<br/>

				{!showPricing && !isCancelled && saleStartTimeOption !== "parent" ? (
					<div>
						<FormHeading className={classes.title}>
							Scheduled Price Changes
						</FormHeading>

						<Button
							variant="additional"
							onClick={() => {
								eventUpdateStore.addTicketPricing(index);
								updateTicketType(index, {
									showPricing: true
								});
							}}
						>
							Schedule a price change
						</Button>
					</div>
				) : null}

				<Collapse in={!!showPricing}>
					{pricing.map((pricePoint, pricePointIndex) => {
						return (
							<div key={pricePointIndex}>
								<FormHeading className={classes.title}>
									Scheduled price change {pricePointIndex + 1}
								</FormHeading>
								<PricePoint
									isCancelled={isCancelled}
									updatePricePointDetails={pricePointDetails => {
										const updatedPricePoint = {
											...pricePoint,
											...pricePointDetails
										};
										const updatedPricing = pricing;
										updatedPricing[pricePointIndex] = updatedPricePoint;

										updateTicketType(index, {
											pricing: updatedPricing
										});
									}}
									errors={pricingErrors[pricePointIndex] || {}}
									validateFields={validateFields}
									onDelete={() =>
										eventUpdateStore.removeTicketPricing(index, pricePointIndex)
									}
									{...pricePoint}
								/>
							</div>
						);
					})}
					{!isCancelled ? (
						<Button
							variant="additional"
							onClick={() => eventUpdateStore.addTicketPricing(index)}
						>
							Schedule a price change
						</Button>
					) : null}
				</Collapse>
			</Collapse>
		</div>
	);
});

const TicketType = props => {
	const { classes, active } = props;

	return (
		<div className={classes.root}>
			{active ? <TicketDetails {...props}/> : <InactiveContent {...props}/>}
		</div>
	);
};

TicketType.propTypes = {
	classes: PropTypes.object.isRequired,
	onEditClick: PropTypes.func.isRequired,
	deleteTicketType: PropTypes.func.isRequired,
	index: PropTypes.number.isRequired,
	name: PropTypes.string,
	active: PropTypes.bool,
	errors: PropTypes.object.isRequired,
	validateFields: PropTypes.func.isRequired,
	updateTicketType: PropTypes.func.isRequired,
	ticketTimesDirty: PropTypes.bool,
	eventStartDate: PropTypes.object,
	startDate: PropTypes.object,
	startTime: PropTypes.object,
	visibility: PropTypes.string,
	isCancelled: PropTypes.bool,
	parentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	ticketTypes: PropTypes.array,
	onChangeDate: PropTypes.func.isRequired,
	onMoveUp: PropTypes.func,
	onMoveDown: PropTypes.func
	//id: PropTypes.string,
	//capacity
	//endDate
	//increment
	//pricing
	//startDate
};

export default withStyles(styles)(TicketType);
