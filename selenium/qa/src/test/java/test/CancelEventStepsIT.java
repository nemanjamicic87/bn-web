package test;

import org.apache.commons.lang3.SerializationUtils;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import model.Event;
import model.User;
import pages.LoginPage;
import pages.components.admin.events.EventSummaryComponent;
import test.facade.AdminEventStepsFacade;
import test.facade.LoginStepsFacade;
import test.facade.OrganizationStepsFacade;
import utils.DataConstants;

public class CancelEventStepsIT extends BaseSteps {

	@Test(dataProvider = "cancel_event_steps", priority = 9, retryAnalyzer = utils.RetryAnalizer.class)
	public void cancelEventSteps(User superuser, Event event) throws Exception {
		Event genericEvent = SerializationUtils.clone(event);
		genericEvent.setEventName(genericEvent.getEventName());
		OrganizationStepsFacade organizationFacade = new OrganizationStepsFacade(driver);
		maximizeWindow();
		LoginStepsFacade loginFacade = new LoginStepsFacade(driver);
		AdminEventStepsFacade eventWrapper = new AdminEventStepsFacade(driver);
		
		
		//given
		LoginPage loginPage = loginFacade.givenAdminUserIsLogedIn(superuser);
		boolean isOrganiztionPresent = organizationFacade.givenOrganizationExist(genericEvent.getOrganization());
		Assert.assertTrue(isOrganiztionPresent);
		eventWrapper.givenUserIsOnAdminEventsPage();
		EventSummaryComponent selectedEvent = eventWrapper.givenEventExistAndIsNotCanceled(event);
		
		//when
		selectedEvent.cancelEvent();
		
		//then
		boolean isEventCanceled = eventWrapper.thenEventShouldBeCanceled(event);
		Assert.assertTrue(isEventCanceled);
		
		loginPage.logOut();
	
	}

	@DataProvider(name = "cancel_event_steps")
	public static Object[][] data_new_user() {
		User superUser = User.generateSuperUser();
		Event event = Event.generateEventFromJson(DataConstants.EVENT_DATA_STANARD_KEY, false, 1, 2);
		event.setEventName("TestNameCancelEvent");
		return new Object[][] { { superUser, event } };
	}

}
