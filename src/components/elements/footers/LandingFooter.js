import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import classnames from "classnames";
import Settings from "../../../config/settings";
import {
	callToActionBackground,
	fontFamilyDemiBold,
	fontFamily,
	fontFamilyBold
} from "../../../config/theme";
import servedImage from "../../../helpers/imagePathHelper";

//TODO change external links
const rootUrl = "";
const custLinks = [];
const aboutLinks = [
	{
		label: "About Us",
		href: Settings().aboutLink
	},
	{
		label: "Partner With Us",
		href: Settings().aboutChatLink
	}
];
const infoLinks = [
	{
		label: "Terms of Use",
		href: `${rootUrl}/terms.html`
	},
	{
		label: "Privacy Policy",
		href: `${rootUrl}/privacy.html`
	}
];
const smLinks = [
	{
		href: Settings().facebookLink,
		imgUrl: "facebook-icon.png"
	},
	{
		href: Settings().instagramLink,
		imgUrl: "instagram-icon.png"
	},
	{
		href: Settings().twitterLink,
		imgUrl: "twitter-icon.png"
	}
];

if (Settings().appSupportLink) {
	custLinks.push({
		label: "Support",
		href: Settings().appSupportLink
	});
}

const styles = theme => ({
	root: {
		flex: 1,
		display: "flex",
		justifyContent: "center",
		//marginTop: theme.spacing.unit * 10,
		textAlign: "center",
		backgroundColor: "#FFFFFF"
	},
	content: {
		width: "100%",
		maxWidth: 1400,
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2,
		display: "flex",
		alignItems: "center",
		[theme.breakpoints.down("sm")]: {
			flexDirection: "column",
			alignItems: "flex-start"
		},
		justifyContent: "space-between"
	},
	alignStart: {
		alignItems: "flex-start"
	},
	copyrightContainer: {
		justifyContent: "center",
		display: "flex",
		borderTop: "1px solid #E8EAEE;",
		paddingBottom: theme.spacing.unit * 3,
		paddingTop: theme.spacing.unit * 3,
		marginTop: theme.spacing.unit * 6,
		alignItems: "center",
		[theme.breakpoints.down("sm")]: {
			marginBottom: theme.spacing.unit * 10
		}
	},
	copyright: {
		fontSize: 12,
		color: "#9DA3B4",
		opacity: 0.8,
		[theme.breakpoints.down("sm")]: {
			width: "100%",
			display: "flex",
			flexDirection: "column",
			alignItems: "flex-start",
			marginTop: theme.spacing.unit * 3
		}
	},
	appLinksContainers: {
		display: "flex",
		flexDirection: "column",
		[theme.breakpoints.down("sm")]: {
			flexDirection: "row"
		}
	},
	link: {
		color: "#3C383F",
		fontFamily: fontFamily,
		fontSize: 18,
		textTransform: "capitalize",
		paddingTop: theme.spacing.unit,
		paddingBottom: theme.spacing.unit
	},
	logo: {
		height: 50,
		width: "auto"
	},
	downloadBtn: {
		width: 140,
		marginRight: theme.spacing.unit,
		marginBottom: theme.spacing.unit,
		height: 47
	},
	footerContentBlock: {
		marginTop: theme.spacing.unit * 5,
		textAlign: "left",
		[theme.breakpoints.down("sm")]: {
			marginTop: theme.spacing.unit * 2
		}
	},
	alignRightDesktop: {
		textAlign: "right",
		[theme.breakpoints.down("sm")]: {
			textAlign: "left"
		}
	},
	footerLinkTitle: {
		fontSize: 20,
		lineHeight: "23px",
		fontFamily: fontFamilyBold,
		[theme.breakpoints.down("sm")]: {}
	},
	footerLinkContainer: {
		display: "flex",
		flexDirection: "column",
		marginTop: theme.spacing.unit * 4,
		[theme.breakpoints.down("sm")]: {
			marginTop: theme.spacing.unit * 1
		}
	},
	smContainer: {
		flexDirection: "row"
	},
	smIcon: {
		marginRight: theme.spacing.unit,
		width: 50,
		height: 50,
		[theme.breakpoints.down("sm")]: {
			width: 40,
			height: 40
		}
	}
});

const LandingFooter = props => {
	const { classes } = props;
	const dateYear = new Date().getFullYear();
	return (
		<div className={classes.root}>
			<Grid container justify="center">
				<div
					className={classnames({
						[classes.content]: true,
						[classes.alignStart]: true
					})}
				>
					<Grid container>
						<Grid item xs={6} sm={6} md={2} lg={2}>
							<div className={classes.footerContentBlock}>
								<Typography className={classes.footerLinkTitle}>
									About Big Neon
								</Typography>
								<div className={classes.footerLinkContainer}>
									{aboutLinks.map(({ label, href }, index) => (
										<a
											key={index}
											className={classes.link}
											href={href}
											target="_blank"
										>
											{label}
										</a>
									))}
								</div>
							</div>
						</Grid>
						<Grid item xs={6} sm={6} md={2} lg={2}>
							<div className={classes.footerContentBlock}>
								<Typography className={classes.footerLinkTitle}>
									Customers
								</Typography>
								<div className={classes.footerLinkContainer}>
									{custLinks.map(({ label, href }, index) => (
										<a
											key={index}
											className={classes.link}
											href={href}
											target="_blank"
										>
											{label}
										</a>
									))}
								</div>
							</div>
						</Grid>
						<Grid item xs={6} sm={6} md={2} lg={2}>
							<div className={classes.footerContentBlock}>
								<Typography className={classes.footerLinkTitle}>
									Further Info
								</Typography>
								<div className={classes.footerLinkContainer}>
									{infoLinks.map(({ label, href }, index) => (
										<a
											key={index}
											className={classes.link}
											href={href}
											target="_blank"
										>
											{label}
										</a>
									))}
								</div>
							</div>
						</Grid>
						<Grid item xs={6} sm={6} md={3} lg={3}>
							<div className={classes.footerContentBlock}>
								<Typography className={classes.footerLinkTitle}>
									Follow Us
								</Typography>
								<div
									className={classnames({
										[classes.footerLinkContainer]: true,
										[classes.smContainer]: true
									})}
								>
									{smLinks.map(({ imgUrl, href }, index) => (
										<a key={index} href={href} target="_blank">
											<img
												className={classes.smIcon}
												src={servedImage(`/icons/${imgUrl}`)}
												alt="Social Media Icon Button"
											/>
										</a>
									))}
								</div>
							</div>
						</Grid>
						<Grid item xs={12} sm={12} md={3} lg={3}>
							<div
								className={classnames({
									[classes.footerContentBlock]: true,
									[classes.alignRightDesktop]: true
								})}
							>
								<Typography className={classes.footerLinkTitle}>
									Download Now:&nbsp;&nbsp;&nbsp;
								</Typography>
								<div className={classes.footerLinkContainer}>
									<div className={classes.appLinksContainers}>
										<a href={Settings().appStoreIos} target="_blank">
											<img
												className={classes.downloadBtn}
												src={servedImage("/images/appstore-apple.png")}
												alt="App Store download button"
											/>
										</a>
										<a href={Settings().appStoreAndroid} target="_blank">
											<img
												className={classes.downloadBtn}
												src={servedImage("/images/appstore-google-play.png")}
												alt="Google Play download button"
											/>
										</a>
									</div>
								</div>
							</div>
						</Grid>
					</Grid>
				</div>
				<Grid item xs={12} sm={12} md={12} lg={12}>
					<div className={classes.copyrightContainer}>
						<div className={classes.content}>
							<a href="/">
								<img
									alt={"LandingFooter icon"}
									src={servedImage("/images/logo.png")}
									className={classes.logo}
								/>
							</a>
							<Typography className={classes.copyright}>
								Copyright {dateYear}. BigNeon, Inc. All Rights Reserved.
							</Typography>
						</div>
					</div>
				</Grid>
			</Grid>
		</div>
	);
};

LandingFooter.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(LandingFooter);
