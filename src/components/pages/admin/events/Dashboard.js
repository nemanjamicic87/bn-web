import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { Link } from "react-router-dom";
import moment from "moment";

import notifications from "../../../../stores/notifications";
import Bigneon from "../../../../helpers/bigneon";
import PageHeading from "../../../elements/PageHeading";
import Card from "../../../elements/Card";
import Button from "../../../elements/Button";
import CheckBox from "../../../elements/form/CheckBox";
import StyledLink from "../../../elements/StyledLink";
import Divider from "../../../common/Divider";

import Summary from "./dashboardContent/Summary";
import HoldsList from "./dashboardContent/holds/List";

const styles = theme => ({
	rightHeaderOptions: {
		display: "flex",
		justifyContent: "flex-end",
		alignContent: "center"
	},
	innerCard: {
		padding: theme.spacing.unit * 5
	},
	headerContainer: { marginBottom: theme.spacing.unit * 4 },
	menuContainer: {
		display: "flex"
	},
	menuText: {
		marginRight: theme.spacing.unit * 4
	}
});

class EventDashboard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			event: null,
			subheading: null,
			last30Days: null,
			anchorEl: null
		};
	}

	componentDidMount() {
		this.loadEventDetails(this.props.match.params.id);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevProps.event && prevProps.event.id !== this.props.match.params.id) {
			this.loadEventDetails(this.props.match.params.id);
		}

		if (prevState.subheading !== this.props.match.params.subheading) {
			this.setState({ subheading: this.props.match.params.subheading });
		}
	}

	handleToolsMenu(event) {
		this.setState({ anchorEl: event.currentTarget });
	}

	handleToolsMenuClose() {
		this.setState({ anchorEl: null });
	}

	loadEventDetails(eventId) {
		Bigneon()
			.events.dashboard({ id: eventId })
			.then(response => {
				const { last_30_days, event } = response.data;

				this.setState({
					event,
					last30Days: last_30_days
				});
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Loading event details failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	renderToolsMenu() {
		const { anchorEl } = this.state;
		const open = Boolean(anchorEl);
		const { event } = this.state;

		return (
			<Menu
				id="menu-appbar"
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: "top",
					horizontal: "right"
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right"
				}}
				open={open}
				onClose={this.handleToolsMenuClose.bind(this)}
			>
				<Link to={`/admin/events/${event.id}/dashboard/holds`}>
					<MenuItem onClick={this.handleToolsMenuClose.bind(this)}>
						Smart holds
					</MenuItem>
				</Link>
			</Menu>
		);
	}

	renderContent() {
		const { event, subheading, last30Days } = this.state;
		const ComingSoon = () => <Typography>Coming soon</Typography>;

		switch (subheading) {
			case undefined:
				return <Summary event={event} last30Days={last30Days} />;
			case "holds":
				return <HoldsList event={event} />;
			default:
				return <ComingSoon />;
		}
	}

	render() {
		const { event, subheading, last30Days } = this.state;
		const { classes, history } = this.props;

		if (!event) {
			return <Typography>Loading...</Typography>; //TODO get a spinner or something
		}

		const isPublished = moment(event.publish_date) < moment();
		const isOnSale = moment(event.on_sale) < moment();

		return (
			<div>
				<Grid container>
					<Grid item xs={12} sm={12} lg={6}>
						<PageHeading iconUrl="/icons/events-multi.svg">
							{event.name}
						</PageHeading>
					</Grid>
					<Grid
						item
						xs={6}
						sm={6}
						lg={6}
						className={classes.rightHeaderOptions}
					>
						<div>
							<CheckBox style={{ cursor: "text" }} active={isPublished}>
								Published
							</CheckBox>
							<CheckBox style={{ cursor: "text" }} active={isOnSale}>
								On sale
							</CheckBox>
						</div>
						<Link to={`/admin/events/${event.id}/edit`}>
							<Button variant="callToAction">Edit event</Button>
						</Link>
					</Grid>
				</Grid>

				<Card>
					<div className={classes.innerCard}>
						<div className={classes.headerContainer}>
							<div className={classes.menuContainer}>
								<Typography className={classes.menuText}>
									<StyledLink
										underlined={!subheading}
										to={`/admin/events/${event.id}/dashboard`}
									>
										Dashboard
									</StyledLink>
								</Typography>
								<Typography className={classes.menuText}>
									{this.renderToolsMenu()}
									<StyledLink
										underlined={subheading === "tools"}
										//to={`/admin/events/${event.id}/dashboard/tools`}
										onClick={this.handleToolsMenu.bind(this)}
									>
										Tools
									</StyledLink>
								</Typography>
								<Typography className={classes.menuText}>
									<StyledLink
										underlined={subheading === "sales"}
										to={`/admin/events/${event.id}/dashboard/sales`}
									>
										Sales
									</StyledLink>
								</Typography>
								<Typography className={classes.menuText}>
									<StyledLink
										underlined={subheading === "reports"}
										to={`/admin/events/${event.id}/dashboard/reports`}
									>
										Reports
									</StyledLink>
								</Typography>
							</div>
						</div>
						<Divider style={{ marginBottom: 40 }} />

						{this.renderContent()}
					</div>
				</Card>
			</div>
		);
	}
}

export default withStyles(styles)(EventDashboard);
