import React, { Component } from "react";
import { withStyles, Typography, Hidden } from "@material-ui/core";
import classnames from "classnames";
import { fontFamilyBold } from "../../../config/theme";
import servedImage from "../../../helpers/imagePathHelper";
import RightUserMenu from "../../elements/header/RightUserMenu";
import SearchToolBarInput from "../../elements/header/SearchToolBarInput";
import getPhoneOS from "../../../helpers/getPhoneOS";
import AppButton from "../../elements/AppButton";
import Settings from "../../../config/settings";
import { isReactNative } from "../../../helpers/reactNative";

const styles = theme => ({
	root: {
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "center",
		backgroundColor: "#19081e",
		display: "flex",
		flexDirection: "column",
		minHeight: 500,
		[theme.breakpoints.down("sm")]: {
			flexDirection: "column",
			minHeight: 210
		}
	},
	"webp": {
		backgroundImage: "url(/images/homepage-bg.webp)"
	},
	"nowebp": {
		backgroundImage: "url(/images/homepage-bg.jpg)"
	},
	headingContainer: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		flex: 1,
		textAlign: "center"
	},
	text: {
		color: "#FFFFFF"
	},
	shText: {
		color: "#9DA3B4"
	},
	toolBar: {
		paddingRight: "8vw",
		paddingLeft: "8vw",
		paddingTop: "5vh",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		height: theme.spacing.unit * 10
	},
	heading: {
		fontSize: 72,
		fontFamily: fontFamilyBold,
		marginTop: theme.spacing.unit * 4,
		[theme.breakpoints.down("sm")]: {
			paddingLeft: theme.spacing.unit * 3,
			fontSize: 32,
			paddingRight: theme.spacing.unit * 3,
			marginTop: theme.spacing.unit * 2
		}
	},
	subHeading: {
		fontSize: 21,
		lineSpace: 1,
		[theme.breakpoints.down("sm")]: {
			fontSize: 15
		}
	},
	iconHolder: {
		display: "flex",
		width: "150px",
		justifyContent: "space-between",
		alignItems: "flex-start",
		paddingBottom: theme.spacing.unit
	},
	availableOn: {
		fontSize: theme.typography.fontSize * 0.9,
		marginRight: theme.spacing.unit
	},
	appLinksContainer: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		margin: "25px 0 0 0",

		[theme.breakpoints.up("sm")]: {
			justifyContent: "flex-center"
		}
	},
	searchContainer: {
		borderRadius: "10px",
		borderColor: "#fff",
		borderStyle: "solid",
		width: 790,
		display: "flex",
		height: 67,
		backgroundColor: "#fff",
		padding: theme.spacing.unit * 2,
		justifyContent: "flex-start",
		alignItems: "center",
		marginTop: 30,
		boxShadow: "10px 10px 40px 0 rgba(13,10,43,0.50)",
		[theme.breakpoints.up("sm")]: {
			justifyContent: "flex-center"
		}
	},
	featureImage: {
		flex: 0,
		width: 380,
		[theme.breakpoints.up("sm")]: {
			width: 600
		},
		[theme.breakpoints.down("xs")]: {
			width: 300
		}
	},
	iconImage: {
		maxHeight: "21px"
	},
	logoImage: {
		maxWidth: 140,
		maxHeight: 43
	},
	downloadBtn: {
		maxWidth: 128,
		marginTop: theme.spacing.unit * 2,
		marginLeft: theme.spacing.unit * 2,
		maxHeight: 38
	}
});

class Hero extends Component {
	constructor(props) {
		super(props);
		this.inputRef = React.createRef();
		this.state = {
			query: "",
			isSearching: false,
			phoneOS: getPhoneOS(),
			isReactNative: isReactNative()
		};
	}

	handleSearchClick = () => {
		this.inputRef.current.click();
	};

	componentWillMount() {
		this.getMobileOperatingSystem();
	}

	getMobileOperatingSystem() {
		const userAgent = navigator.userAgent || navigator.vendor || window.opera;

		if (/android/i.test(userAgent)) {
			this.setState({ isAndroid: true });
		}

		if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
			this.setState({ isIos: true });
		}
	}

	render() {
		const { history, classes } = this.props;
		const { phoneOS, isReactNative } = this.state;
		const { webPSupported } = Settings();
		return isReactNative ? null : (
			<div className={[classes.root, webPSupported ? classes.webp : classes.nowebp].join(" ")}>
				{/*<Hidden smDown>*/}
				{/*	<div className={classes.toolBar}>*/}
				{/*		<img*/}
				{/*			alt="Header logo"*/}
				{/*			className={classes.logoImage}*/}
				{/*			src={servedImage("/images/logo-white.png")}*/}
				{/*		/>*/}
				{/*		<span className={classes.rightMenuOptions}>*/}
				{/*			<RightUserMenu whiteText={true} history={history}/>*/}
				{/*		</span>*/}
				{/*	</div>*/}
				{/*</Hidden>*/}
				<div className={classes.headingContainer}>
					<Typography
						className={classnames({
							[classes.text]: true,
							[classes.heading]: true
						})}
					>
						Beyond Ticketing
					</Typography>
					<Typography
						className={classnames({
							[classes.shText]: true,
							[classes.subHeading]: true
						})}
					>
						We got your tickets, you enjoy the show
					</Typography>
					<Hidden smDown>
						<div
							className={classes.searchContainer}
							onClick={this.handleSearchClick}
						>
							<SearchToolBarInput clickRef={this.inputRef} history={history}/>
						</div>
					</Hidden>
					<Hidden smUp>
						{phoneOS === "ios" ? (
							<a href={Settings().appStoreIos} target="_blank">
								<img
									className={classes.downloadBtn}
									src={servedImage("/images/appstore-apple.png")}
								/>
							</a>
						) : phoneOS === "android" ? (
							<a href={Settings().appStoreAndroid} target="_blank">
								<img
									className={classes.downloadBtn}
									src={servedImage("/images/appstore-google-play.png")}
								/>
							</a>
						) : (
							<div/>
						)}
					</Hidden>
					<Hidden xsDown>
						<div className={classes.appLinksContainer}>
							<a href={Settings().appStoreIos} target="_blank">
								<img
									className={classes.downloadBtn}
									src={servedImage("/images/appstore-apple.png")}
								/>
							</a>
							<a href={Settings().appStoreAndroid} target="_blank">
								<img
									className={classes.downloadBtn}
									src={servedImage("/images/appstore-google-play.png")}
								/>
							</a>
						</div>
					</Hidden>
				</div>
			</div>
		);
	}
}

export default withStyles(styles)(Hero);
