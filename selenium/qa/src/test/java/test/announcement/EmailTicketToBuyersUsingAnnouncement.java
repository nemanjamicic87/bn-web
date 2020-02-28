package test.announcement;

import java.util.HashMap;
import java.util.Map;

import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

import config.MailinatorEnum;
import data.holders.ticket.order.OrderDetailsData;
import model.AnnouncementMail;
import model.Event;
import model.Purchase;
import model.User;
import pages.components.dialogs.IssueRefundDialog.RefundReason;
import pages.mailinator.MailinatorFactory;
import pages.mailinator.inbox.AnnouncementMailinatorPage;
import test.BaseSteps;
import test.facade.FacadeProvider;
import utils.DataConstants;

public class EmailTicketToBuyersUsingAnnouncement extends BaseSteps {

	private static final String EVENT_NAME = "TestAnnoucementNameEvent";
	private static final Integer EVENT_DATE_OFFEST = 50;
	private static final Integer EVENT_DATE_SPAN = 1;

	@Test(dataProvider = "announcement_data", priority = 36, alwaysRun = true, dependsOnMethods = "prepareDataFixture")
	public void emailToTicketHolders(AnnouncementMail mail, User adminUser, User fullRefundCustomer,
			User partialRefundCustomer, Event event) {
		maximizeWindow();
		FacadeProvider fp = new FacadeProvider(driver);
		SoftAssert softAssert = new SoftAssert();
		fp.getLoginFacade().givenAdminUserIsLogedIn(adminUser);
		fp.getOrganizationFacade().givenOrganizationExist(event.getOrganization());
		fp.getAdminEventStepsFacade().whenUserGoesToEventDashboard(event);
		fp.getEventDashboardFacade().whenUserSelectsAnnouncementFromToolDropDown();
		Assert.assertTrue(fp.getAnnauncementFacade().isOnAnnouncementPage(), "Not on announcement page");
		softAssert.assertTrue(fp.getAnnauncementFacade().isAnnouncementTextValid(),
				"Announcement page text not correct");
		fp.getAnnauncementFacade().sendPreviewMail(mail);
		fp.getAnnauncementFacade().sendEmailToBuyers(mail);

		Map<String, Object> data = new HashMap<>();
		data.put(AnnouncementMailinatorPage.MAIL_KEY, mail);
		data.put(AnnouncementMailinatorPage.FIXTURE_EVENT_KEY, event);
		data.put(AnnouncementMailinatorPage.SOFT_ASSERT_KEY, softAssert);

		checkMailOfCustomer(fullRefundCustomer, data, true);
		checkMailOfCustomer(partialRefundCustomer, data, false);
		softAssert.assertAll();
	}

	private void checkMailOfCustomer(User customer, Map<String, Object> data, boolean isFullRefund) {
		AnnouncementMailinatorPage mailPage = (AnnouncementMailinatorPage) MailinatorFactory
				.getInboxPage(MailinatorEnum.ANNOUNCEMENT_TO_BUYERS, driver, customer.getEmailAddress());
		data.put(AnnouncementMailinatorPage.FULL_REFUND_KEY, isFullRefund);
		mailPage.openMailAndCheckValidity(data);
	}

	@DataProvider(name = "announcement_data")
	public static Object[][] announcementDataProvider() {
		AnnouncementMail mail = AnnouncementMail.generateAnnouncementFromJson(DataConstants.ANNOUNCEMENT_MAIL_KEY);
		User adminUser = User.generateUserFromJson(DataConstants.ORGANIZATION_ADMIN_USER_KEY);
		User fullRefundConstomer = User.generateUserFromJson(DataConstants.USER_STANDARD_KEY);
		User partialRefundCustomer = User.generateUserFromJson(DataConstants.DISTINCT_USER_TWO_KEY);
		Event event = Event.generateEventFromJson(DataConstants.EVENT_DATA_STANARD_KEY, EVENT_NAME, false,
				EVENT_DATE_OFFEST, EVENT_DATE_SPAN);
		return new Object[][] { { mail, adminUser, fullRefundConstomer, partialRefundCustomer, event } };
	}

	@Test(dataProvider = "announcement_prepare_data_fixture", priority = 36)
	public void prepareDataFixture(User superuser, User fullRefundCustomer, User partialRefundCustomer,
			Purchase purchase) throws Exception {
		maximizeWindow();
		FacadeProvider fp = new FacadeProvider(driver);
		fp.getEventFacade().givenUserIsOnHomePage();
		if (!fp.getEventFacade().isEventPresent(purchase.getEvent())) {
			fp.getLoginFacade().givenUserIsLogedIn(superuser);
			fp.getOrganizationFacade().givenOrganizationExist(purchase.getEvent().getOrganization());
			fp.getAdminEventStepsFacade().givenEventWithNameAndPredicateExists(purchase.getEvent(),
					comp -> !comp.isEventCanceled(), false);
			fp.getLoginFacade().logOut();

			String orderIdFullRefund = purchaseSteps(fp, purchase, fullRefundCustomer);
			String orderIdPartialRefund = purchaseSteps(fp, purchase, partialRefundCustomer);

			fp.getLoginFacade().givenAdminUserIsLogedIn(superuser);
			fp.getOrganizationFacade().givenOrganizationExist(purchase.getEvent().getOrganization());
			fp.getAdminEventStepsFacade().givenUserIsOnAdminEventsPage();
			navigateAndRefundSteps(fp, orderIdFullRefund, purchase.getEvent(), true);
			fp.getAdminEventStepsFacade().givenUserIsOnAdminEventsPage();
			navigateAndRefundSteps(fp, orderIdPartialRefund, purchase.getEvent(), false);
		}
	}

	private String purchaseSteps(FacadeProvider fp, Purchase purchase, User customer) throws Exception {
		fp.getEventFacade().givenUserIsOnHomePage();
		fp.getEventFacade().whenUserDoesThePurchses(purchase, customer);
		String orderId = ((OrderDetailsData) fp.getEventFacade().getOrderDetailsData()).getOrderNumber();
		fp.getLoginFacade().logOut();
		return orderId;
	}

	private void navigateAndRefundSteps(FacadeProvider fp, String orderId, Event event, boolean isFullRefund) {
		fp.getAdminEventStepsFacade().whenUserGoesToEventDashboard(event);
		fp.getEventDashboardFacade().givenUserIsOnManageOrdersPage();
		fp.getEventDashboardFacade().whenUserClickOnOrderWithOrderNumber(orderId, fp.getOrderManageFacade());
		fp.getOrderManageFacade().refundSteps(RefundReason.OTHER, isFullRefund);
	}

	@DataProvider(name = "announcement_prepare_data_fixture")
	public static Object[][] announcementPrepareDataFixture() {
		Event event = Event.generateEventFromJson(DataConstants.EVENT_DATA_STANARD_KEY, EVENT_NAME, false,
				EVENT_DATE_OFFEST, EVENT_DATE_SPAN);
		Purchase purchase = Purchase.generatePurchaseFromJson(DataConstants.REGULAR_USER_PURCHASE_KEY);
		purchase.setEvent(event);
		User fullRefundConstomer = User.generateUserFromJson(DataConstants.USER_STANDARD_KEY);
		User partialRefundCustomer = User.generateUserFromJson(DataConstants.DISTINCT_USER_TWO_KEY);
		User superuser = User.generateSuperUser();
		return new Object[][] { { superuser, fullRefundConstomer, partialRefundCustomer, purchase } };
	}

}
