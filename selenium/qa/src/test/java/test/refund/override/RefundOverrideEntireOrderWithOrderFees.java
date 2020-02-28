package test.refund.override;

import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

import model.Event;
import model.Purchase;
import model.User;
import pages.components.dialogs.IssueRefundDialog.RefundReason;
import test.TemplateRefundFeeSteps;
import utils.DataConstants;

public class RefundOverrideEntireOrderWithOrderFees extends TemplateRefundFeeSteps {

	private static final Integer PURCHASE_QUANTITY = 3;
	private static final String EVENT_NAME = "TestRefundOvrdFullOrdEventName";
	private static final Integer START_DAY_OFFSET = 2;
	private static final Integer DAYS_RANGE = 0;

	@Test(dataProvider = "refund_override_entire_order_with_fees_data", priority = 38, retryAnalyzer = utils.RetryAnalizer.class)
	public void refundOverrideEntireOrderWithOrderFees(Purchase purchase, User superuser) throws Exception {
		templateSteps(purchase, superuser);
	}

	@Override
	public void customSteps() {
		getOrderManageFacade().whenUserSelectsAllTicketsForRefund();
		boolean isCheckBoxesSelected = getOrderManageFacade().whenUserClicksOnOrderFeeCheckBox(true, true);
		Assert.assertTrue(isCheckBoxesSelected, "None of checkbox per order fees are selected");
		boolean isRefundButtonAmountCorrect = getOrderManageFacade().thenRefundButtonAmountShouldBeCorrect();
		Assert.assertTrue(isRefundButtonAmountCorrect, "Refund amount on refund button incorect");
		SoftAssert sa = new SoftAssert();
		getOrderManageFacade().refundOverrideSteps(sa, RefundReason.UNABLE_TO_ATTEND);
		boolean isAtSelectedOrderPage = getOrderManageFacade().thenUserIsOnSelecteOrderPage();
		Assert.assertTrue(isAtSelectedOrderPage, "After refund user is not on correct page");
		boolean isStatusOfTicketsRefunded = getOrderManageFacade().thenStatusOnAllTicketShouldBeRefunded();
		Assert.assertTrue(isStatusOfTicketsRefunded, "Not all tickets status is refunded");
		getOrderManageFacade().whenUserClicksOnOrderFeeCheckBox(true, true);
		boolean isRefundTotalCorrect = getOrderManageFacade().thenTotalOrderRefundShouldBeCorrect();
		Assert.assertTrue(isRefundTotalCorrect);
		sa.assertAll();
	}

	@DataProvider(name = "refund_override_entire_order_with_fees_data")
	public static Object[][] dataFixture() {
		Purchase purchase = preparePurchase();
		User superuser = User.generateSuperUser();
		return new Object[][] { { purchase, superuser } };
	};

	private static Purchase preparePurchase() {
		Purchase purchase = Purchase.generatePurchaseFromJson(DataConstants.REGULAR_USER_PURCHASE_KEY);
		purchase.setNumberOfTickets(PURCHASE_QUANTITY);
		purchase.setEvent(Event.generateEventFromJson(DataConstants.EVENT_DATA_STANARD_KEY, EVENT_NAME, true,
				START_DAY_OFFSET, DAYS_RANGE));
		return purchase;
	}

}
