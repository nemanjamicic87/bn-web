import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
import { observer } from "mobx-react";
import PropTypes from "prop-types";

import notifications from "../../stores/notifications";
import Button from "./Button";
import InputGroup from "../common/form/InputGroup";
import user from "../../stores/user";
import removePhoneFormatting from "../../helpers/removePhoneFormatting";
import { validPhone } from "../../validators";

const branchKey = process.env.REACT_APP_BRANCH_KEY;

const styles = theme => ({
	smsContainer: {
		padding: theme.spacing.unit * 2
	}
});

@observer
class SMSLinkForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			phone: "",
			isSubmitting: false,
			isSent: false
		};
	}

	componentDidMount() {
		setTimeout(() => {
			const { phone } = user;
			if (phone) {
				this.setState({ phone });
			}
		}, 500);

		//TODO check we have a key in the env file and render something else instead if it's missing

		if (!branchKey) {
			console.warn("Missing REACT_APP_BRANCH_KEY");
			return;
		}

		(function(b, r, a, n, c, h, _, s, d, k) {
			if (!b[n] || !b[n]._q) {
				for (; s < _.length; ) c(h, _[s++]);
				d = r.createElement(a);
				d.async = 1;
				d.src = "https://cdn.branch.io/branch-latest.min.js";
				k = r.getElementsByTagName(a)[0];
				k.parentNode.insertBefore(d, k);
				b[n] = h;
			}
		})(
			window,
			document,
			"script",
			"branch",
			function(b, r) {
				b[r] = function() {
					b._q.push([r, arguments]);
				};
			},
			{ _q: [], _v: 1 },
			"addListener applyCode banner closeBanner creditHistory credits data deepview deepviewCta first getCode init link logout redeem referrals removeListener sendSMS setBranchViewData setIdentity track validateCode".split(
				" "
			),
			0
		);

		branch.init(branchKey);
	}

	sendSMS(phone, onSuccess, onError) {
		if (!branchKey) {
			return notifications.show({ message: "SMS currently unavailable." });
		}

		branch.sendSMS(
			phone,
			{
				channel: "Website",
				feature: "Text-Me-The-App",
				data: {}
			},
			{ make_new_link: false }, // Default: false. If set to true, sendSMS will generate a new link even if one already exists.
			function(err) {
				if (err) {
					onError(err);
				} else {
					onSuccess();
				}
			}
		);
	}

	onSubmit(e) {
		e.preventDefault();
		const phone = removePhoneFormatting(this.state.phone);

		if (!validPhone(phone)) {
			return notifications.show({
				message: "Invalid phone number.",
				variant: "warning"
			});
		}

		this.setState({ isSubmitting: true });

		this.sendSMS(
			phone,
			() => {
				this.setState({ isSubmitting: false, isSent: true });
				notifications.show({ message: "SMS sent!", variant: "success" });

				const { onSuccess } = this.props;
				onSuccess ? onSuccess() : null;
			},
			err => {
				this.setState({ isSubmitting: false });
				console.error(err);
				notifications.show({
					message: "Sorry, something went wrong.",
					variant: "error"
				});
			}
		);
	}

	render() {
		const { phone, isSubmitting, isSent } = this.state;
		const { classes, autoFocus } = this.props;
		return (
			<div className={classes.smsContainer}>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<InputGroup
						autoFocus={autoFocus}
						label="Mobile number"
						value={phone}
						placeholder="+1"
						type="phone"
						name="phone"
						onChange={e => this.setState({ phone: e.target.value })}
					/>
					{!isSent ? (
						<Button
							type="submit"
							disabled={isSubmitting}
							style={{ width: "100%" }}
							variant="secondary"
						>
							{isSubmitting ? "Sending..." : "Text me the link"}
						</Button>
					) : null}
				</form>
			</div>
		);
	}
}

SMSLinkForm.propTypes = {
	classes: PropTypes.object.isRequired,
	autoFocus: PropTypes.bool,
	onSuccess: PropTypes.func
};

export default withStyles(styles)(SMSLinkForm);
