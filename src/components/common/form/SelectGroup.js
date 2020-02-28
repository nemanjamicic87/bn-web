import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormatInputLabel from "../../elements/form/FormatInputLabel";

const styles = theme => ({
	formControl: {
		width: "100%",
		marginTop: 2
	},
	formControlNoMargin: {
		width: "100%"
	},
	labelContainer: {
		marginBottom: theme.spacing.unit
	}
});

const ITEM_PADDING_TOP = 8;

const SelectGroup = props => {
	const {
		value,
		items,
		dropdownHeight = 60,
		dropdownWidth = 250,
		error,
		name,
		label,
		labelProps,
		onChange,
		onBlur,
		onFocus,
		missingItemsLabel,
		disableUnderline,
		selectStyle,
		styleClassName = "formControl",
		displayEmpty,
		disabled
	} = props;
	const { classes } = props;

	let content = <MenuItem disabled>{missingItemsLabel || "No items"}</MenuItem>;
	if (items.length > 0) {
		content = items.map(function(item, index) {
			return (
				<MenuItem
					disabled={item.disabled}
					key={item.value}
				  	value={item.value}
				>
					{item.label || item.name || item.value}
				</MenuItem>
			);
		});
	}

	return (
		<FormControl
			className={classes[styleClassName]}
			error={!!error}
			aria-describedby={`%${name}-error-text`}
		>
			{label ? (
				<span className={classes.labelContainer}>
					<FormatInputLabel {...labelProps}>{label}</FormatInputLabel>
				</span>
			) : null}
			<Select
				disabled={disabled}
				style={selectStyle}
				disableUnderline={disableUnderline}
				value={value}
				onChange={onChange} //TODO return just e.target.value and go back and change everywhere it's used to make it simpler
				inputProps={{
					name,
					id: name,
					onBlur,
					onFocus
				}}
				MenuProps={{
					PaperProps: {
						style: {
							maxHeight: dropdownHeight * 4.5 + ITEM_PADDING_TOP,
							width: dropdownWidth
						}
					}
				}}
				displayEmpty={displayEmpty}
			>
				{content}
			</Select>

			<FormHelperText id={`${name}-error-text`}>{error}</FormHelperText>
		</FormControl>
	);
};

SelectGroup.defaultProps = {
	labelProps: {}
};

SelectGroup.propTypes = {
	items: PropTypes.array.isRequired,
	error: PropTypes.string,
	value: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number,
		PropTypes.bool
	]).isRequired,
	dropdownWidth: PropTypes.number,
	dropdownHeight: PropTypes.number,
	missingItemsLabel: PropTypes.string, //If there are no items, the text you want to display
	name: PropTypes.string.isRequired,
	label: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	onBlur: PropTypes.func,
	onFocus: PropTypes.func,
	disableUnderline: PropTypes.bool,
	selectStyle: PropTypes.object,
	styleClassName: PropTypes.string,
	displayEmpty: PropTypes.bool,
	disabled: PropTypes.bool
};

export default withStyles(styles)(SelectGroup);
