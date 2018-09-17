import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import { observer } from "mobx-react";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import { Paper } from "@material-ui/core";

import Button from "../../common/Button";
import notifications from "../../../stores/notifications";
import TicketSelection from "./TicketSelection";
import PromoCodeDialog from "./PromoCodeDialog";
import selectedEvent from "../../../stores/selectedEvent";
import EventSummaryGrid from "./EventSummaryGrid";
import cart from "../../../stores/cart";

const styles = theme => ({
	card: {
		padding: theme.spacing.unit * 4
	},
	buttonsContainer: {
		justifyContent: "flex-end",
		display: "flex"
	}
});

@observer
class CheckoutSelection extends Component {
	constructor(props) {
		super(props);

		this.state = {
			openPromo: false,
			ticketSelection: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			const { id } = this.props.match.params;

			selectedEvent.refreshResult(id, errorMessage => {
				notifications.show({
					message: errorMessage,
					variant: "error"
				});
			});
		} else {
			//TODO return 404
		}
	}

	onSubmit() {
		const { id } = selectedEvent;
		const { ticketSelection } = this.state;

		this.setState({ isSubmitting: true });

		cart.addToCart(
			ticketSelection,
			() => {
				notifications.show({
					message: "Tickets added to cart",
					variant: "success"
				});
				this.props.history.push(`/events/${id}/tickets/confirmation`);
			},
			error => {
				this.setState({ isSubmitting: false });

				let message = "Adding to cart failed.";
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
			}
		);
	}

	renderTicketPricing() {
		const { tickets } = selectedEvent;
		const { ticketSelection } = this.state;

		if (!tickets) {
			return null; //Still loading this
		}

		return tickets.map(({ id, name, price, description }) => (
			<TicketSelection
				key={id}
				name={name}
				description={description}
				price={price}
				error={null}
				amount={ticketSelection[id]}
				onNumberChange={amount =>
					this.setState(({ ticketSelection }) => {
						ticketSelection[id] = Number(amount) < 0 ? 0 : amount;
						return { ticketSelection };
					})
				}
			/>
		));
	}

	render() {
		const { classes } = this.props;
		const { openPromo, isSubmitting } = this.state;

		const { event, venue, artists, organization, id } = selectedEvent;

		if (event === null) {
			return <Typography variant="subheading">Loading...</Typography>;
		}

		if (event === false) {
			return <Typography variant="subheading">Event not found.</Typography>;
		}

		return (
			<Paper className={classes.card}>
				<EventSummaryGrid
					event={event}
					venue={venue}
					organization={organization}
					artists={artists}
				/>

				<Grid container spacing={24}>
					<Grid item xs={12} sm={12} lg={12}>
						{this.renderTicketPricing()}

						<div className={classes.buttonsContainer}>
							<Button
								onClick={() => this.setState({ openPromo: true })}
								size="large"
								customClassName="default"
							>
								Apply promo code
							</Button>
							&nbsp;
							<Button
								disabled={isSubmitting}
								onClick={this.onSubmit.bind(this)}
								size="large"
								customClassName="primary"
							>
								{isSubmitting ? "Adding..." : "Select tickets"}
							</Button>
						</div>

						<PromoCodeDialog
							open={openPromo}
							onCancel={() => this.setState({ openPromo: false })}
							onSuccess={discount => {
								console.log(discount);
								this.setState({ openPromo: false });
							}}
						/>
					</Grid>
				</Grid>
			</Paper>
		);
	}
}

CheckoutSelection.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CheckoutSelection);
