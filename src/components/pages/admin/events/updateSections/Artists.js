import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { Hidden, withStyles } from "@material-ui/core";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import moment from "moment-timezone";

import Button from "../../../../elements/Button";
import notifications from "../../../../../stores/notifications";
import AutoCompleteGroup from "../../../../common/form/AutoCompleteGroup";
import Bigneon from "../../../../../helpers/bigneon";
import EventArtist from "./EventArtist";
import LeftAlignedSubCard from "../../../../elements/LeftAlignedSubCard";
import eventUpdateStore from "../../../../../stores/eventUpdate";
import user from "../../../../../stores/user";
import Loader from "../../../../elements/loaders/Loader";
import servedImage from "../../../../../helpers/imagePathHelper";
import FlipMove from "react-flip-move";

const styles = theme => ({
	paddedContent: {
		paddingRight: theme.spacing.unit * 12,
		paddingLeft: theme.spacing.unit * 12,
		marginTop: theme.spacing.unit * 4,

		[theme.breakpoints.down("sm")]: {
			paddingRight: theme.spacing.unit,
			paddingLeft: theme.spacing.unit
		}
	}
});

const formatForSaving = artists => {
	const artistArray = artists.map(({ id, setTime, importance = 0 }) => ({
		artist_id: id,
		importance,
		set_time: setTime
			? moment.utc(setTime).format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
			: null
	}));

	return artistArray;
};

const formatForInput = artistArray => {
	const artists = artistArray.map(({ artist, set_time, importance = 0 }) => {
		return {
			id: artist.id,
			importance,
			setTime: set_time
				? moment.utc(set_time, moment.HTML5_FMT.DATETIME_LOCAL_MS)
				: null,
			artist
		};
	});

	return artists;
};

@observer
class ArtistDetails extends Component {
	debounceSearch = false;

	constructor(props) {
		super(props);

		this.state = {
			showArtistSelect: false,
			//These are the current search results for artists
			availableArtists: null,
			//These are artists that have been chosen, but not saved
			pendingArtists: [],
			spotifyAvailableArtists: null,
			spotifyArtists: {},
			isSubmitting: false,
			isSearching: false
		};
	}

	componentDidMount() {
		//Load some initial artists
		Bigneon()
			.artists.index()
			.then(response => {
				const { data } = response.data;
				this.setState({ availableArtists: data });
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "There was a problem loading the artists"
				});
			});
	}

	addNewArtist(id) {
		const { spotifyArtists, pendingArtists, availableArtists } = this.state;

		if (spotifyArtists.hasOwnProperty(id)) {
			//Add spotifyArtist
			this.createNewArtist({ spotify_id: id });
			return;
		}

		pendingArtists.push(availableArtists.find(artist => artist.id === id));
		this.setState({ pendingArtists }, () => {
			eventUpdateStore.addArtist(id);

			if (eventUpdateStore.artists.length === 1) {
				const { availableArtists } = this.state;
				const selectedArtist = availableArtists.find(a => a.id === id);
				if (selectedArtist && selectedArtist.image_url) {
					if (!eventUpdateStore.event.promoImageUrl) {
						//Assume the promo image is the headliner artist
						eventUpdateStore.updateEvent({
							promoImageUrl: selectedArtist.image_url
						});
					}

					//If here's no event name yet, assume the event name to be the headlining artist
					if (!eventUpdateStore.event.name) {
						eventUpdateStore.updateEvent({ name: selectedArtist.name });
					}
				}
			}
		});

	}

	onDelete(index) {
		const { event, artists } = eventUpdateStore;
		const { availableArtists } = this.state;
		const id = artists[index].id;
		const selectedArtist = availableArtists.find(a => a.id === id);
		const currentEventPromoUrl = event.promoImageUrl || "";

		//If the event promo image was set by this artist, remove it
		if (currentEventPromoUrl === selectedArtist.image_url) {
			eventUpdateStore.updateEvent({
				promoImageUrl: ""
			});
		}

		eventUpdateStore.removeArtist(index);
	}

	createNewArtist(nameOrObj) {
		//TODO make a creatingArtist state var to show it's being done so the user doesn't keep trying
		const defaultNewArtist = {
			bio: "",
			youtube_video_urls: [],
			organization_id: user.currentOrganizationId
		};
		if (typeof nameOrObj === "string") {
			nameOrObj = {
				name: nameOrObj
			};
		}
		const artistDetails = {
			...defaultNewArtist,
			...nameOrObj
		}; //TODO remove youtube_video_urls when it's not needed

		Bigneon()
			.artists.create(artistDetails)
			.then(response => {
				const { id } = response.data;
				//Once inserted we need it in availableArtists right away
				this.setState(({ availableArtists }) => {
					availableArtists.push(response.data);
					return { availableArtists };
				});

				//Add the
				this.addNewArtist(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					defaultMessage: "Creating new artist failed.",
					error
				});

				this.setState({ isSubmitting: false });
			});
	}

	search(searchName) {
		this.setState({ isSearching: true });
		clearTimeout(this.debounceSearch);
		if (!searchName.trim()) {
			return;
		}

		this.debounceSearch = setTimeout(async () => {
			try {
				let results = await Bigneon().artists.search({
					q: searchName,
					spotify: 1
				});
				results = results.data.data;
				const spotifyArtists = {};
				const spotifyResults = [];
				const availableArtists = [];
				results
					.forEach(artist => {
						if (!artist.id && artist.spotify_id) {
							spotifyArtists[artist.spotify_id] = true;
							spotifyResults.push(artist);
						} else {
							availableArtists.push(artist);
						}

					});
				this.setState({
					isSearching: false,
					spotifyAvailableArtists: results,
					spotifyArtists,
					availableArtists
				});
			} catch (e) {
				this.setState({ isSearching: false });
				console.error(e);
			}
		}, 500);
	}

	renderSelectOption(props) {
		const id = props.value;
		const { spotifyArtists, availableArtists } = this.state;

		let icon;
		if (spotifyArtists.hasOwnProperty(id)) {
			icon = (
				<img
					alt="Spotify"
					style={{ width: 20, height: 20 }}
					src={servedImage("/images/spotify.png")}
				/>
			);
		} else if (availableArtists.find(a => a.id === id)) {
			icon = (
				<img
					alt="Big Neon"
					style={{ width: 20, height: 20 }}
					src={servedImage("/images/bn-logo.png")}
				/>
			);
		} else {
			//Assume it's the create menu item
			icon = (
				<img
					alt="Create"
					style={{ width: 14, height: 14 }}
					src={servedImage("/icons/add-active.svg")}
				/>
			);
		}

		return (
			<MenuItem
				buttonRef={props.innerRef}
				selected={props.isFocused}
				component="div"
				style={{
					fontWeight: props.isSelected ? 500 : 400
				}}
				{...props.innerProps}
			>
				{icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
				<ListItemText inset primary={props.children}/>
			</MenuItem>
		);
	}

	renderAddNewArtist() {
		//Pass through the currently selected artist if one has been selected
		const {
			availableArtists,
			spotifyAvailableArtists,
			isSearching
		} = this.state;
		if (availableArtists === null) {
			return <Loader>Loading artists...</Loader>;
		}

		const artistsObj = {};
		availableArtists.forEach(artist => {
			const id = artist.id || artist.spotify_id;
			artistsObj[id] = artist.name;
		});

		if (spotifyAvailableArtists) {
			spotifyAvailableArtists.forEach(artist => {
				const id = artist.id || artist.spotify_id;
				artistsObj[id] = artist.name;
			});
		}

		const { artists } = eventUpdateStore;

		const isHeadline = artists && artists.length < 1;

		return (
			<AutoCompleteGroup
				value={""}
				items={artistsObj}
				name={"artists"}
				label={`Add your ${isHeadline ? "headline act*" : "supporting act"}`}
				onInputChange={this.search.bind(this)}
				placeholder={"eg. Childish Gambino"}
				onChange={artistId => {
					if (artistId) {
						this.addNewArtist(artistId);
						this.setState({ showArtistSelect: false });
					}
				}}
				formatCreateLabel={label =>
					isSearching
						? `Searching artists for ${label} - Click here to skip search and create`
						: `Create a new artist "${label}"`
				}
				onCreateOption={this.createNewArtist.bind(this)}
				renderSelectOption={this.renderSelectOption.bind(this)}
			/>
		);
	}

	renderAddArtistButton() {
		const { showArtistSelect } = this.state;
		const { artists } = eventUpdateStore;

		const props = {
			onClick: () => this.setState({ showArtistSelect: true }),
			variant: "additional"
		};
		const label = "Add supporting artist";

		if (artists.length > 0 && !showArtistSelect) {
			return (
				<div>
					<Hidden mdUp>
						<Button style={{ width: "100%" }} {...props}>
							{label}
						</Button>
					</Hidden>
					<Hidden smDown>
						<Button {...props}>{label}</Button>
					</Hidden>
				</div>
			);
		}

		return null;
	}

	render() {
		const { classes, errors } = this.props;
		const { pendingArtists, showArtistSelect } = this.state;
		const { artists, artistTypeActiveIndex } = eventUpdateStore;

		return (
			<div>
				<FlipMove staggerDurationBy="50">
					{artists.map((eventArtist, index) => {
						const { id, setTime, importance } = eventArtist;
						const { artist = pendingArtists.find(i => i.id === id) } = eventArtist;

						const name = artist.name;
						const thumb_image_url = artist.thumb_image_url || artist.image_url;
						const {
							bandcamp_username,
							facebook_username,
							instagram_username,
							snapchat_username,
							soundcloud_username,
							website_url
						} = artist;
						const socialAccounts = {
							bandcamp: bandcamp_username,
							facebook: facebook_username,
							instagram: instagram_username,
							snapchat: snapchat_username,
							soundcloud: soundcloud_username,
							website: website_url
						};

						let active = index === artistTypeActiveIndex;
						const isCancelled = eventArtist.status === "Cancelled";

						const ticketTypeErrors =
							errors && errors[index] ? errors[index] : {};

						//If we have errors, force their eyes to see them
						if (Object.keys(ticketTypeErrors).length > 0) {
							active = true;
						}

						const onMoveUp =
							index < 1
								? null
								: () => {
									active ? eventUpdateStore.artistActivate(null) : null;
									eventUpdateStore.moveOrderArtist(index, "up");
								};

						const onMoveDown =
							index + 1 >= artists.length
								? null
								: () => {
									active ? eventUpdateStore.artistActivate(null) : null;
									eventUpdateStore.moveOrderArtist(index, "down");
								};

						const uniqueFlipKey = eventArtist.id || index;

						return (
							<LeftAlignedSubCard
								key={uniqueFlipKey}
								active={active}
							>
								<EventArtist
									socialAccounts={socialAccounts}
									typeHeading={importance === 0 ? "Headline act *" : "Supporting act"}
									title={name}
									setTime={setTime}
									importance={importance}
									onChangeSetTime={setTime => {
										eventUpdateStore.changeArtistSetTime(index, setTime);
									}}
									onChangeImportance={currentImportance => {
										eventUpdateStore.changeArtistImportance(
											index,
											currentImportance ? 0 : 1
										);
									}}
									imgUrl={
										thumb_image_url || "/images/profile-pic-placeholder.png"
									}
									error={errors ? errors[index] : null}
									onDelete={() => this.onDelete(index)}
									onMoveUp={onMoveUp}
									onMoveDown={onMoveDown}
								/>
							</LeftAlignedSubCard>
						);
					})}
				</FlipMove>

				<div className={classes.paddedContent}>
					{showArtistSelect || artists.length === 0
						? this.renderAddNewArtist()
						: null}

					{this.renderAddArtistButton()}
				</div>
			</div>
		);
	}
}

ArtistDetails.propTypes = {
	eventId: PropTypes.string,
	errors: PropTypes.object.isRequired
};

export const Artists = withStyles(styles)(ArtistDetails);
export const formatArtistsForSaving = formatForSaving;
export const formatArtistsForInputs = formatForInput;
