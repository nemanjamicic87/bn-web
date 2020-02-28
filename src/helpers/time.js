import moment from "moment-timezone";

// Tue, Dec 31, 2019 10:34 PM
export const TIME_FORMAT_FULL_DESCRIPTION = "llll";
// 12/31/2019 10:35 PM
export const TIME_FORMAT_MM_DD_YYYY_NO_TIMEZONE = "MM/DD/YYYY h:mm A";
// 12/31/2019 10:35 PM PST
export const TIME_FORMAT_MM_DD_YYYY_WITH_TIMEZONE = "MM/DD/YYYY h:mm A z";
// 2020-01-29
export const TIME_FORMAT_YYYY_MM_DD = "YYYY-MM-DD";
// 02 Feb
export const TIME_FORMAT_DD_MMM = "DD MMM";
/**
 * Accepts an object, iterates through elements and if it's an
 * instance of moment then update the timezone
 *
 * @params {group, timezone}
 * @returns {updatedMomentObjects}
 */
export const updateTimezonesInObjects = (
	group,
	timezone,
	maintainLocalTime = false
) => {
	const updatedMomentObjects = {};

	if (!timezone) {
		return updatedMomentObjects;
	}

	Object.keys(group).forEach(key => {
		const value = group[key];
		if (value instanceof moment) {
			const previousDateTimeNumbers = {
				year: value.get("year"),
				month: value.get("month"),
				date: value.get("date"),
				hour: value.get("hour"),
				minute: value.get("minute"),
				second: value.get("second")
			};

			const sameTimeDifferentZone = value.clone().tz(timezone);

			//Only if they're switching venue timezones do we want to maintain the original local time
			if (maintainLocalTime) {
				sameTimeDifferentZone.set(previousDateTimeNumbers);
			}

			updatedMomentObjects[key] = sameTimeDifferentZone;
		}
	});

	return updatedMomentObjects;
};
