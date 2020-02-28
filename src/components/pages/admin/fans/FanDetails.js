import React, { Component } from "react";
import { withStyles, Typography, Divider, Hidden } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import notifications from "../../../../stores/notifications";
import Bigneon from "../../../../helpers/bigneon";
import PageHeading from "../../../elements/PageHeading";
import user from "../../../../stores/user";
import Card from "../../../elements/Card";
import { fontFamilyDemiBold } from "../../../../config/theme";
import SocialIconLink from "../../../elements/social/SocialIconLink";
import Loader from "../../../elements/loaders/Loader";
import moment from "moment-timezone";
import servedImage from "../../../../helpers/imagePathHelper";
import FanHistoryEventCard from "./FanHistoryEventCard";
import StyledLink from "../../../elements/StyledLink";
import Button from "../../../elements/Button";

const imageSize = 100;

const styles = theme => ({
	card: {
		padding: theme.spacing.unit * 3
	},
	mobileContainer: {
		padding: theme.spacing.unit * 1,
		maxWidth: "100vw"
	},
	profileImage: {
		width: imageSize,
		height: imageSize,
		borderRadius: 100,
		backgroundSize: "cover",
		backgroundRepeat: "no-repeat",
		backgroundPosition: "50% 50%"
	},
	missingProfileImageContainer: {
		borderStyle: "dashed",
		borderWidth: 0.5,
		borderColor: "#d1d1d1",
		width: imageSize,
		height: imageSize,
		borderRadius: 100,
		display: "flex",
		justifyContent: "center",
		alignItems: "center"
	},
	missingProfileImage: {
		width: imageSize * 0.35,
		height: "auto"
	},
	profileContainer: {
		display: "flex"
	},
	profileDetails: {
		marginLeft: theme.spacing.unit * 2,
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-around"
	},
	name: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.5,
		lineHeight: 1
	},
	email: {
		color: "#9DA3B4",
		lineHeight: 1
	},
	facebookContainer: {
		display: "flex",
		alignItems: "center"
	},
	facebook: {
		fontSize: theme.typography.fontSize * 0.7,
		color: "#9DA3B4",
		marginLeft: theme.spacing.unit,
		lineHeight: 1
	},
	overviewStatsContainer: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "flex-end"
	},
	statsHeading: {
		color: "#9DA3B4"
	},
	statValue: {
		fontFamily: fontFamilyDemiBold
	},
	verticalDivider: {
		borderLeft: "1px solid #DEE2E8",
		height: 45
	},
	verticalDividerSmall: {
		borderLeft: "1px solid #DEE2E8",
		height: 20
	},
	menuContainer: {
		display: "flex",
		paddingTop: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 2
	},
	menuText: {
		marginRight: theme.spacing.unit * 4
	},
	historyHeading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.5,
		marginTop: theme.spacing.unit * 4
	}
});

class Fan extends Component {
	constructor(props) {
		super(props);

		this.userId = props.match.params.id;

		this.state = {
			profile: null,
			fanHistory: null,
			isLoading: false,
			formattedEventStart: null,
			formattedOccurredAt: null,
			activeHeadings: { sales: true, attendance: false },
			expandedRowKey: null,
			upcomingOrPast: this.props.match.params.upcomingOrPast || "upcoming"
		};
		this.onExpandChange = this.onExpandChange.bind(this);
	}

	componentDidMount() {
		this.loadFan();
		this.updateHistory();
	}

	componentDidUpdate() {
		const { upcomingOrPast } = this.state;
		if (
			upcomingOrPast !== (this.props.match.params.upcomingOrPast || "upcoming")
		) {
			this.setState(
				{
					upcomingOrPast: this.props.match.params.upcomingOrPast || "upcoming"
				},
				() => this.updateHistory()
			);
		}
	}

	displayOrderDate(date, timezone) {
		return moment
			.utc(date)
			.tz(timezone)
			.format("llll");
	}

	onExpandChange(expandedRowKey) {
		if (expandedRowKey === this.state.expandedRowKey) {
			this.setState({
				expandedRowKey: null
			});
		} else {
			this.setState({ expandedRowKey });
		}
	}

	onDeleteAccount() {
		const id = this.userId;

		Bigneon()
			.users.del({ id })
			.then(() => {
				this.loadFan();
			})
			.catch(error =>
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to delete account."
				})
			);
	}

	loadFan() {
		const organization_id = user.currentOrganizationId;

		if (!organization_id) {
			this.timeout = setTimeout(this.loadFan.bind(this), 500);
			return;
		}

		const user_id = this.userId;

		Bigneon()
			.organizations.fans.read({ user_id, organization_id })
			.then(response => {
				const { attendance_information, ...profile } = response.data;
				this.setState({ profile });
			})
			.catch(error =>
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to load fan profile."
				})
			);
	}

	updateHistory() {
		const organization_id = user.currentOrganizationId;
		this.setState({ isLoading: true });

		if (!organization_id) {
			this.timeout = setTimeout(this.updateHistory().bind(this), 500);
			return;
		}

		const user_id = this.userId;
		const { upcomingOrPast } = this.state;

		Bigneon()
			.organizations.fans.activity({
				user_id,
				organization_id,
				past_or_upcoming: upcomingOrPast
			})
			.then(response => {
				const fanHistory = response.data.data.map((item, index) => {
					const eventStart = this.displayOrderDate(
						item.event.event_start,
						item.event.venue.timezone
					);

					const activityItems = item.activity_items.map(activityItem => {
						const occurredAt = this.displayOrderDate(
							activityItem.occurred_at,
							item.event.venue.timezone
						);

						return { ...activityItem, occurredAt };
					});

					item.activity_items = activityItems;

					return { ...item, eventStart };
				});
				this.setState({ fanHistory: fanHistory, isLoading: false });
			})
			.catch(error =>
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to load fan history."
				})
			);
	}

	renderCards() {
		const { fanHistory, expandedRowKey, profile, isLoading } = this.state;

		if (isLoading) {
			return <Loader>Loading history...</Loader>;
		}
		if (fanHistory.length === 0) {
			return <Typography>No activity to display.</Typography>;
		}
		return fanHistory.map((item, index) => {
			const expanded = expandedRowKey === index;
			return (
				<FanHistoryEventCard
					onExpandChange={() => this.onExpandChange(index)}
					expanded={expanded}
					key={index}
					eventStart={item.eventStart}
					profile={profile}
					userId={this.userId}
					{...item}
				/>
			);
		});
	}

	renderProfile() {
		const { classes } = this.props;
		const { profile } = this.state;

		const {
			first_name,
			last_name,
			email,
			facebook_linked,
			profile_pic_url,
			deleted_at
		} = profile;

		const profilePic = profile_pic_url ? (
			<div
				className={classes.profileImage}
				style={{ backgroundImage: `url(${profile_pic_url})` }}
			/>
		) : (
			<div className={classes.missingProfileImageContainer}>
				<img
					className={classes.missingProfileImage}
					src={servedImage("/images/profile-pic-placeholder.png")}
					alt={first_name}
				/>
			</div>
		);

		return (
			<div className={classes.profileContainer}>
				{profilePic}
				<div className={classes.profileDetails}>
					<Typography className={classes.name}>
						{first_name} {last_name}
						{ deleted_at ? "(deleted)" : "" }
					</Typography>
					<Typography className={classes.email}>{email}</Typography>
					<div className={classes.facebookContainer}>
						<SocialIconLink icon="facebook" color="black"/>
						<Typography className={classes.facebook}>
							{facebook_linked
								? "Facebook connected"
								: "Facebook not connected"}
						</Typography>
					</div>
					{user.isSuper  ? (
						<div>
							<Button
								onClick={this.onDeleteAccount.bind(this)}
								disabled={!!deleted_at}
								variant="callToAction"
							>
								Delete Account
							</Button>
						</div>
					) : null}
				</div>
			</div>
		);
	}

	render() {
		const { profile, upcomingOrPast } = this.state;
		if (profile === null) {
			return <Loader>Loading fan details...</Loader>;
		}
		const { classes } = this.props;
		const user_id = this.userId;

		return (
			<div>
				<PageHeading iconUrl="/icons/my-events-active.svg">
					Fan Profile
				</PageHeading>

				<Hidden smDown>
					<Card>
						<div className={classes.card}>
							<Grid container spacing={24}>
								<Grid item xs={12} sm={8} lg={8}>
									{this.renderProfile()}
								</Grid>
							</Grid>

							<Grid
								item
								xs={12}
								sm={12}
								md={12}
								lg={12}
								style={{ paddingTop: 20 }}
							>
								<Typography className={classes.name}>Event Activity</Typography>
								<div className={classes.menuContainer}>
									<Typography className={classes.menuText}>
										<StyledLink
											underlined={upcomingOrPast === "upcoming"}
											to={`/admin/fans/${user_id}/upcoming`}
										>
											Upcoming
										</StyledLink>
									</Typography>
									<Typography className={classes.menuText}>
										<StyledLink
											underlined={upcomingOrPast === "past"}
											to={`/admin/fans/${user_id}/past`}
										>
											Past
										</StyledLink>
									</Typography>
								</div>
								{this.renderCards()}
							</Grid>
						</div>
					</Card>
				</Hidden>

				<Hidden mdUp>
					<div className={classes.mobileContainer}>
						<Grid container spacing={24}>
							<Grid item xs={12} sm={8} lg={8}>
								{this.renderProfile()}
							</Grid>
						</Grid>

						<Grid
							item
							xs={12}
							sm={12}
							md={12}
							lg={12}
							style={{ paddingTop: 20 }}
						>
							<Typography className={classes.name}>Event Activity</Typography>
							<div className={classes.menuContainer}>
								<Typography className={classes.menuText}>
									<StyledLink
										underlined={upcomingOrPast === "upcoming"}
										to={`/admin/fans/${user_id}/upcoming`}
									>
										Upcoming
									</StyledLink>
								</Typography>
								<Typography className={classes.menuText}>
									<StyledLink
										underlined={upcomingOrPast === "past"}
										to={`/admin/fans/${user_id}/past`}
									>
										Past
									</StyledLink>
								</Typography>
							</div>
							{this.renderCards()}
						</Grid>
					</div>
				</Hidden>
			</div>
		);
	}
}

export default withStyles(styles)(Fan);
