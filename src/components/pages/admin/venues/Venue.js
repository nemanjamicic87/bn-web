import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Card from "@material-ui/core/Card";
import moment from "moment-timezone";

import InputGroup from "../../../common/form/InputGroup";
import SelectGroup from "../../../common/form/SelectGroup";
import Button from "../../../elements/Button";
import notifications from "../../../../stores/notifications";
import Bigneon from "../../../../helpers/bigneon";
import { validPhone } from "../../../../validators";
import PageHeading from "../../../elements/PageHeading";
import removePhoneFormatting from "../../../../helpers/removePhoneFormatting";
import cloudinaryWidget from "../../../../helpers/cloudinaryWidget";
import Settings from "../../../../config/settings";
import user from "../../../../stores/user";
import VenueOrganizationList from "./VenueOrganizationList";

class Venue extends Component {
	constructor(props) {
		super(props);

		//Check if we're editing an existing venue
		let venueId = null;
		if (props.match && props.match.params && props.match.params.id) {
			venueId = props.match.params.id;
		}

		this.state = {
			venueId,
			imageUrl: "",
			name: "",
			address: "",
			city: "",
			state: "",
			country: "United States",
			postal_code: "",
			place_id: "",
			phone: "",
			organizationId: "",
			timezone: moment.tz.guess(),
			organizations: null,
			errors: {},
			isSubmitting: false,
			showManualEntry: false,
			regionOptions: null,
			regionId: "none",
			states: [],
			venueOrganizations: [],
			existingVenueOrgLinks: []
		};
		this.removeOrgFromList = this.removeOrgFromList.bind(this);
	}

	componentDidMount() {
		const { venueId } = this.state;
		this.loadOrgs().then(() => {
			if (venueId) {
				this.loadVenue(venueId);
				this.loadVenueOrgLinks(venueId);
			}

			this.loadRegions();

			fetch(Settings().webUrl + "/countries.json")
				.then(response => response.json())
				.then(
					result => {
						const states = [];
						result.forEach(country => {
							if (country.name === "United States") {
								Object.keys(country.province_codes).forEach(code => {
									states.push({
										value: country.province_codes[code],
										label: code + " (" + country.province_codes[code] + ")"
									});
								});
							}
						});
						this.setState({ states });
					},
					error => {
						console.error(error);

						notifications.showFromErrorResponse({
							defaultMessage: "Loading states failed.",
							error
						});
					}
				);
		});
	}

	uploadWidget() {
		cloudinaryWidget(
			result => {
				const imgResult = result[0];
				const { secure_url } = imgResult;
				this.setState({ imageUrl: secure_url });
			},
			error => {
				console.error(error);

				notifications.show({
					message: "Image failed to upload.",
					variant: "error"
				});
			},
			["venue-images"],
			{
				cropping: true,
				cropping_coordinates_mode: "custom",
				cropping_aspect_ratio: 2.0
			}
		);
	}

	loadVenue(venueId) {
		Bigneon()
			.venues.read({ id: venueId })
			.then(response => {
				const {
					name,
					address,
					city,
					country,
					state,
					postal_code,
					phone,
					region_id,
					promo_image_url,
					timezone
				} = response.data;

				this.setState({
					name: name || "",
					address: address || "",
					city: city || "",
					country: country || "",
					state: state || "",
					postal_code: postal_code || "",
					phone: phone || "",
					regionId: region_id || "none",
					imageUrl: promo_image_url,
					timezone: timezone || moment.tz.guess()
				});
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					defaultMessage: "Loading venue details failed.",
					error
				});
			});
	}

	loadVenueOrgLinks(venueId) {
		const { organizations } = this.state;
		Bigneon()
			.venues.orgVenues.index({ id: venueId })
			.then(response => {
				const { data } = response.data;
				data.forEach(link => {
					link.name = this.findOrgById(
						link.organization_id,
						organizations
					).name;
				});
				this.setState({
					venueOrganizations: [...data],
					existingVenueOrgLinks: [...data]
				});
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					defaultMessage: "Loading org/venue links failed.",
					error
				});
			});
	}

	loadRegions() {
		Bigneon()
			.regions.index()
			.then(response => {
				const { data, paging } = response.data; //@TODO Implement pagination

				const regionOptions = [{ value: "none", label: "No Region" }].concat(
					data.map(r => ({
						value: r.id,
						label: r.name
					}))
				);

				this.setState({ regionOptions });
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					defaultMessage: "Loading regions failed.",
					error
				});
			});
	}

	loadOrgs() {
		return Bigneon()
			.organizations.index()
			.then(response => {
				const { data } = response.data;
				this.setState({ organizations: data });
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					defaultMessage: "Loading organizations failed.",
					error
				});
			});
	}

	async createVenueOrgLink(params) {
		try {
			await Bigneon().venues.orgVenues.create(params);
		} catch (e) {
			console.error(e);
			notifications.showFromErrorResponse({
				defaultMessage: "Venue/Org link failed.",
				e
			});
		}
	}

	async createNewVenue(params, onSuccess) {
		const { venueOrganizations } = this.state;
		this.setState({ isSubmitting: true });

		try {
			const {
				data: { id }
			} = await Bigneon().venues.create(params);
			if (venueOrganizations) {
				venueOrganizations.forEach(org => {
					// Venue org is automatically linked
					if (org.id !== params.organization_id) {
						this.createVenueOrgLink({
							venue_id: id,
							organization_id: org.organization_id
						});
					}
				});
				this.setState({ isSubmitting: false });
				onSuccess(id);
			}
		} catch (e) {
			console.error(e);
			this.setState({ isSubmitting: false });
			notifications.showFromErrorResponse({
				defaultMessage: "Create venue failed.",
				e
			});
		}
	}

	async deleteVenueOrgLink(id) {
		try {
			await Bigneon().organizationVenues.del({ id });
		} catch (e) {
			console.error(e);
			notifications.showFromErrorResponse({
				defaultMessage: "Deleting venue/org link failed.",
				e
			});
		}
	}

	async updateVenue(id, params, onSuccess) {
		const { venueOrganizations, existingVenueOrgLinks } = this.state;
		this.setState({ isSubmitting: true });
		try {
			await Bigneon().venues.update({ ...params, id });
			// Create missing ones
			const toInsert = venueOrganizations.filter(
				x =>
					!existingVenueOrgLinks.find(
						newOrg => newOrg.organization_id === x.organization_id
					)
			);
			await Promise.all(
				toInsert.map(org => {
					return this.createVenueOrgLink({
						venue_id: id,
						organization_id: org.organization_id
					});
				})
			);
			// Delete
			// Find orgs that are in existing that are no longer present
			const toDelete = existingVenueOrgLinks.filter(
				link =>
					!venueOrganizations.find(
						newOrg => newOrg.organization_id === link.organization_id
					)
			);
			await Promise.all(
				toDelete.map(link => {
					return this.deleteVenueOrgLink(link.id);
				})
			);
			this.setState({ isSubmitting: false });
			onSuccess(id);
		} catch (error) {
			console.error(error);
			this.setState({ isSubmitting: false });
			notifications.showFromErrorResponse({
				defaultMessage: "Update venue failed.",
				error
			});
		}
	}

	onSubmit(e) {
		e.preventDefault();
		this.submitAttempted = true;

		if (!this.validateFields()) {
			this.setState({ showManualEntry: true });
			return false;
		}

		const {
			venueId,
			regionId,
			name,
			phone,
			address,
			city,
			state,
			country,
			place_id,
			postal_code,
			timezone,
			latitude = null,
			longitude = null,
			imageUrl
		} = this.state;

		const venueDetails = {
			region_id: regionId === "none" ? undefined : regionId,
			name,
			phone,
			address,
			city,
			state,
			country,
			postal_code,
			google_place_id: place_id,
			latitude,
			longitude,
			promo_image_url: imageUrl,
			timezone
		};

		//If we're updating an existing venue
		if (venueId) {
			this.updateVenue(venueId, venueDetails, id => {
				notifications.show({
					message: "Venue updated",
					variant: "success"
				});

				this.props.history.push("/admin/venues");
			});

			return;
		}

		this.createNewVenue({ ...venueDetails, organization_ids: [] }, id => {
			notifications.show({
				message: "Venue created",
				variant: "success"
			});

			this.props.history.push("/admin/venues");
		});
	}

	addOrganizationToVenue(id) {
		const { venueOrganizations, organizations } = this.state;
		const orgs = venueOrganizations;
		if (id) {
			const selectedOrg = this.findOrgById(id, organizations);
			if (
				!orgs.find(org => org.id === selectedOrg.id) &&
				!orgs.find(org => org.organization_id === selectedOrg.id)
			)
				orgs.push({ organization_id: selectedOrg.id, ...selectedOrg });
		}
		this.setState({ venueOrganizations: orgs });
		return orgs;
	}

	findOrgById(id, organizations) {
		return organizations.find(org => org.id === id);
	}

	removeOrgFromList(id) {
		const { venueOrganizations } = this.state;
		const orgs = venueOrganizations;
		let newOrgs = [];
		if (id) {
			newOrgs = orgs.filter(org => org.id !== id);
		}
		this.setState({ venueOrganizations: newOrgs });
		return newOrgs;
	}

	renderOrganizations() {
		const {
			organizationId,
			organizations,
			errors,
			venueOrganizations
		} = this.state;
		const { classes } = this.props;
		if (organizations === null) {
			return <Typography variant="body1">Loading organizations...</Typography>;
		}

		const organizationOptions = organizations
			.filter(
				organization =>
					!venueOrganizations.find(
						org => org.organization_id === organization.id
					)
			)
			.map(organization => ({
				value: organization.id,
				label: organization.name
			}));

		return (
			<div>
				<SelectGroup
					value={organizationId}
					items={organizationOptions}
					error={errors.organizationId}
					name={"organization"}
					label={"Organization *"}
					onChange={e => {
						this.setState({ organizationId: e.target.value });
						this.addOrganizationToVenue(e.target.value);
					}}
				/>
				<div>
					{venueOrganizations && venueOrganizations.length > 0 ? (
						<div>
							<Typography>Linked Organizations:</Typography>
							<div className={classes.orgContainer}>
								{venueOrganizations.map((org, index) => {
									return (
										<VenueOrganizationList
											key={index}
											classes={classes}
											organization={org}
											removeOrg={this.removeOrgFromList}
										/>
									);
								})}
							</div>
						</div>
					) : null}
				</div>
			</div>
		);
	}

	renderTimezones() {
		const { timezone, errors } = this.state;
		const timezones = moment.tz.names().map(name => ({
			value: name,
			label: name
		}));
		return (
			<SelectGroup
				value={timezone}
				items={timezones}
				error={errors.timezone}
				name={"timezone"}
				label={"Timezone *"}
				onBlur={this.validateFields.bind(this)}
				onChange={e => this.setState({ timezone: e.target.value })}
			/>
		);
	}

	renderRegions() {
		const { regionId, regionOptions, errors } = this.state;

		if (regionOptions === null) {
			return <Typography variant="body1">Loading regions...</Typography>;
		}

		return (
			<SelectGroup
				value={regionId}
				items={regionOptions}
				error={errors.regionId}
				name={"region"}
				label={"Region"}
				onChange={e => this.setState({ regionId: e.target.value })}
			/>
		);
	}

	renderStates() {
		const { state, states, errors } = this.state;

		return (
			<SelectGroup
				value={state}
				items={states}
				error={errors.state}
				name={"state"}
				label={"State *"}
				onChange={e => this.setState({ state: e.target.value })}
			/>
		);
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return null;
		}

		const { venueOrganizations, venueId, organizationId } = this.state;
		const phone = removePhoneFormatting(this.state.phone);

		const errors = {};
		const required = [
			"name",
			"address",
			"city",
			"state",
			"country",
			"postal_code",
			"timezone"
		];
		required.forEach(field => {
			if (!this.state[field]) {
				errors[field] = `Missing ${field}.`;
			}
		});

		if (!venueId) {
			if (venueOrganizations.length < 1 || !organizationId) {
				errors.organizationId = "Select an organization.";
			}
		}

		if (phone) {
			if (!validPhone(phone)) {
				errors.phone = "Invalid phone number.";
			}
		}

		this.setState({ errors });

		return Object.keys(errors).length <= 0;
	}

	render() {
		const {
			venueId,
			imageUrl,
			name,
			phone,
			errors,
			isSubmitting,
			address = "",
			city = "",
			postal_code = "",
			country = "",
			venueOrganizations
		} = this.state;

		const { classes } = this.props;

		return (
			<div>
				<PageHeading iconUrl="/icons/venues-active.svg">
					Venue details
				</PageHeading>

				<Grid container spacing={24}>
					<Grid item xs={12} sm={10} lg={8}>
						<Card className={classes.paper}>
							<form
								noValidate
								autoComplete="off"
								onSubmit={this.onSubmit.bind(this)}
							>
								<CardContent>
									<div className={classes.addImgContainer}>
										<CardMedia
											className={classes.venueImage}
											image={imageUrl || "/icons/venues-gray.svg"}
											title={name}
										/>
										<Button
											style={{ width: "100%" }}
											variant={"callToAction"}
											onClick={this.uploadWidget.bind(this)}
										>
											Upload image
										</Button>
									</div>

									<InputGroup
										error={errors.name}
										value={name}
										name="name"
										label="Venue name *"
										type="text"
										onChange={e => this.setState({ name: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>
									{this.renderOrganizations()}
									{this.renderTimezones()}
									{this.renderRegions()}
									<InputGroup
										error={errors.phone}
										value={phone}
										name="phone"
										label="Phone number"
										type="phone"
										onChange={e => this.setState({ phone: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>
									<InputGroup
										error={errors.address}
										value={address}
										name="address"
										label="Street address *"
										type="text"
										onChange={e => this.setState({ address: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>
									<Grid container spacing={24}>
										<Grid item xs={12} sm={3}>
											<InputGroup
												error={errors.city}
												value={city}
												name="city"
												label="City *"
												type="text"
												onChange={e => this.setState({ city: e.target.value })}
												onBlur={this.validateFields.bind(this)}
											/>
										</Grid>
										<Grid item xs={12} sm={3}>
											{this.renderStates()}
										</Grid>
										<Grid item xs={12} sm={3}>
											<InputGroup
												error={errors.postal_code}
												value={postal_code}
												name="postal_code"
												label="Zip *"
												type="text"
												onChange={e =>
													this.setState({ postal_code: e.target.value })
												}
												onBlur={this.validateFields.bind(this)}
											/>
										</Grid>
										<Grid item xs={12} sm={3}>
											<InputGroup
												error={errors.country}
												value={country}
												name="country"
												label="Country *"
												type="text"
												onChange={e =>
													this.setState({ country: e.target.value })
												}
												onBlur={this.validateFields.bind(this)}
												disabled={!user.isSuper}
											/>
										</Grid>
									</Grid>
								</CardContent>

								<CardActions>
									<Button
										disabled={isSubmitting}
										type="submit"
										variant="callToAction"
									>
										{isSubmitting
											? venueId
												? "Updating..."
												: "Creating..."
											: venueId
												? "Update"
												: "Create"}
									</Button>
								</CardActions>
							</form>
						</Card>
					</Grid>
				</Grid>
			</div>
		);
	}
}

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	},
	venueImage: {
		width: "100%",
		height: 300,
		backgroundRepeat: "no-repeat",
		backgroundSize: "50% 50%",
		borderRadius: theme.shape.borderRadius
	},
	orgRow: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		justifyItems: "center"
	},
	addImgContainer: {
		marginBottom: theme.spacing.unit * 4
	},
	removeOrgIcon: {
		maxWidth: 14,
		cursor: "pointer"
	},
	orgContainer: {
		marginBottom: theme.spacing.unit * 2,
		marginTop: theme.spacing.unit,
		border: "1px solid #eaeaea",
		borderRadius: 5,
		padding: 8
	},
	orgName: {
		fontSize: 16,
		lineHeight: "18px",
		color: "#9DA3B4"
	}
});

export default withStyles(styles)(Venue);
