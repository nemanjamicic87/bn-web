import React, { Component } from "react";
import { Typography } from "@material-ui/core";
import servedImage from "../../../../helpers/imagePathHelper";

class VenueOrganizationList extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	removeOrg(id) {
		this.props.removeOrg(id);
	}

	render() {
		const { classes, organization } = this.props;
		return (
			<div className={classes.orgRow}>
				<Typography className={classes.orgName}> {organization.name}</Typography>
				<div onClick={() => this.removeOrg(organization.id)}>
					<img
						className={classes.removeOrgIcon}
						alt="close"
						src={servedImage("/icons/delete-active.svg")}
					/>
				</div>
			</div>
		);
	}
}
export default VenueOrganizationList;
