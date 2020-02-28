import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

import notifications from "../../../../stores/notifications";
import Button from "../../../elements/Button";
import Dialog from "../../../elements/Dialog";
import Bigneon from "../../../../helpers/bigneon";
import { fontFamilyDemiBold } from "../../../../config/theme";

const styles = theme => ({
	btnStyle: {
		flex: 1,
		marginRight: theme.spacing.unit
	},
	btnContainer: {
		display: "flex",
		marginTop: theme.spacing.unit * 2,
		justifyItems: "space-between"
	},
	nameText: {
		marginTop: theme.spacing.unit,
		fontFamily: fontFamilyDemiBold
	}
});

class DeleteCancelEventDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			name: "",
			isSubmitting: false
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		//TODO check if the ID changed, if it did pull the event details into state
		const { id } = this.props;

		if (id && prevProps.id !== id) {
			Bigneon()
				.events.read({ id })
				.then(response => {
					const { artists, organization, venue, ...event } = response.data;
					const { name } = event;
					this.setState({
						name
					});
				})
				.catch(error => {
					console.error(error);
					notifications.showFromErrorResponse({
						defaultMessage: "Loading events failed.",
						error
					});
				});
		}
	}

	onSubmit(e) {
		e.preventDefault();

		const { onClose, id, isDelete } = this.props;

		this.setState({ isSubmitting: true });

		const deleteOrCancelCall = isDelete
			? Bigneon().events.delete
			: Bigneon().events.cancel;

		deleteOrCancelCall({ id })
			.then(response => {
				this.setState({ isSubmitting: false }, () => onClose());
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					defaultMessage: isDelete
						? "Deleting event failed."
						: "Cancelling event failed",
					error
				});
			});
	}

	render() {
		const { onClose, id, classes, isDelete } = this.props;
		const { name, isSubmitting } = this.state;

		return (
			<Dialog
				open={!!id}
				onClose={onClose}
				title={isDelete ? "Delete Event" : "Cancel Event"}
			>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<div>
						<Typography>
							Are you sure you want to{" "}
							{isDelete ? "permanently delete " : "cancel "} this event?
						</Typography>
						{name ? (
							<Typography className={classes.nameText}>{name}</Typography>
						) : null}
					</div>
					<div className={classes.btnContainer}>
						<Button
							className={classes.btnStyle}
							onClick={onClose}
							color="primary"
						>
							Keep event
						</Button>
						<Button
							className={classes.btnStyle}
							disabled={isSubmitting}
							type="submit"
							variant="secondary8border"
						>
							{isSubmitting
								? isDelete
									? "Deleting..."
									: "Cancelling..."
								: isDelete
									? "Delete event"
									: "Cancel event"}
						</Button>
					</div>
				</form>
			</Dialog>
		);
	}
}

DeleteCancelEventDialog.propTypes = {
	id: PropTypes.string,
	onClose: PropTypes.func.isRequired
};

export default withStyles(styles)(DeleteCancelEventDialog);
