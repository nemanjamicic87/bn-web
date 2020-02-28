import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import linkifyHtml from "linkifyjs/html";
import classnames from "classnames";

import { secondaryHex, fontFamilyDemiBold } from "../../../../config/theme";
import "./rich-landing-description.css";

const styles = theme => ({
	root: {},
	readMoreLink: {
		font: "inherit",
		color: secondaryHex,
		cursor: "pointer",
		display: "block",
		marginTop: 8,
		[theme.breakpoints.up("md")]: {
			display: "none"
		}
	},
	shortenedTextBlock: {
		[theme.breakpoints.down("sm")]: {
			overflow: "hidden",
			display: "-webkit-box",
			WebkitLineClamp: "3",
			WebkitBoxOrient: "vertical",
			textOverflow: "ellipsis"
		}
	},
	descriptionLink: {
		font: "inherit",
		color: "#B0B6C6",
		textDecoration: "underline",
		cursor: "pointer",
		fontFamily: fontFamilyDemiBold
	}
});

class FormattedLandingDescription extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showWholeDescription: false
		};
	}

	showHideMoreAdditionalInfo() {
		this.setState(({ showWholeDescription }) => ({
			showWholeDescription: !showWholeDescription
		}));
	}

	render() {
		const { classes, children } = this.props;

		if (!children) {
			return null;
		}

		const { showWholeDescription } = this.state;

		const options = {
			nl2br: true,
			className: classes.descriptionLink
		};

		const linkifiedText = linkifyHtml(children, options);

		return (
			<div className={classes.root}>
				<span
					className={classnames({
						[classes.shortenedTextBlock]: !showWholeDescription
					})}
				>
					<div
						className={"rich-edit-landing-content"}
						dangerouslySetInnerHTML={{ __html: linkifiedText }}
					/>
				</span>

				<span
					className={classes.readMoreLink}
					onClick={this.showHideMoreAdditionalInfo.bind(this)}
				>
					{showWholeDescription ? " Read less" : " Read more"}
				</span>
			</div>
		);
	}
}

FormattedLandingDescription.defaultProps = { children: "" };

FormattedLandingDescription.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.string.isRequired
};

export default withStyles(styles)(FormattedLandingDescription);
