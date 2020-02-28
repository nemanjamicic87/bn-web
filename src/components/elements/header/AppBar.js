import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";

import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import MenuIcon from "@material-ui/icons/Menu";
import Slide from "@material-ui/core/Slide";

import { secondaryHex, toolBarHeight } from "../../../config/theme";
import RightUserMenu from "./RightUserMenu";
import SearchToolBarInput from "./SearchToolBarInput";
import CartHeaderLink from "../../common/cart/CartHeaderLink";
import CurrentOrganizationMenu from "./CurrentOrganizationMenu";
import BoxOfficeLink from "./BoxOfficeLink";
import AppBarLogo from "./AppBarLogo";
import layout from "../../../stores/layout";
import servedImage from "../../../helpers/imagePathHelper";
import { isReactNative } from "../../../helpers/reactNative";

const styles = theme => {
	return {
		headerLinkContainer: {
			[theme.breakpoints.down("sm")]: {
				flex: 1,
				display: "flex",
				justifyContent: "flex-start"
			}
		},
		toolBar: {
			paddingRight: theme.spacing.unit * 2,
			paddingLeft: theme.spacing.unit * 2,
			display: "flex",
			justifyContent: "space-between",
			...toolBarHeight
		},
		rightMenuOptions: {
			alignItems: "center",
			display: "flex"
		},
		menuIcon: {
			color: secondaryHex
		},
		mobiSearchContainer: {
			width: "100%",
			position: "fixed",
			background: "#fff",
			top: 0,
			paddingRight: theme.spacing.unit * 2,
			paddingLeft: theme.spacing.unit * 2,
			display: "flex",
			justifyContent: "space-between",
			...toolBarHeight
		},
		icon: {
			marginRight: 4
		}
	};
};

@observer
class CustomAppBar extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showSearch: isReactNative(),
			isReactNative: isReactNative()
		};
		this.showMobileSearch = this.showMobileSearch.bind(this);
	}

	showMobileSearch() {
		this.setState({ showSearch: true });
	}

	closeSearch() {
		const { isReactNative } = this.state;
		if (isReactNative) {
			return;
		}
		this.setState({ showSearch: false });
	}

	render() {
		const { classes, handleDrawerToggle, history, homeLink } = this.props;
		const { isReactNative } = this.state;

		return (
			<AppBar position={"static"}>
				{isReactNative ? (
					<SearchToolBarInput
						onCloseClick={this.closeSearch.bind(this)}
						history={history}
					/>

				) : (
					<React.Fragment>
						<Toolbar className={classes.toolBar}>
							{handleDrawerToggle ? (
								<Hidden mdUp>
									{layout.showSideMenu ? (
										<IconButton
											color="inherit"
											aria-label="open drawer"
											onClick={handleDrawerToggle}
											className={classes.navIconHide}
										>
											<MenuIcon
												className={classes.menuIcon}
											/>
										</IconButton>
									) : (
										<span/>
									)}
								</Hidden>
							) : null}

							<div className={classes.headerLinkContainer}>
								<Link to={homeLink}>
									<AppBarLogo/>
								</Link>
							</div>

							{/*{!layout.showStudioLogo ? (*/}
							{/*	<Hidden smDown>*/}
							{/*		<SearchToolBarInput history={history}/>*/}
							{/*	</Hidden>*/}
							{/*) : null}*/}

							{!layout.showStudioLogo ? (
								<Hidden smUp>
									<img
										alt="Search icon"
										className={classes.icon}
										src={servedImage("/icons/search-gray.svg")}
										onClick={this.showMobileSearch}
									/>
								</Hidden>
							) : null}

							<span className={classes.rightMenuOptions}>
								<Hidden smDown>
									<BoxOfficeLink/>
									<CurrentOrganizationMenu/>
									<CartHeaderLink/>
								</Hidden>
								<RightUserMenu history={history}/>
							</span>
						</Toolbar>
						<Slide
							direction="left"
							in={!layout.showStudioLogo && this.state.showSearch}
						>
							<div className={classes.mobiSearchContainer}>
								<SearchToolBarInput
									onCloseClick={this.closeSearch.bind(this)}
									history={history}
								/>
							</div>
						</Slide>
					</React.Fragment>
				)}
			</AppBar>
		);
	}
}

CustomAppBar.defaultProps = {
	homeLink: "/"
};

CustomAppBar.propTypes = {
	classes: PropTypes.object.isRequired,
	handleDrawerToggle: PropTypes.func,
	history: PropTypes.object.isRequired,
	homeLink: PropTypes.string
};

export default withStyles(styles)(CustomAppBar);
