import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import linkifyHtml from "linkifyjs/html";
import classnames from "classnames";

import { secondaryHex, fontFamilyDemiBold } from "../../../config/theme";
import "../../pages/events/rich-event-description.css";

const styles = theme => ({
	root: {
		paddingTop: 10
	},
	readMoreLink: {
		font: "inherit",
		color: secondaryHex,
		cursor: "pointer",
		marginTop: 10,
		marginBottom: 10,
		display: "block",
		fontWeight: 100
	},
	shortenedTextBlock: {
		overflow: "hidden",
		display: "-webkit-box",
		WebkitLineClamp: "3",
		WebkitBoxOrient: "vertical",
		textOverflow: "ellipsis"
	},
	descriptionLink: {
		font: "inherit",
		color: secondaryHex,
		cursor: "pointer",
		fontFamily: fontFamilyDemiBold
	}
});

class ReadMoreAdditionalInfo extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showAllAdditionalInfo: false
		};
	}

	showHideMoreAdditionalInfo() {
		this.setState(({ showAllAdditionalInfo }) => ({
			showAllAdditionalInfo: !showAllAdditionalInfo
		}));
	}

	render() {
		const { classes, children, readMoreText, readLessText } = this.props;

		if (!children) {
			return null;
		}

		const { showAllAdditionalInfo } = this.state;

		const options = {
			nl2br: true,
			className: classes.descriptionLink
		};

		const linkifiedText = linkifyHtml(children, options);

		const artistBio = (
			<span
				className={classes.readMoreLink}
				onClick={this.showHideMoreAdditionalInfo.bind(this)}
			>
				{showAllAdditionalInfo ? readLessText : readMoreText}
			</span>
		);

		return (
			<div className={classes.root}>
				<span
					className={classnames({
						[classes.shortenedTextBlock]: !showAllAdditionalInfo
					})}
				>
					<div
						className={"rich-edit-content"}
						dangerouslySetInnerHTML={{ __html: linkifiedText }}
					/>
				</span>

				{(linkifiedText.length > 184 ? artistBio : "")}
			</div>
		);
	}
}

ReadMoreAdditionalInfo.defaultProps = {
	 children: "",
	 readMoreText: "Read more",
	 readLessText: "Read less"
};

ReadMoreAdditionalInfo.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.string.isRequired,
	readMoreText: PropTypes.string.isRequired,
	readLessText: PropTypes.string.isRequired
};

export default withStyles(styles)(ReadMoreAdditionalInfo);
