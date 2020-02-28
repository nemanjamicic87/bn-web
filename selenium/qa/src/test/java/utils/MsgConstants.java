package utils;

public class MsgConstants {

	public static final String RESET_PASS_UNMATCHED_PASS_ERROR = "Please make sure passwords match";
	public static final String RESET_PASS_MISSING_PASS_ERROR = "Missing password";
	public static final String RESET_PASS_MISSING_CONFIRM_PASS_ERROR = "Missing password confirmation";
	public static final String ACCOUNT_UPDATED_NOTIFICATION = "Account updated";
	public static final String EMAIL_OR_PASS_INCORRECT_ON_LOGIN_ERROR = "Email or password incorrect";
	public static final String LOGIN_FAILED_ERROR = "Login failed";
	
	public static final String ORGANIZATION_CREATE_DUPLICATE_ERROR = "Duplicate record exists";
	public static final String ORGANIZATION_CREATE_FAILED = "Create organization failed";
	public static final String ORGANIZATION_CREATED_SUCCESS = "Organization created";
	public static final String ORGANIZATION_PER_ORDER_FEE_UPDATED = "Per order fee updated";
	public static final String ORGANIZAATION_FEE_SCHEDULE_SAVED = "Fee schedule saved";
	
	public static final String VENUE_CREATED_SUCCESS = "Venue created";
	public static final String VENUE_UPDATED_SUCCESS = "Venue updated";
		
	public static final String EVENT_PUBLISHED = "Event published";
	public static final String EVENT_SAVED_TO_DRAFT = "Draft saved";
	public static final String EVENT_DELETION_FAILED = "Event is ineligible for deletion";
	public static final String INVALID_EVENT_DETAILS = "There are invalid event details.";
	public static final String EVENT_WITH_SALES_CANT_MOVE_TO_PAST_DATE = "Event with sales cannot move to past date. Event with sales cannot move to past date.";
	
	public static final String MORE_THAN_ONE_EVENT_PURCHASE_ERROR = "Cart limited to one event for purchasing";
	
	public static final String TICKET_TRANSFER_EMAIL_LINK_SENT_SUCCESS = "Ticket transfer link sent";
	public static final String TICKET_TRANSFER_INVALID_DESTINATION_ERROR = "Invalid destination, please supply valid phone number or email address";
	public static final String TICKET_TRANSFER_INVALID_MOBILE_NUMBER_OR_EMAIL_ADDRESS_VALIDATION = "Invalid mobile number or email address";
	public static final String TICKET_TRANSFER_RECEIVING_TICKETS_FAILED = "Receiving tickets failed";
	public static final String COULD_NOT_INSERT_RECORD = "Could not insert record";
	public static final String QUERY_ERROR = "Query error";
	
	public static final String FAN_PROFILE_LOAD_ERROR = "Failed to load fan profile";	
	public static final String ORDER_MANANGE_ACTIVITY_ITEM_NOTE_ADDED = "Note saved";
	
	
	public static String resetPasswordMessage(String mail) {
		return "Your request has been received; " + mail + " will receive an email shortly with a link to reset your password if it is an account on file";
	}
}
