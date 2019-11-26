package test.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import data.holders.DataHolder;
import model.Event;
import model.Organization;
import model.Purchase;
import model.User;
import test.BaseSteps;
import test.facade.FacadeProvider;
import utils.DataConstants;
import utils.DateRange;
import utils.ProjectUtils;

public class ReportBoxOfficeStepsIT extends BaseSteps {
	
	
	private final static String PURCHASE_EST_ONE_KEY = "purchase_one";
	private final static String PURCHASE_JST_TWO_KEY = "purchase_two";
	private final static String PURCHASE_SAST_THREE_KEY = "purchase_three";
	private final static String STANDARD_CUSTOMER_KEY = "standard_customer_key";
	private final static String CUSTOMER_KEY = "customer_key";
	private Purchase firstBOPurchaseEST;
	private Purchase secondBOPurchaseJST;
	private Purchase notBoxOfficePurchaseSAST;
	
	@Test(priority = 32, retryAnalyzer = utils.RetryAnalizer.class, alwaysRun=true, dependsOnMethods = {"boxOfficeReportPrepareDataFixture"})
	public void boxOfficeReportCanOnlyContainBoxOfficeTransactions() throws Exception {
		
		maximizeWindow();
		Organization org = firstBOPurchaseEST.getEvent().getOrganization();
		User orgAdmin = org.getTeam().getOrgAdminUser();
		FacadeProvider fp = new FacadeProvider(driver);
		fp.getLoginFacade().givenUserIsLogedIn(orgAdmin);
		fp.getOrganizationFacade().givenOrganizationExist(org);
		fp.getReportsFacade().givenUserIsOnReportsPage();
		fp.getReportsFacade().whenUserSelectBoxOfficeTab();
		fp.getReportsBoxOfficeFacade().enterDates();
		boolean isEventPresent = fp.getReportsBoxOfficeFacade().whenUserSearchesForEventInBoxOfficeReport(notBoxOfficePurchaseSAST.getEvent());
		Assert.assertFalse(isEventPresent,"There should be not tickets sold for this event in box office report" + notBoxOfficePurchaseSAST.getEvent().getEventName());
	}
	
	@Test(priority = 33, retryAnalyzer = utils.RetryAnalizer.class)
	public void filterOnDateAndVerifyDataByCrossReferencingOnOrderManagePage() throws Exception {
		maximizeWindow();
		FacadeProvider fp = new FacadeProvider(driver);
		navigateToReportsBoxOffice(fp, firstBOPurchaseEST);
		DateRange range = ProjectUtils.getDateRangeWithSpecifiedRAngeInDaysWithStartOffset(0, 0);
		fp.getReportsBoxOfficeFacade().enterDates(range);
		
		DataHolder dataHolder = fp.getReportsBoxOfficeFacade().getPageDataHolder();
		boolean isDataInReport = fp.getReportsBoxOfficeFacade().whenUserChecksIfPurchaseEventsAreInReport(boxOfficePurchases(), dataHolder);
		Assert.assertTrue(isDataInReport, "Data not found in report");
		fp.getEventReportsFacade().givenUserIsOnAdminEventsPage();
		fp.getEventReportsFacade().whenUserVerifiesOrdersForFoundEvents(dataHolder, boxOfficePurchases(), range);
		fp.getLoginFacade().logOut();
	}
	
	private List<Purchase> boxOfficePurchases(){
		List<Purchase> purchases = new ArrayList<Purchase>();
		purchases.add(this.firstBOPurchaseEST);
		purchases.add(this.secondBOPurchaseJST);
		return purchases;
	}
	
	@Test(priority = 34, retryAnalyzer = utils.RetryAnalizer.class)
	public void verifyTransactionsAreSortedViaOperatorPerEventStartDate() throws Exception {
		maximizeWindow();

		FacadeProvider fp = new FacadeProvider(driver);
		navigateToReportsBoxOffice(fp, firstBOPurchaseEST);
		
		DateRange range = ProjectUtils.getDateRangeWithSpecifiedRAngeInDaysWithStartOffset(0, 0);
		fp.getReportsBoxOfficeFacade().enterDates(range);
		
		DataHolder dataHolder = fp.getReportsBoxOfficeFacade().getPageDataHolder();
		boolean isDataOrdered = fp.getReportsBoxOfficeFacade().thenThereShouldBeMultipeTablesWithCorrectOrder(dataHolder);
		Assert.assertTrue(isDataOrdered);
		fp.getLoginFacade().logOut();
	}
	
	private void navigateToReportsBoxOffice(FacadeProvider fp, Purchase purchase) throws Exception {
		Organization organization = purchase.getEvent().getOrganization();
		User orgAdmin = organization.getTeam().getOrgAdminUser();
		fp.getLoginFacade().givenAdminUserIsLogedIn(orgAdmin);
		fp.getOrganizationFacade().givenOrganizationExist(organization);
		fp.getReportsFacade().givenUserIsOnReportsBoxOfficePage();
	}
	
	@Test(dataProvider = "prepare_box_offce_report_data_fixture", priority = 32)
	public void boxOfficeReportPrepareDataFixture(Map<String, Object> data) throws Exception {
		maximizeWindow();
		this.firstBOPurchaseEST = (Purchase) data.get(PURCHASE_EST_ONE_KEY);
		this.secondBOPurchaseJST = (Purchase) data.get(PURCHASE_JST_TWO_KEY);
		this.notBoxOfficePurchaseSAST = (Purchase) data.get(PURCHASE_SAST_THREE_KEY);
		User orgAdmin = firstBOPurchaseEST.getEvent().getOrganization().getTeam().getOrgAdminUser();
		User boxOfficeUser = firstBOPurchaseEST.getEvent().getOrganization().getTeam().getBoxOfficeUsers().get(0);
		User standardCustomer = (User) data.get(STANDARD_CUSTOMER_KEY);
		User userOneCustomer = (User) data.get(CUSTOMER_KEY);
		
		FacadeProvider fp = new FacadeProvider(driver);
		
		fp.getLoginFacade().givenUserIsOnLoginPage();
		
		//create 3 events with orgadmin user (eventWithEST , eventWithJST, eventWithSAST)
		fp.getLoginFacade().givenUserIsLogedIn(orgAdmin);
		fp.getOrganizationFacade().givenOrganizationExist(firstBOPurchaseEST.getEvent().getOrganization());
		fp.getAdminEventStepsFacade().givenEventExistAndIsNotCanceled(firstBOPurchaseEST.getEvent());
		fp.getAdminEventStepsFacade().givenEventExistAndIsNotCanceled(secondBOPurchaseJST.getEvent());
		fp.getAdminEventStepsFacade().givenEventExistAndIsNotCanceled(notBoxOfficePurchaseSAST.getEvent());
		
		//do box office sell (eventWithEST) with organization admin user to standard user -cash
		//do box office sell (eventWithJST) with organization admin user to userOne user -credit card
		fp.getBoxOfficeFacade().givenUserIsOnBoxOfficePage();
		fp.getBoxOfficeFacade().whenUserSellsTicketToCustomer(firstBOPurchaseEST, "cash", standardCustomer);
		fp.getBoxOfficeFacade().whenUserSellsTicketToCustomer(secondBOPurchaseJST, "card", userOneCustomer);
		fp.getLoginFacade().logOut();
		
		//login with boxoffice user 
		//do box office sell (eventWithJST) with boxoffice user to standard user - credit card
		//do box office sell (eventWithEST) with boxoffice user to userOne user - cash
		fp.getLoginFacade().givenUserIsLogedIn(boxOfficeUser);
		fp.getOrganizationFacade().givenOrganizationExist(firstBOPurchaseEST.getEvent().getOrganization());
		fp.getLoginFacade().whenUserSelectsMyEventsFromProfileDropDown();
		fp.getBoxOfficeFacade().givenUserIsOnSellPage();
		fp.getBoxOfficeFacade().whenUserSellsTicketToCustomer(secondBOPurchaseJST, "card", standardCustomer);
		fp.getBoxOfficeFacade().whenUserSellsTicketToCustomer(firstBOPurchaseEST, "cash", userOneCustomer);
		fp.getLoginFacade().logOut();
		
		//login with standardUser
		//find event (eventWithSAST) and do the purchase
		fp.getEventFacade().givenUserIsOnHomePage();
		fp.getEventFacade().whenUserDoesThePurchses(notBoxOfficePurchaseSAST, standardCustomer);
		fp.getLoginFacade().logOut();
		
	}
	
	@DataProvider(name = "prepare_box_offce_report_data_fixture")
	public static Object[][] prepareBoxOffceReportDataFixture() {
		Event estTzEvent = Event.generateEventFromJson(DataConstants.EVENT_EST_TZ_KEY, true, 1, 1);
		Event jstTzEvent = Event.generateEventFromJson(DataConstants.EVENT_JST_TZ_KEY, true, 1, 1);
		Event sastTzEvent = Event.generateEventFromJson(DataConstants.EVENT_DATA_STANARD_KEY, true, 1, 1);
		Purchase prchEST = Purchase.generatePurchaseFromJson(DataConstants.REGULAR_USER_PURCHASE_KEY);
		prchEST.setEvent(estTzEvent);
		prchEST.setNumberOfTickets(2);
		prchEST.setOrderNote("Box office reports");
		
		Purchase prchJST = Purchase.generatePurchaseFromJson(DataConstants.REGULAR_USER_PURCHASE_KEY);
		prchJST.setEvent(jstTzEvent);
		prchJST.setNumberOfTickets(2);
		prchJST.setOrderNote("Box office reports");
		
		Purchase prch3 = Purchase.generatePurchaseFromJson(DataConstants.REGULAR_USER_PURCHASE_KEY);
		prch3.setEvent(sastTzEvent);
		prch3.setNumberOfTickets(2);
		prch3.setOrderNote("Box office reports");
		
		User standardCustomer = User.generateUserFromJson(DataConstants.USER_STANDARD_KEY);
		User userOneCustomer = User.generateUserFromJson(DataConstants.DISTINCT_USER_ONE_KEY);
		Map<String,Object> data = new HashMap<>();
		data.put(PURCHASE_EST_ONE_KEY, prchEST);
		data.put(PURCHASE_JST_TWO_KEY, prchJST);
		data.put(PURCHASE_SAST_THREE_KEY, prch3);
		data.put(STANDARD_CUSTOMER_KEY, standardCustomer);
		data.put(CUSTOMER_KEY, userOneCustomer);
		return new Object[][] {{
			data
		}};
	}
}