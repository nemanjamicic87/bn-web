package test;

import java.util.List;

import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import model.Event;
import model.Purchase;
import model.TicketType;
import model.User;
import pages.EventsPage;
import pages.components.admin.events.EventSummaryComponent;
import pages.components.admin.orders.manage.ManageOrderRow;
import pages.components.dialogs.IssueRefundDialog.RefundReason;
import test.facade.AdminBoxOfficeFacade;
import test.facade.AdminEventDashboardFacade;
import test.facade.AdminEventStepsFacade;
import test.facade.EventStepsFacade;
import test.facade.LoginStepsFacade;
import test.facade.OrganizationStepsFacade;
import test.facade.orders.order.OrderManageFacade;
import utils.DataConstants;

public class OrderManagmentSearchForOrdersStepsIT extends BaseSteps {

	private static final String EVENT_NAME = "TestSearchOrdersEventName";
	private static final Integer START_DAY_OFFSET = 1;
	private static final Integer DAYS_RANGE = 4;
	private static final Integer PURCHASE_QUANTITY = 1;
	private static final Integer MULTIPLE_PURCHASE_QTY_FOR_ONE_USER = 3;
	private static final Integer NUMBER_OF_ACTIVITY_ITEMS_AFTER_REFUND = 2;
	private static String NOTE_TEXT = "Custom Note Text";
	private String ticketTypeName = "VIP";
	private Purchase purchase;
	private final RefundReason refundReason = RefundReason.UNABLE_TO_ATTEND;

	/**
	 * Test for guest search on guest page task task #1769
	 */
	@Test(dataProvider = "guest_page_search_data", priority = 13, 
			 dependsOnMethods = {"userPurchasedTickets"}, alwaysRun = true, retryAnalyzer = utils.RetryAnalizer.class)
	public void guestPageSearchTest(User superuser, User one, User two) throws Exception {
		LoginStepsFacade loginFacade = new LoginStepsFacade(driver);
		AdminBoxOfficeFacade boxOfficeFacade = new AdminBoxOfficeFacade(driver);
		AdminEventStepsFacade adminEventFacade = new AdminEventStepsFacade(driver);
		OrganizationStepsFacade organizationFacade = new OrganizationStepsFacade(driver);
		
		maximizeWindow();
		loginFacade.givenAdminUserIsLogedIn(superuser);
		adminEventFacade.givenUserIsOnAdminEventsPage();
		organizationFacade.givenOrganizationExist(purchase.getEvent().getOrganization());

		boxOfficeFacade.givenUserIsOnBoxOfficePage();
		boxOfficeFacade.givenEventIsSelected(purchase.getEvent().getEventName());
		boxOfficeFacade.givenUserIsOnGuestPage();

		boolean isLastNameTest = boxOfficeFacade.whenUserSearchesByLastName(one);
		boolean isTicketInSearchResults = boxOfficeFacade.whenUserSearchesByFirstNameAndTicketNumber(one);
		boolean isEmailSearchTest = boxOfficeFacade.whenUserSearchesByEmail(two);

		Assert.assertTrue(isLastNameTest && isTicketInSearchResults && isEmailSearchTest);
		loginFacade.logOut();

	}

	@DataProvider(name = "guest_page_search_data")
	public static Object[][] guestSearchData() {
		User superUser = User.generateUserFromJson(DataConstants.SUPERUSER_DATA_KEY);
		User userOne = User.generateUserFromJson(DataConstants.DISTINCT_USER_ONE_KEY);
		User userTwo = User.generateUserFromJson(DataConstants.USER_STANDARD_KEY);
		
		return new Object[][] { { superUser, userOne, userTwo } };

	}
	
	@Test(dataProvider = "purchase_data", priority = 13)
	public void userPurchasedTickets(User user, Purchase purchase) throws Exception {
		maximizeWindow();
		EventStepsFacade eventsFacade = new EventStepsFacade(driver);

		// given
		eventsFacade.givenUserIsOnHomePage();
		EventsPage eventsPage = eventsFacade.givenThatEventExist(purchase.getEvent(), user);
		if(this.purchase == null) {
			this.purchase = purchase;
		}
		// when
		eventsFacade.whenUserExecutesEventPagesStepsWithoutMapView(purchase.getEvent());

		Assert.assertTrue(eventsFacade.thenUserIsAtTicketsPage());
		List<TicketType> types = purchase.getEvent().getTicketTypes();
		TicketType ticketType = purchase.getEvent().getTicketTypes().get(types.size() -1);
		this.ticketTypeName = ticketType.getTicketTypeName();
		eventsFacade.whenUserSelectsNumberOfTicketsAndClicksOnContinue(purchase, ticketType);
		eventsFacade.whenUserLogsInOnTicketsPage(user);
		eventsFacade.thenUserIsAtConfirmationPage();
		eventsFacade.whenUserEntersCreditCardDetailsAndClicksOnPurchase(purchase.getCreditCard());

		// then
		eventsFacade.thenUserIsAtTicketPurchaseSuccessPage();
		eventsPage.logOut();

	}

	@DataProvider(name = "purchase_data")
	public static Object[][] data() {
		Purchase purchase = preparePurchase();
		
		Purchase purchaseOne = preparePurchase();

		User one = User.generateUserFromJson(DataConstants.DISTINCT_USER_ONE_KEY);
		User two = User.generateUserFromJson(DataConstants.DISTINCT_USER_TWO_KEY);
		purchaseOne.setNumberOfTickets(MULTIPLE_PURCHASE_QTY_FOR_ONE_USER);
		
		User three = User.generateUserFromJson(DataConstants.USER_STANDARD_KEY);
		return new Object[][] { { one, purchaseOne }, { two, purchase }, { three, purchase } };
	}
	
	/**
	 * 
	 * test for task  ,Automation: Big Neon : Test 23: Box Office: Search for the Sold tickets #1788
	 */
	@Test(dataProvider = "manage_orders_page_data", priority = 14, retryAnalyzer = utils.RetryAnalizer.class)
	public void manageOrdersPageSearchTest(User orgAdmin, User customer, User customerOne, Event event, Purchase purchase)
			throws Exception {

		LoginStepsFacade loginFacade = new LoginStepsFacade(driver);
		AdminEventStepsFacade adminEventFacade = new AdminEventStepsFacade(driver);
		OrganizationStepsFacade organizationFacade = new OrganizationStepsFacade(driver);
		AdminEventDashboardFacade dashboardFacade = new AdminEventDashboardFacade(driver);

		maximizeWindow();

		loginPickOrgNavToManageOrders(loginFacade, adminEventFacade, organizationFacade, dashboardFacade, event, orgAdmin);

		ManageOrderRow orderRow = dashboardFacade.getManageOrdersFirstOrder();

		String orderNumber = orderRow.getOrderNumber();

		boolean retVal = false;
		retVal = dashboardFacade.whenUserDoesSearchCheckByEmail(customer);
		retVal &= dashboardFacade.whenUserDoesSearchCheckByFirstname(customerOne);
		retVal &= dashboardFacade.whenUserDoesSearchCheckByLastName(customerOne);
		retVal &= dashboardFacade.whenUserDoesSearchCheckByOrderNumber(orderNumber);
		retVal &= dashboardFacade.whenUserChecksOrderQuantityForSpecificUser(customer, PURCHASE_QUANTITY);

		Assert.assertTrue(retVal);
		
		loginFacade.logOut();

	}
	
	/**
	 *  Automation: Big Neon : Test 24: Box Office: Refund Tickets #1789 
	 */
	@Test(dataProvider = "manage_orders_page_data", priority = 15, retryAnalyzer = utils.RetryAnalizer.class)
	public void manageOrdersSearchAndRefundTickets(User orgAdmin, User customer, User customerOne, Event event, Purchase purchase) throws Exception {
		LoginStepsFacade loginFacade = new LoginStepsFacade(driver);
		AdminEventStepsFacade adminEventFacade = new AdminEventStepsFacade(driver);
		OrganizationStepsFacade organizationFacade = new OrganizationStepsFacade(driver);
		AdminEventDashboardFacade dashboardFacade = new AdminEventDashboardFacade(driver);
		OrderManageFacade orderManageFacade = new OrderManageFacade(driver);

		maximizeWindow();

		loginPickOrgNavToManageOrders(loginFacade, adminEventFacade, organizationFacade, dashboardFacade, event, orgAdmin);

		ManageOrderRow orderRow = dashboardFacade.getManageOrdersFirstOrder();

		String orderNumber = orderRow.getOrderNumber();

		boolean retVal = false;
		retVal = dashboardFacade.whenUserDoesSearchCheckByEmail(customer);
		retVal &= dashboardFacade.whenUserDoesSearchCheckByFirstname(customerOne);
		retVal &= dashboardFacade.whenUserDoesSearchCheckByLastName(customerOne);
		retVal &= dashboardFacade.whenUserDoesSearchCheckByOrderNumber(orderNumber);
		retVal &= dashboardFacade.whenUserChecksOrderQuantityForSpecificUser(customer, PURCHASE_QUANTITY);
		
		Assert.assertTrue(retVal);
		
		dashboardFacade.whenUserClicksOnOrderLinkOfGivenUser(customerOne, orderManageFacade);
		boolean isExpanded = orderManageFacade.whenUserExpandOrderDetailsAndCheckIfExpanded();
		Assert.assertTrue(isExpanded);
		orderManageFacade.whenUserSelectsPurchasedStatusTicketForRefund();
		orderManageFacade.whenUserClicksOnRefundButton();
		orderManageFacade.thenRefundDialogShouldBeVisible();
		orderManageFacade.whenUserSelectRefundReasonAndClicksOnConfirmButton(refundReason);
		orderManageFacade.thenRefundDialogShouldBeVisible();
		orderManageFacade.whenUserClicksOnGotItButtonOnRefundSuccessDialog();
		
		adminEventFacade.givenUserIsOnAdminEventsPage();
		
		loginFacade.logOut();

	}
	
	/**
	 * Automation Big Neon: Test 28: Order Management: Order History/Activity Feed #1833
	 */
	@Test(dataProvider = "manage_orders_page_data", priority = 16, retryAnalyzer = utils.RetryAnalizer.class)
	public void manageOrdersOrderHistoryActivity(User orgAdmin, User customer, User customerOne, Event event, Purchase purchase) throws Exception {
		
		LoginStepsFacade loginFacade = new LoginStepsFacade(driver);
		AdminEventStepsFacade adminEventFacade = new AdminEventStepsFacade(driver);
		OrganizationStepsFacade organizationFacade = new OrganizationStepsFacade(driver);
		AdminEventDashboardFacade dashboardFacade = new AdminEventDashboardFacade(driver);
		OrderManageFacade orderManageFacade = new OrderManageFacade(driver);

	    maximizeWindow();

	    loginPickOrgNavToManageOrders(loginFacade, adminEventFacade, organizationFacade, dashboardFacade, event, orgAdmin);
	    
		dashboardFacade.whenUserClicksOnOrderLinkOfGivenUser(customerOne, orderManageFacade);
		//find a way to put this args in data
		boolean isThereCorrectNumberInOrderHistory = orderManageFacade.thenThereShouldBeItemsInOrderHistory(NUMBER_OF_ACTIVITY_ITEMS_AFTER_REFUND);
		Assert.assertTrue(isThereCorrectNumberInOrderHistory);
		boolean isTherePurchasedHistoryItem =  orderManageFacade.thenThereShouldBePurchasedHistoryItem(customerOne, purchase);
		Assert.assertTrue(isTherePurchasedHistoryItem);
		boolean isEveryRowCollapsed = orderManageFacade.thenAllItemsShouldBeClosed();
		Assert.assertTrue(isEveryRowCollapsed);

	
		loginFacade.logOut();
	}
		
	/**
	 *  Automation BigNeon : Order Management: Test 29: Activity Items/Purchased #1834
	 *  Automation: Big Neon: Order Management: Test 30: ActivityItems/Refunded #1848
	 */
	@Test(dataProvider = "manage_orders_page_data", priority = 17, retryAnalyzer = utils.RetryAnalizer.class)
	public void manageOrdersActivityItemsPurchasedAndRefundedCheck(User orgAdmin, User customer, User customerOne, Event event, Purchase purchase) throws Exception {
		
		LoginStepsFacade loginFacade = new LoginStepsFacade(driver);
		AdminEventStepsFacade adminEventFacade = new AdminEventStepsFacade(driver);
		OrganizationStepsFacade organizationFacade = new OrganizationStepsFacade(driver);
		AdminEventDashboardFacade dashboardFacade = new AdminEventDashboardFacade(driver);
		OrderManageFacade orderManageFacade = new OrderManageFacade(driver);

	    maximizeWindow();

	    boolean isInitialStepsComplete = loginPickOrgNavToManageOrders(loginFacade, adminEventFacade, 
	    		organizationFacade, dashboardFacade, event, orgAdmin);
	    Assert.assertTrue(isInitialStepsComplete);
		dashboardFacade.whenUserClicksOnOrderLinkOfGivenUser(customerOne, orderManageFacade);
		
		boolean isTherePurchasedHistoryItem =  orderManageFacade.thenThereShouldBePurchasedHistoryItemWithNumberOfPurchases(customerOne, purchase, 3);
		Assert.assertTrue(isTherePurchasedHistoryItem);
		TicketType ticketType = event.getTicketTypes().stream().filter(tt->tt.getTicketTypeName().equals(ticketTypeName)).findFirst().get();
		orderManageFacade.whenUserExpandsActivityItemAndChecksValidityOfData(purchase, MULTIPLE_PURCHASE_QTY_FOR_ONE_USER, ticketType);
		boolean isRefundDataValid = orderManageFacade.whenUserExpandsRefundedHistoryItemAndChecksData(purchase, 1, ticketType,refundReason);
		Assert.assertTrue(isRefundDataValid, "Refunded history item data invalid");
		loginFacade.logOut();
		
	}
	
	/*
	 * Automation: BigNeon: Order Management: Test 31: ActivityItems/Note #1849
	 */
	@Test(dataProvider = "manage_orders_page_data", priority = 18, retryAnalyzer = utils.RetryAnalizer.class)
	public void manageOrdersAddNoteAndCheckActivityItem(User orgAdmin, User customer, User customerOne, Event event, Purchase purchase) throws Exception {
		LoginStepsFacade loginFacade = new LoginStepsFacade(driver);
		AdminEventStepsFacade adminEventFacade = new AdminEventStepsFacade(driver);
		OrganizationStepsFacade organizationFacade = new OrganizationStepsFacade(driver);
		AdminEventDashboardFacade dashboardFacade = new AdminEventDashboardFacade(driver);
		OrderManageFacade orderManageFacade = new OrderManageFacade(driver);
		maximizeWindow();
		
		boolean isInitialStepsComplete = loginPickOrgNavToManageOrders(loginFacade, adminEventFacade, 
	    		organizationFacade, dashboardFacade, event, orgAdmin);
	    Assert.assertTrue(isInitialStepsComplete);
	    dashboardFacade.whenUserClicksOnOrderLinkOfGivenUser(customerOne, orderManageFacade);
	    orderManageFacade.whenUserAddsANote(purchase.getOrderNote());
	    boolean isNotificationVisible = orderManageFacade.thenNotificationNoteAddedShouldBeVisible();
	    
	    boolean isNoteActivityItemVisible = orderManageFacade.thenUserShouldSeeNoteActivityItem(purchase.getOrderNote(), orgAdmin);
	    Assert.assertTrue(isNoteActivityItemVisible, "Note activity item for creator: "+ orgAdmin.getEmailAddress() + " not present");
	    
	    adminEventFacade.givenUserIsOnAdminEventsPage();
	    
	    EventSummaryComponent eventComponent = adminEventFacade.findEventIsOpenedAndHasSoldItem(event);
		if (eventComponent != null) {
			eventComponent.cancelEvent();
		}
		loginFacade.logOut();
	    	    
	}
	/**
	 *  Automation: Big Neon : Test 27: Order Management: Order Page navigation #1809, used in most tests in this class
	 */
	private boolean loginPickOrgNavToManageOrders(LoginStepsFacade loginFacade,
			AdminEventStepsFacade adminEventFacade,
			OrganizationStepsFacade organizationStepsFacade, 
			AdminEventDashboardFacade dashboardFacade, Event event, User user) throws Exception {
		loginFacade.givenAdminUserIsLogedIn(user);
		organizationStepsFacade.givenOrganizationExist(event.getOrganization());
		adminEventFacade.givenUserIsOnAdminEventsPage();
		EventSummaryComponent eventComponent = adminEventFacade.findEventIsOpenedAndHasSoldItem(event);
		Assert.assertNotNull(eventComponent, "No Event with name: " + event.getEventName() + " found");
		eventComponent.clickOnEvent();
		dashboardFacade.givenUserIsOnManageOrdersPage();
		return true;
	}
		

	@DataProvider(name = "manage_orders_page_data")
	public static Object[][] dataProvider() {
		Purchase purchase = preparePurchase();
		purchase.setOrderNote(NOTE_TEXT);
		Event event = purchase.getEvent();
		User orgAdminUser = User.generateUserFromJson(DataConstants.ORGANIZATION_ADMIN_USER_KEY);
		User customer = User.generateUserFromJson(DataConstants.USER_STANDARD_KEY);
		User one = User.generateUserFromJson(DataConstants.DISTINCT_USER_ONE_KEY);
		
		return new Object[][] { { orgAdminUser, customer, one, event, purchase } };
	}
	

	private static Purchase preparePurchase() {
		Purchase purchase = Purchase.generatePurchaseFromJson(DataConstants.REGULAR_USER_PURCHASE_KEY);
		purchase.setNumberOfTickets(PURCHASE_QUANTITY);
		purchase.setEvent(Event.generateEventFromJson(DataConstants.EVENT_DATA_STANARD_KEY,
				EVENT_NAME, false, START_DAY_OFFSET, DAYS_RANGE));
		return purchase;
	}

}