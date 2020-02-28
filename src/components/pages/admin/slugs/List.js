import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import InputGroup from "../../../common/form/InputGroup";

import notifications from "../../../../stores/notifications";
import Button from "../../../elements/Button";
import Bigneon from "../../../../helpers/bigneon";
import PageHeading from "../../../elements/PageHeading";
import Loader from "../../../elements/loaders/Loader";
import StyledLink from "../../../elements/StyledLink";
import Dialog from "../../../elements/Dialog";
import SlugRow from "./SlugRow";
import Card from "../../../elements/Card";
import {
	fontFamilyDemiBold,
	primaryHex,
	secondaryHex
} from "../../../../config/theme";
import servedImage from "../../../../helpers/imagePathHelper";
import RichTextInputField
	from "../../../elements/form/rich-editor/RichTextInputField";
import FormatInputLabel from "../../../elements/form/FormatInputLabel";
import { Pagination, urlPageParam } from "../../../elements/pagination";
import Hidden from "@material-ui/core/Hidden";
import ellipsis from "../../../../helpers/ellipsis";
import { Link } from "react-router-dom";
import SelectGroup from "../../../common/form/SelectGroup";

const styles = theme => ({
	paper: {
		display: "flex"
	},
	content: {
		padding: theme.spacing.unit * 2
	},
	heading: {
		fontFamily: fontFamilyDemiBold
	},
	cardContent: {
		padding: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit,
		flex: "1 0 auto"
	},
	media: {
		width: "100%",
		maxWidth: 150,
		height: 150
	},
	slugLink: {
		color: secondaryHex
	},
	actionButtons: {
		display: "flex",
		alignItems: "flex-end",
		padding: theme.spacing.unit
	},
	linkStyle: {
		colour: primaryHex,
		"&:visited": {
			colour: primaryHex
		}
	},
	textAreaStyle: {
		width: 580,
		minHeight: 200,
		fontSize: 16,
		outline: "none",
		padding: 10
	},
	icon: {
		marginLeft: theme.spacing.unit * 2,
		width: 14,
		height: 14,
		cursor: "pointer"
	}
});

class SlugsList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			modalOpen: false,
			paging: null,
			slugs: null,
			slugId: null,
			title: "",
			description: "",
			isSubmitting: false,
			slugType: "Genre",
			slugHref: "genres"
		};
	}

	componentDidMount() {
		this.refreshSlugs("", 0);
	}

	refreshSlugs(query = "", page = urlPageParam()) {
		const { slugType } = this.state;
		this.setState({ paging: null });
		const slugHrefs = {
			"Genre": "genres",
			"Organization": "organizations",
			"Venue": "venues"
		};
		Bigneon()
			.slugs.index({ type: slugType, page, limit: 20 })
			.then(response => {
				const { data, paging } = response.data;
				const slugHref = slugHrefs[slugType] || "genres";
				this.setState({ slugHref, slugs: data, paging });
			})
			.catch(error => {
				let message = "Loading slugs failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	changePage(page = urlPageParam()) {
		this.refreshSlugs("", page);
	}

	toggleModal(slugId) {
		if (slugId) {
			const currentSlug = this.state.slugs.find(slug => slug.id === slugId);
			this.setState(prevState => ({
				modalOpen: !prevState.modalOpen,
				slugId: slugId,
				title: currentSlug.title ? currentSlug.title : "",
				description: currentSlug.description ? currentSlug.description : ""
			}));
		} else {
			this.setState({ modalOpen: false });
		}
	}

	updateSlug(event) {
		event.preventDefault();
		const { slugId, title, description } = this.state;
		this.setState(
			{
				isSubmitting: true
			},
			() => {
				Bigneon()
					.slugs
					.update({
						id: slugId,
						title,
						description
					})
					.then(response => {
						this.refreshSlugs();
						this.setState(
							{ isSubmitting: false },
							this.toggleModal.bind(this, null)
						);
					})
					.catch(error => {
						notifications.showFromErrorResponse({
							defaultMessage: "Loading slugs failed.",
							error
						});
					});
			}
		);
	}

	renderSlugs() {
		const { slugs, paging, isLoading, slugType, slugHref } = this.state;
		const { classes } = this.props;

		const slugTypes = [
			// { value: "City", label: "City" },
			{ value: "Genre", label: "Genre" },
			{ value: "Organization", label: "Organization" },
			{ value: "Venue", label: "Venue" }
		];
		if (slugs === null) {
			return <Loader/>;
		}

		if (slugs.length === 0) {
			return <Typography>No slugs currently.</Typography>;
		}

		return (
			<Card>
				<div className={classes.content}>
					<SelectGroup
						value={slugType}
						items={slugTypes}
						name={"slug-type"}
						label={"Slug Type"}
						onChange={e => {
							this.setState({ slugType: e.target.value }, () => {
								this.refreshSlugs("", 0);
							});
						}}
					/>
					<Hidden smDown>
						<SlugRow>
							<Typography
								className={classes.heading}
							>
								Slug
							</Typography>
							<Typography
								className={classes.heading}
							>
								Title
							</Typography>
							<Typography
								className={classes.heading}
							>Description
							</Typography>
							<Typography
								className={classes.heading}
							>
								Update
							</Typography>
						</SlugRow>

						{slugs.map((item, index) => {
							const { id, slug, title, description } = item;
							return (
								<SlugRow shaded={!(index % 2)} key={id}>
									<a
										href={`/${slugHref}/${slug}`}
										target="_blank"
									>
										<Typography
											className={classes.slugLink}
										>
											{slug}
										</Typography>
									</a>
									<Typography className={classes.itemText}>
										{title ? title : null}
									</Typography>
									<Typography className={classes.itemText}>
										{description ? ellipsis(description, 80) : null}
									</Typography>
									<Typography className={classes.itemText}>
										<span
											onClick={this.toggleModal.bind(this, id)}
										>
											<img
												alt={name}
												src={servedImage(`/icons/edit-gray.svg`)}
												className={classes.icon}
											/>
										</span>
										<br/>
									</Typography>
								</SlugRow>
							);
						})}
					</Hidden>
					{/*mobi*/}
					<Hidden smUp>
						<SlugRow>
							<Typography
								className={classes.heading}
							>
								Slug
							</Typography>
							<Typography
								className={classes.heading}
							>
								Update
							</Typography>
						</SlugRow>

						{slugs.map((item, index) => {
							const { id, slug } = item;
							return (
								<SlugRow shaded={!(index % 2)} key={id}>
									<a href={`/genres/${slug}`} target="_blank">
										<Typography
											className={classes.slugLink}
										>
											{slug}
										</Typography>
									</a>
									<Typography className={classes.itemText}>
										<span
											onClick={this.toggleModal.bind(this, id)}
										>
											<img
												alt={name}
												src={servedImage(`/icons/edit-gray.svg`)}
												className={classes.icon}
											/>
										</span>
										<br/>
									</Typography>
								</SlugRow>
							);
						})}
					</Hidden>
				</div>
			</Card>
		);
	}

	renderDialog() {
		const { classes } = this.props;
		const { isSubmitting, slugId, title, description } = this.state;
		return (
			<Dialog
				onClose={this.toggleModal.bind(this, slugId)}
				open={this.state.modalOpen}
				title={"Update slug"}
			>
				<form
					noValidate
					autoComplete="off"
					onSubmit={this.updateSlug.bind(this)}
				>
					<InputGroup
						value={title}
						name="name"
						label="Slug Title"
						type="text"
						onChange={e =>
							this.setState({
								slugId,
								title: e.target.value
							})
						}
					/>
					<FormatInputLabel style={{ marginBottom: 10 }}>
						Description
					</FormatInputLabel>
					<br/>
					<Typography>Please ensure that your HTML is
						valid. </Typography>
					<a
						href="https://www.online-toolz.com/tools/html-validator.php"
						target="_blank"
					>
						<Typography className={classes.slugLink}>
							Here is an HTML Validator should you wish to check
							before.
						</Typography>
					</a>
					<textarea
						className={classes.textAreaStyle}
						value={description ? description : ""}
						onChange={e => this.setState({ description: e.target.value })}
					/>
					<div style={{ display: "flex", marginTop: 20 }}>
						<Button
							style={{ marginRight: 5, flex: 1 }}
							onClick={this.toggleModal.bind(this, slugId)}
							color="primary"
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							disabled={isSubmitting}
							type="submit"
							style={{ marginLeft: 5, flex: 1 }}
							variant="callToAction"
						>
							{isSubmitting ? "Updating..." : "Update"}
						</Button>
					</div>
				</form>
			</Dialog>
		);
	}

	render() {
		const { paging } = this.state;

		return (
			<div>
				{this.renderDialog()}
				<PageHeading>Edit Slugs</PageHeading>
				{this.renderSlugs()}
				{paging !== null ? (
					<Pagination
						isLoading={false}
						paging={paging}
						onChange={this.changePage.bind(this)}
					/>
				) : (
					<div/>
				)}
			</div>
		);
	}
}

export default withStyles(styles)(SlugsList);
