package test.facade.orders.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.openqa.selenium.WebDriver;
import org.testng.Assert;
import org.testng.asserts.SoftAssert;

import data.holders.ticket.order.OrderDetailsData;
import model.Event;
import model.Purchase;
import model.TicketType;
import model.User;
import model.Venue;
import pages.admin.orders.manage.SelectedOrderPage;
import pages.components.admin.orders.manage.ActivityItem;
import pages.components.admin.orders.manage.ActivityItem.ExpandedContent;
import pages.components.admin.orders.manage.ActivityItem.NoteExpandedContent;
import pages.components.admin.orders.manage.ActivityItem.RefundedExpandedContent;
import pages.components.admin.orders.manage.OrderInfo;
import pages.components.admin.orders.manage.tickets.OrderTicketsDetails.PerOrderFeeComponent;
import pages.components.admin.orders.manage.tickets.TicketRow;
import pages.components.dialogs.IssueRefundDialog;
import pages.components.dialogs.IssueRefundDialog.RefundReason;
import pages.components.dialogs.RefundOverrideDialog;
import pages.components.dialogs.RefundSuccessfulDialog;
import test.facade.BaseFacadeSteps;
import utils.MsgConstants;
import utils.ProjectUtils;

public class OrderManageFacade extends BaseFacadeSteps{
	
	private Map<String, Object> dataMap;
	private final String SELECTED_ORDER_PAGE_KEY = "selected_order_page";
	private final String ISSUE_REFUND_DIALOG_KEY = "issue_refund_dialog";
	private final String TOTAL_REFUND_AMOUNT_KEY = "total_refund_amount";
	private final String TEMP_TOTAL_REFUND_AMOUNT_KEY = "temp_total_refund_amount";

	public OrderManageFacade(WebDriver driver) {
		super(driver);
		this.dataMap = new HashMap<String, Object>();
	}
	
	public void refundSteps(RefundReason refundReason) {
		refundSteps(refundReason, false);
	}
	
	public void refundSteps(RefundReason refundReason, boolean isFullRefund) {
		whenUserExpandOrderDetailsAndCheckIfExpanded();
		if (isFullRefund) {
			whenUserSelectsAllTicketsForRefund();
			whenUserClicksOnOrderFeeCheckBox(true, true);
			thenRefundButtonShouldBeVisible();
			whenUserClicksOnRefundButton();
		} else {
			whenUserSelectsTicketForRefundAndClicksOnRefundButton();
		}
		thenRefundDialogShouldBeVisible();
		whenUserSelectRefundReasonAndClicksOnConfirmButton(RefundReason.OTHER);
		thenRefundDialogShouldBeVisible();
		whenUserClicksOnGotItButtonOnRefundSuccessDialog();
	}
	
	public boolean whenUserExpandOrderDetailsAndCheckIfExpanded() {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		selectedOrderPage.expandOrderDetails();
		return selectedOrderPage.getOrderDetails().isExpanded();
	}
	
	public void whenUserSelectsTicketForRefundAndClicksOnRefundButton() {
		whenUserSelectsPurchasedStatusTicketForRefund();
		whenUserClicksOnRefundButton();
	}

	public boolean whenUserClicksOnOrderFeeCheckBox(boolean checkEventFee, boolean checkCardFee) {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		PerOrderFeeComponent perOrderFee = selectedOrderPage.getOrderDetails().getPerOrderFee();
		perOrderFee.clickOnCheckBoxes(checkEventFee, checkCardFee);
		boolean ok = false;
		if (checkEventFee && checkCardFee && perOrderFee.isEntirePerOrderFeeChecked()) {
			ok = true;
		} else if (checkEventFee && perOrderFee.isEventFeeChecked()) {
			ok = true;
		} else if (checkCardFee && perOrderFee.isCreditCardFeeChecked()) {
			ok = true;
		} 
		if (ok) {
			addAmountToTotalRefundAmount(perOrderFee.getMoneyAmount(checkEventFee, checkCardFee));
			return true;
		}
		return false;
		
		
	}
	
	public void whenUserSelectsAllTicketsForRefund() {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		BigDecimal ticketsTotal = selectedOrderPage.selectAllTicketRowsForRefundGetFeeSum();
		addAmountToTotalRefundAmount(ticketsTotal);
	}

	public boolean whenUserSelectsRefundedStatusTicketForRefundAndCheckBoxStatus() {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		TicketRow row = selectedOrderPage.findTicketRow(ticket -> ticket.isTicketRefunded());
		row.clickOnCheckoutBoxInTicket();
		return row.isChecked();
	}

	public void whenUserSelectsPurchasedStatusTicketForRefund() {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		TicketRow row = selectedOrderPage.findTicketRow(r -> r.isTicketPurchased());
		row.clickOnCheckoutBoxInTicket();
		BigDecimal totalAmount = row.getTicketTotalAmount();
		BigDecimal perTicketFee = row.getPerTicketFeeAmount();
		addAmountToTotalRefundAmount(totalAmount);
		addAmountToTotalRefundAmount(perTicketFee);
	}
	
	public void whenUserRemembersRefundTotalOfOrder() {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		BigDecimal refundTotal = selectedOrderPage.getOrderRefundTotalAmount();
		addAmountToTempTotalAmount(refundTotal);
	}

	public void whenUserClicksOnRefundButton() {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		selectedOrderPage.clickOnRefundButton();
	}

	public boolean thenRefundButtonShouldBeVisible() {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		return selectedOrderPage.isRefundButtonVisible();
	}
	
	private void addAmountToTempTotalAmount(BigDecimal amount) {
		addAmountToTotalAmount(amount, TEMP_TOTAL_REFUND_AMOUNT_KEY);
	}

	private void addAmountToTotalRefundAmount(BigDecimal amount) {
		addAmountToTotalAmount(amount, TOTAL_REFUND_AMOUNT_KEY);
	}
	
	private void addAmountToTotalAmount(BigDecimal amount, String key) {
		BigDecimal totalAmount =  (BigDecimal) getData(key);
		if (totalAmount == null) {
			totalAmount = new BigDecimal(0);
		}
		totalAmount = totalAmount.add(amount);
		setData(key, totalAmount);
	}

	public boolean thenTotalOrderRefundShouldBeCorrect() {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		BigDecimal totalOrderRefund = selectedOrderPage.getOrderRefundTotalAmount();
		BigDecimal tempTotalRefund = (BigDecimal) getData(TEMP_TOTAL_REFUND_AMOUNT_KEY);
		BigDecimal sumOfRefunds = (BigDecimal) getData(TOTAL_REFUND_AMOUNT_KEY);
		if (tempTotalRefund != null) {
			sumOfRefunds = sumOfRefunds.add(tempTotalRefund);
		}
		return totalOrderRefund.compareTo(sumOfRefunds) == 0;
	}

	public boolean thenStatusOnAllTicketShouldBeRefunded() {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		driver.navigate().refresh();
		whenUserExpandOrderDetailsAndCheckIfExpanded();
		List<TicketRow> allTickets = selectedOrderPage.getOrderDetails().findAllTicketRows();
		return allTickets.stream().allMatch(ticket -> ticket.isTicketRefunded());
	}

	public boolean thenRefundDialogShouldBeVisible() {
		IssueRefundDialog refundDialog = new IssueRefundDialog(driver);
		setData(ISSUE_REFUND_DIALOG_KEY, refundDialog);
		return refundDialog.isVisible();
	}

	public boolean thenRefundButtonAmountShouldBeCorrect() {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		BigDecimal totalAmount = (BigDecimal) getData(TOTAL_REFUND_AMOUNT_KEY);
		BigDecimal refundButtonAmount = selectedOrderPage.getRefundButtonMoneyAmount();
		return totalAmount.compareTo(refundButtonAmount) == 0;
	}
	public boolean thenRefundTotalOnRefundDialogShouldBeCorrect() {
		IssueRefundDialog refundDialog = (IssueRefundDialog) getData(ISSUE_REFUND_DIALOG_KEY);
		BigDecimal totalAmount = (BigDecimal) getData(TOTAL_REFUND_AMOUNT_KEY);
		BigDecimal refundDialogTotal = refundDialog.getRefundTotalAmount();
		return totalAmount.compareTo(refundDialogTotal) == 0;

	}

	public void whenUserSelectRefundReasonAndClicksOnConfirmButton(RefundReason refundReason) {
		IssueRefundDialog refundDialog = (IssueRefundDialog) getData(ISSUE_REFUND_DIALOG_KEY);
		refundDialog.selectRefundReason(refundReason);
		refundDialog.clickOnContinue();
	}
	
	public void whenUserSelectRefundReasonAndClickOnOverride(RefundReason refundReason) {
		IssueRefundDialog refundDialog = (IssueRefundDialog) getData(ISSUE_REFUND_DIALOG_KEY);
		refundDialog.selectRefundReason(refundReason);
		refundDialog.clickOnRefundOveride();
	}
	
	public void refundOverrideSteps(SoftAssert sa, RefundReason reason) {
		whenUserClicksOnRefundButton();
		Assert.assertTrue(thenRefundDialogShouldBeVisible(), "Refund dialog not visible");
		sa.assertTrue(thenRefundTotalOnRefundDialogShouldBeCorrect(), "Refund total does not equal sum: " + getData(TOTAL_REFUND_AMOUNT_KEY));
		whenUserSelectRefundReasonAndClickOnOverride(reason);
		RefundOverrideDialog refundOverrideDialog = new RefundOverrideDialog(driver);
		Assert.assertTrue(refundOverrideDialog.isVisible(), "Refund Overrider dialog not visible");
		refundOverrideDialog.clickOnConfirmButton();
		RefundSuccessfulDialog refundSuccessfulDialog = new RefundSuccessfulDialog(driver);
		refundSuccessfulDialog.clickOnGotIt();
	}

	public void whenUserClicksOnGotItButtonOnRefundSuccessDialog() {
		IssueRefundDialog refundDialog = (IssueRefundDialog) getData(ISSUE_REFUND_DIALOG_KEY);
		refundDialog.isVisible();
		refundDialog.clickOnGotItButton();
	}
	
	public boolean thenUserIsOnSelectedManageOrderPage(SelectedOrderPage selectedOrderPage) {
		boolean retVal = selectedOrderPage.isAtPage();
		if (retVal) {
			setData(SELECTED_ORDER_PAGE_KEY, selectedOrderPage);
			return retVal;
		} 
		return retVal;
	}
	
	public void setSelectedOrderPage(String orderId) {
		SelectedOrderPage selectedOrderPage = new SelectedOrderPage(driver, orderId);
		boolean isAtPage = selectedOrderPage.isAtPage();
		setData(SELECTED_ORDER_PAGE_KEY, selectedOrderPage);
	}
	
	public boolean thenThereShouldBeItemsInOrderHistory(int number) {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		Integer rows = selectedOrderPage.getNumberOfHistoryItemRows();
		return rows.equals(number);
	}

	public boolean thenAllItemsShouldBeClosed() {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		Integer totalNumberOfHistoryRows = selectedOrderPage.getNumberOfHistoryItemRows();
		Integer totalNumberOfColapsedRows = selectedOrderPage.getNumberOfAllCollapsedRows();
		return totalNumberOfColapsedRows.equals(totalNumberOfHistoryRows);
	}

	public boolean thenThereShouldBePurchasedHistoryItem(User user, Purchase purchase) {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		String userName = user.getFirstName() + " " + user.getLastName();
		ActivityItem activityItem = selectedOrderPage
				.getHistoryActivityItem(aitem -> aitem.isPruchased() && aitem.getUserName().contains(userName)
						&& aitem.getEventName().contains(purchase.getEvent().getEventName()));
		return activityItem != null ? true : false;

	}

	public boolean thenThereShouldBePurchasedHistoryItemWithNumberOfPurchases(User user, Purchase purchase,
			int numberOfPurchases) {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		String userName = user.getFirstName() + " " + user.getLastName();
		ActivityItem activityItem = selectedOrderPage.getHistoryActivityItem(aitem -> aitem.isPruchased()
				&& aitem.getUserName().contains(userName) && aitem.getNumberOfPurchases().equals(numberOfPurchases)
				&& aitem.getEventName().contains(purchase.getEvent().getEventName()));
		return activityItem != null ? true : false;
	}

	public void whenUserExpandsActivityItemAndChecksValidityOfData(Purchase purchase, Integer quantity,
			TicketType ticketType) {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		Event event = purchase.getEvent();
		ActivityItem activityItem = selectedOrderPage.getHistoryActivityItem(
				aitem -> aitem.isPruchased() && aitem.getEventName().contains(event.getEventName()));
		SoftAssert softAssert  = new SoftAssert();
		if (activityItem != null) {
			activityItem.clickOnShowDetailsLink();
			LocalDateTime eventStartDateTime = ProjectUtils.getLocalDateTime(ProjectUtils.DATE_FORMAT,
					event.getStartDate(), ProjectUtils.TIME_FORMAT, event.getStartTime());

			BigDecimal totalTicketMoney = new BigDecimal(quantity.intValue() * Integer.parseInt(ticketType.getPrice()));
			BigDecimal totalWithFees = purchase.getEvent().getOrganization().getOtherFees().getTotalWithFees(totalTicketMoney);
			totalWithFees = ProjectUtils.roundUp(totalWithFees, 3);
			
			ExpandedContent expandedContent = activityItem.getExpandedContent();
			Venue expandedContentVenue = expandedContent.getVenue();
			Venue dataVenue = event.getVenue();
			LocalDateTime itemDate = ProjectUtils.parseDateTime(ProjectUtils.MANAGE_ORDER_HISTORY_ITEM_DATE_FORMAT,
					expandedContent.getEventDateAndTime());
			softAssert.assertTrue(eventStartDateTime.equals(itemDate), 
					"Entered time at event creation and event in activity item not the same");
			softAssert.assertTrue(dataVenue.getAddress().equals(expandedContentVenue.getAddress()),					
					"Venue information from data fixture and expanded content is not the same");
			softAssert.assertTrue(quantity.equals(expandedContent.getQuantity()),
					"Purchase quantity from data fixture and expanded content is not the same");
			softAssert.assertTrue(totalWithFees.equals(expandedContent.getTotalMoneyAmount()),
					"Total total with fees is not equal from data fixture and expanded content");
		} else {
			softAssert.fail();
		}
		softAssert.assertAll();
		
	}
	
	public boolean thenOrderFeesAreChecked(boolean checkEventFee, boolean checkCreditCardFee) {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		boolean retVal = true;
		if (checkEventFee) {
			retVal = retVal && selectedOrderPage.getOrderDetails().getPerOrderFee().isEventFeeChecked();
		}
		if (checkCreditCardFee) {
			retVal = retVal && selectedOrderPage.getOrderDetails().getPerOrderFee().isCreditCardFeeChecked();
		}
		return retVal;
	}
	
	public boolean thenOrderFeeCheckboxShouldBeChecked() {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		return selectedOrderPage.getOrderDetails().getPerOrderFee().isEntirePerOrderFeeChecked();
	}

	public boolean thenThereShouldBeRefundedHistoryItemWithRefundee(User refunder, User refundee) {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		String refunderName = refunder.getFullNameFL();
		String refundeeName = refundee.getFullNameFL();
		ActivityItem activityItem = selectedOrderPage.getHistoryActivityItem(aitem -> aitem.isRefunded()
				&& aitem.getUserName().contains(refunderName) && aitem.getRefundeeName().contains(refundeeName));
		return activityItem != null ? true : false;
	}

	public boolean whenUserExpandsRefundedHistoryItemAndChecksData(Purchase purchase, Integer quantity,
			TicketType ticketType, RefundReason refundReason) {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		ActivityItem activityItem = selectedOrderPage.getHistoryActivityItem(aitem -> aitem.isRefunded());
		if (activityItem != null) {
			activityItem.clickOnShowDetailsLink();
			RefundedExpandedContent refundedContent = activityItem.getRefundedExpandedContent();
			RefundReason retreivedRefundReason =  refundedContent.getRefundReason();
			BigDecimal ticketPrice = new BigDecimal(ticketType.getPrice());
			BigDecimal totalMoneyAmount = ticketPrice.multiply(new BigDecimal(quantity));
			boolean retVal = true;
			retVal = retVal && refundReason.equals(retreivedRefundReason);
			retVal = retVal && ticketPrice.compareTo(refundedContent.getPerTicketFee()) == 0;
			retVal = retVal && totalMoneyAmount.compareTo(refundedContent.getTotalRefundMoneyAmount()) == 0;
			return retVal;
		} else {
			return false;
		}
	}
	
	public void whenUserAddsANote(String note) {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		selectedOrderPage.enterNote(note);
		selectedOrderPage.clickOnAddNoteButton();
	}
	
	public void whenUserComparesDataFromTicketSuccesPageAndOrderManagePage(OrderDetailsData data) {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		OrderInfo orderInfo = selectedOrderPage.getOrderInfo();
		SoftAssert softAssert = new SoftAssert();
		softAssert.assertTrue(orderInfo.getFeesTotal().compareTo(data.getFeesSubtotal()) == 0, 
				"Fees total are not the same on success page and order manage page");
		softAssert.assertTrue(orderInfo.getTicketTotal().compareTo(data.getTicketTotal()) == 0, 
				"Ticket total are not the same on success page and order manage page");
		softAssert.assertTrue(orderInfo.getVenueInfo().getName().equals(data.getVenue().getName()), 
				"Venue names are not the same on succes page and order manage page");
		softAssert.assertAll();
	}

	public boolean thenNotificationNoteAddedShouldBeVisible() {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		return selectedOrderPage.isNotificationDisplayedWithMessage(MsgConstants.ORDER_MANANGE_ACTIVITY_ITEM_NOTE_ADDED,
				5);
	}

	public boolean thenUserShouldSeeNoteActivityItem(String note, User user) {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		selectedOrderPage.refreshPage();
		String userName = user.getFirstName() + " " + user.getLastName();
		ActivityItem activityItem = selectedOrderPage
				.getHistoryActivityItem(aitem -> aitem.isNoteItem() && aitem.isUserNameEqualTo(userName));
		if (activityItem == null) {
			return false;
		} else {
			activityItem.clickOnShowDetailsLink();
			NoteExpandedContent noteContent = activityItem.getNoteExpandedContent();
			String noteText = noteContent.getNoteText();
			return note.equalsIgnoreCase(noteText);
		}
	}	
	
	public boolean thenUserIsOnSelecteOrderPage() {
		return thenUserIsOnSelecteOrderPage(false);
	}

	public boolean thenUserIsOnSelecteOrderPage(boolean refresh) {
		SelectedOrderPage selectedOrderPage = (SelectedOrderPage) getData(SELECTED_ORDER_PAGE_KEY);
		if (selectedOrderPage == null) {
			return false;
		} else {
			if (refresh) {
				selectedOrderPage.refreshPage();
			}
			return selectedOrderPage.isAtPage();
		}
	}
	
	public void thenClearUpTotalAmountFromDataMap() {
		setData(TOTAL_REFUND_AMOUNT_KEY, null);
	}
	

	@Override
	protected void setData(String key, Object value) {
		dataMap.put(key, value);
		
	}

	@Override
	protected Object getData(String key) {
		return dataMap.get(key);
	}

}
