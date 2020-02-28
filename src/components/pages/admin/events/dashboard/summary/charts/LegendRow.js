import React from "react";
import PropTypes from "prop-types";
import { withStyles, Typography } from "@material-ui/core";
import classNames from "classnames";
import {
	fontFamily,
	fontFamilyBold,
	fontFamilyDemiBold
} from "../../../../../../../config/theme";

const styles = theme => {
	return {
		root: {
			display: "flex",
			justifyContent: "space-between"
		},
		labelContainer: {
			display: "flex",
			alignItems: "center"
		},
		label: {
			fontSize: 15,
			opacity: 0.6,
			marginTop: 4
		},
		dot: {
			height: 11,
			width: 11,
			borderRadius: 10,
			backgroundColor: "gray",
			marginRight: 10
		},
		valueLabel: {
			fontSize: 15,
			fontFamily: fontFamilyBold,
			marginTop: 4
		},
		subValueLabel: {
			fontSize: 15,
			fontFamily: fontFamily,
			color: "#979797"
		}
	};
};

const LegendRow = props => {
	const { classes, color, label, valueLabel, subValueLabel } = props;

	return (
		(valueLabel !== 0) ? (
			<div className={classes.root}>
				<div className={classes.labelContainer}>
					<div className={classes.dot} style={{ backgroundColor: color }}/>
					<Typography className={classes.label}>{label}</Typography>
				</div>
				<Typography className={classes.valueLabel}>
					{valueLabel}&nbsp;
					<span className={classes.subValueLabel}>
						{subValueLabel ? `(${subValueLabel})` : ""}
					</span>
				</Typography>
			</div>
		) : null
	);
};

LegendRow.propTypes = {
	classes: PropTypes.object.isRequired,
	color: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	valueLabel: PropTypes.string.isRequired,
	subValueLabel: PropTypes.string
};

export default withStyles(styles)(LegendRow);
