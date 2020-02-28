import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Hidden from "@material-ui/core/Hidden";
import classNames from "classnames";
import Typography from "@material-ui/core/Typography";
import SupportingArtistsLabel from "../../pages/events/SupportingArtistsLabel";
import {
	fontFamilyBold,
	fontFamilyDemiBold,
	secondaryHex
} from "../../../config/theme";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import optimizedImageUrl from "../../../helpers/optimizedImageUrl";
import ReadMoreAdditionalInfo from "./ReadMoreAdditionalInfo";
import SocialIconLink from "../social/SocialIconLink";

const styles = theme => ({
	root: {},
	media: {
		width: 119,
		height: 119,
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "center",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",

		paddingRight: theme.spacing.unit,
		paddingBottom: theme.spacing.unit,
		borderRadius: 10,
		[theme.breakpoints.down("md")]: {
			width: 70,
			height: 70
		},
		[theme.breakpoints.up("lg")]: {
			width: 100,
			height: 100
		}
	},
	mediaTopRow: {},
	mediaBottomRow: {
		display: "flex",
		justifyContent: "space-between"
	},
	socialLinks: {
		paddingRight: theme.spacing.unit * 4,

		[theme.breakpoints.down("xl")]: {
			paddingRight: theme.spacing.unit * 2
		},
		[theme.breakpoints.down("lg")]: {
			paddingRight: theme.spacing.unit / 2
		}
	},
	name: {
		color: "#FFFFFF",
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.5
	},
	content: {
		padding: theme.spacing.unit * 2,
		[theme.breakpoints.down("lg")]: {
			padding: theme.spacing.unit
		}
	},
	bio: {
		lineHeight: 1.5,
		color: "#656d78",
		fontSize: theme.typography.fontSize
	},
	nameHeading: {
		marginBottom: 5,
		marginTop: 5,
		fontFamily: "TTCommons-DemiBold",
		fontSize: "1rem",
		fontWeight: 400
	},
	headline: {
		color: "#B1B5C3",
		marginTop: 0,
		marginBottom: 0,
		[theme.breakpoints.down("lg")]: {
			fontSize: 12
		}
	},
	socialGrid: {
		marginTop: 20
	},
	socialMargin: {
		marginRight: 10
	}
});

class ArtistSummary extends Component {
	render() {
		const {
			classes,
			headliner,
			name,
			bio,
			thumb_image_url,
			bandcamp_username,
			facebook_username,
			image_url,
			instagram_username,
			snapchat_username,
			soundcloud_username,
			spotify_id,
			website_url,
			youtube_video_urls,
			theme
		} = this.props;

		let imageSrc = thumb_image_url || image_url || "/images/artist-placeholder.png";
		imageSrc = optimizedImageUrl(imageSrc, "low", { w: 100 });

		const artistSocial = (
			<div className={classes.socialGrid}>
				{facebook_username ? (
					<SocialIconLink
						className={classes.socialMargin}
						icon={"facebook"}
						userName={facebook_username}
						size={40}
						color={"neon"}
					/>
				) : null}

				{instagram_username ? (
					<SocialIconLink
						className={classes.socialMargin}
						icon={"instagram"}
						userName={instagram_username}
						size={40}
						color={"neon"}
					/>
				) : null}
				{snapchat_username ? (
					<SocialIconLink
						className={classes.socialMargin}
						icon={"snapchat"}
						userName={snapchat_username}
						size={40}
						color={"neon"}
					/>
				) : null}

				{soundcloud_username ? (
					<SocialIconLink
						className={classes.socialMargin}
						icon={"soundcloud"}
						userName={soundcloud_username}
						size={40}
						color={"neon"}
					/>
				) : null}

				{bandcamp_username ? (
					<SocialIconLink
						className={classes.socialMargin}
						icon={"bandcamp"}
						userName={bandcamp_username}
						size={40}
						color={"neon"}
					/>
				) : null}

				{website_url ? (
					<SocialIconLink
						className={classes.socialMargin}
						icon={"website"}
						href={website_url}
						size={40}
						color={"neon"}
					/>
				) : null}

				{spotify_id ? (
					<SocialIconLink
						className={classes.socialMargin}
						icon={"spotify"}
						userName={spotify_id}
						size={40}
						color={"neon"}
					/>
				) : null}
			</div>
		);

		return (
			<div>
				<Grid container spacing={8}>
					<Grid item xs={3}>
						<div
							className={classes.media}
							style={{
								backgroundImage: `url(${imageSrc})`
							}}
						>
						</div>
					</Grid>
					<Grid item xs={9}>
						<h6 className={classes.headline}>{headliner ? "HEADLINER" : "SUPPORTING ACT"}</h6>
						<Typography className={classes.nameHeading}>
							{name}
						</Typography>
						<ReadMoreAdditionalInfo>
							{bio}
						</ReadMoreAdditionalInfo>
						{artistSocial}
					</Grid>
				</Grid>
			</div>
		);
	}
}

ArtistSummary.propTypes = {
	classes: PropTypes.object.isRequired,
	headliner: PropTypes.bool,
	name: PropTypes.string.isRequired
};

export default withStyles(styles)(ArtistSummary);
