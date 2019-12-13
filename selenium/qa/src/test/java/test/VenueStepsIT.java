package test;

import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import model.User;
import model.Venue;
import test.facade.FacadeProvider;
import test.facade.LoginStepsFacade;
import test.facade.VenueStepsFacade;
import utils.DataConstants;

public class VenueStepsIT extends BaseSteps {

	@Test(dataProvider = "create_venue_data", priority = 22, retryAnalyzer = utils.RetryAnalizer.class)
	public void createVenue(Venue venue, User superuser) {
		FacadeProvider fp = new FacadeProvider(driver);
		LoginStepsFacade loginFacade = fp.getLoginFacade();
		VenueStepsFacade venueStepsFacade = fp.getVenueFacade();
		maximizeWindow();

		loginFacade.givenAdminUserIsLogedIn(superuser);
		venueStepsFacade.venueCreateSteps(venue);
		loginFacade.logOut();
	}
	
	@Test(dataProvider = "create_venue_data", priority = 22, retryAnalyzer = utils.RetryAnalizer.class )
	public void requiredFieldsCheckCreate(Venue venue, User superuser) {
		FacadeProvider fp = new FacadeProvider(driver);
		maximizeWindow();
		fp.getLoginFacade().givenAdminUserIsLogedIn(superuser);
		fp.getVenueFacade().venueRequiredFieldsValidation(venue, true, true);
		fp.getVenueFacade().thenUserIsOnVenuesPage();
		fp.getLoginFacade().logOut();
	}
	
	@Test(dataProvider = "create_venue_data", priority = 22)
	public void requiredFieldsCheckUpdate(Venue venue, User superuser) {
		FacadeProvider fp = new FacadeProvider(driver);
		maximizeWindow();
		fp.getLoginFacade().givenAdminUserIsLogedIn(superuser);
		fp.getVenueFacade().venueRequiredFieldsValidation(venue, true, false);
		fp.getLoginFacade().logOut();
	}

	@DataProvider(name = "create_venue_data")
	private static Object[][] createVenueData() {
		Venue venue = Venue.generateVenueFromJson(DataConstants.VENUE_CREATIONAL_KEY);
		User superuser = User.generateSuperUser();
		return new Object[][] { { venue, superuser } };
	}

	@Test(dataProvider = "edit_venue_data", priority = 23, retryAnalyzer = utils.RetryAnalizer.class)
	public void updateVenue(Venue venue, User superuser) {
		FacadeProvider fp = new FacadeProvider(driver);
		LoginStepsFacade loginStepsFacade = fp.getLoginFacade();
		VenueStepsFacade venueStepsFacade = fp.getVenueFacade();
		maximizeWindow();

		loginStepsFacade.givenAdminUserIsLogedIn(superuser);
		venueStepsFacade.givenUserIsOnVenuesPage();
		venueStepsFacade.venueUpdateSteps(venue, true);
		
		loginStepsFacade.logOut();
	}

	@DataProvider(name = "edit_venue_data")
	private static Object[][] editVenueData() {
		Venue venue = Venue.generateVenueFromJson(DataConstants.VENUE_CREATIONAL_KEY);
		User superuser = User.generateSuperUser();
		return new Object[][] { { venue, superuser } };
	}

}
