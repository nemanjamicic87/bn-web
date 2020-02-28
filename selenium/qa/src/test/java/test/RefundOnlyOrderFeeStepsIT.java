package test;

import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import model.Event;
import model.Purchase;
import model.User;
import pages.components.dialogs.IssueRefundDialog.RefundReason;
import utils.DataConstants;

public class RefundOnlyOrderFeeStepsIT extends TemplateRefundFeeSteps {

	private static final Integer PURCHASE_QUANTITY = 3;
	private static final String EVENT_NAME = "TestRefundOrderFeeEventName";
	private static final Integer START_DAY_OFFSET = 2;
	private static final Integer DAYS_RANGE = 0;

	@Test(dataProvider = "refund_just_an_order_fee_from_order", priority = 28, retryAnalyzer = utils.RetryAnalizer.class)
	public void refundJustAnOrderFeeFromOrder(Purchase purchase, User user) throws Exception {
		templateSteps(purchase, user);
	}

	@Override
	public void customSteps() {
		getOrderManageFacade().whenUserClicksOnOrderFeeCheckBox(true, true);
		boolean isRefundButtonAmountCorrect = getOrderManageFacade().thenRefundButtonAmountShouldBeCorrect();
		Assert.assertTrue(isRefundButtonAmountCorrect, "Refund amount on refund button incorect");

		getOrderManageFacade().whenUserClicksOnRefundButton();
		boolean isRefundDialogVisible = getOrderManageFacade().thenRefundDialogShouldBeVisible();
		Assert.assertTrue(isRefundDialogVisible, "Refund dialog not visible");
		boolean isRefundDialogAmountCorrect = getOrderManageFacade().thenRefundTotalOnRefundDialogShouldBeCorrect();
		Assert.assertTrue(isRefundDialogAmountCorrect);
		getOrderManageFacade().whenUserSelectRefundReasonAndClicksOnConfirmButton(RefundReason.OTHER);
		getOrderManageFacade().whenUserClicksOnGotItButtonOnRefundSuccessDialog();

		boolean isAtSelectedOrderPage = getOrderManageFacade().thenUserIsOnSelecteOrderPage();
		Assert.assertTrue(isAtSelectedOrderPage, "After refund user is not on correct page");
		getOrderManageFacade().whenUserClicksOnOrderFeeCheckBox(true, true);
		boolean isRefundButtonVisible = getOrderManageFacade().thenRefundButtonShouldBeVisible();
//		Assert.assertFalse(isRefundButtonVisible,
//				"Refund button on per order fee after already refunded should not be visible");
		
	}
	
	@DataProvider(name = "refund_just_an_order_fee_from_order")
	public static Object[][] dataProvider() {
		Purchase purchase = preparePurchase();
		User superuser = User.generateUserFromJson(DataConstants.ORGANIZATION_ADMIN_USER_KEY);
		return new Object[][] {{purchase, superuser}};
	}
	
	private static Purchase preparePurchase() {
		Purchase purchase = Purchase.generatePurchaseFromJson(DataConstants.REGULAR_USER_PURCHASE_KEY);
		purchase.setNumberOfTickets(PURCHASE_QUANTITY);
		purchase.setEvent(Event.generateEventFromJson(DataConstants.EVENT_DATA_STANARD_KEY,
				EVENT_NAME, true, START_DAY_OFFSET, DAYS_RANGE));
		return purchase;
	}
}
