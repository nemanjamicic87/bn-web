package test.setupTest;

import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import model.Organization;
import model.User;
import model.Venue;
import test.BaseSteps;
import test.facade.FacadeProvider;
import test.facade.LoginStepsFacade;
import utils.DataConstants;

public class CreateFixtures extends BaseSteps {

	@Test(dataProvider = "user_data", groups = {"creational"})
	public void createUsers(User user) {
		FacadeProvider fp = new FacadeProvider(driver);
		LoginStepsFacade loginFacade = fp.getLoginFacade();
		maximizeWindow();
		boolean isLoggedIn = loginFacade.whenUserTiesToLogin(user);
		if (!isLoggedIn) {
			loginFacade.givenUserIsOnLoginPage();
			loginFacade.whenUserClicksOnRegisterLink();
			loginFacade.whenUserEntersRegistrationDataAndClicksOnCreateAccount(user);
			boolean isRegistered = loginFacade.thenUserShouldBeOnHomePage();
			
			Assert.assertTrue(isRegistered);
		} 
		loginFacade.logOut();
	}
	
	@DataProvider(name = "user_data")
	public static Object[][] predifinedUsersDataProvider() {
		User userOne = User.generateUserFromJson(DataConstants.DISTINCT_USER_ONE_KEY);
		User userTwo = User.generateUserFromJson(DataConstants.DISTINCT_USER_TWO_KEY);
		User userThree = User.generateUserFromJson(DataConstants.DISTINCT_USER_THREE_KEY);
		User loginTestUser = User.generateUserFromJson(DataConstants.LOGIN_TEST_USER_CRED_KEY);
		
		return new Object[][] {
			{userOne},
			{userTwo},
			{userThree},
			{loginTestUser}};
		
	}
		
	@Test(dataProvider = "organization_data", groups = {"creational"} )
	public void createOrganizations(Organization org, User user) throws Exception {
		FacadeProvider fs = new FacadeProvider(driver);
		maximizeWindow();
		fs.getLoginFacade().givenAdminUserIsLogedIn(user);
		if (!fs.getOrganizationFacade().isOrganizationPresent(org)) {
			fs.getOrganizationFacade().createOrganization(org);
		}
		fs.getOrganizationFacade().givenUserIsOnOrganizationsPage();
		fs.getOrganizationFacade().whenUserPicksOrganizationAndClickOnEdit(org);
		fs.getOrganizationFacade().updateSteps(org, true, true);
		fs.getLoginFacade().logOut();
	}
	
	@DataProvider(name = "organization_data")
	public static Object[][] organizationData(){
		Organization organization = Organization.generateOrganizationFromJson(DataConstants.ORGANIZATION_SAST, false);
		Organization standardOrg = Organization.generateOrganizationFromJson(DataConstants.ORGANIZATION_STANDARD_KEY, false);
		User superUser = User.generateSuperUser();
		return new Object[][] {
			{organization, superUser},
			{standardOrg, superUser}
		};
	}
	
	@Test(dataProvider = "venue_data", groups = {"creational"})
	public void createVenues(Venue venue, User user) {
		FacadeProvider fp = new FacadeProvider(driver);
		maximizeWindow();
		fp.getLoginFacade().givenAdminUserIsLogedIn(user);
		fp.getVenueFacade().givenUserIsOnVenuesPage();
		if (fp.getVenueFacade().isVenueAlreadyCreated(venue)) {
			fp.getVenueFacade().venueUpdateSteps(venue, false);
		} else {
			fp.getVenueFacade().venueCreateSteps(venue);
		}
		fp.getLoginFacade().logOut();
	}
	
	@DataProvider(name = "venue_data")
	public static Object[][] venuesData(){
		Venue venueEST = Venue.generateVenueFromJson(DataConstants.VENUE_EST);
		Venue venueJST = Venue.generateVenueFromJson(DataConstants.VENUE_PST);
		Venue venueCST = Venue.generateVenueFromJson(DataConstants.VENUE_CST);
		Venue venueStandard = Venue.generateVenueFromJson(DataConstants.VENUE_STANDARD_KEY);
		User superUser = User.generateSuperUser();
		return new Object[][] {
			{venueEST, superUser},
			{venueJST, superUser},
			{venueCST, superUser},
			{venueStandard, superUser}
		};
	}

}
