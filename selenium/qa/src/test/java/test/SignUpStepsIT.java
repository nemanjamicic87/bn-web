package test;

import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import model.User;
import test.facade.LoginStepsFacade;

public class SignUpStepsIT extends BaseSteps {

	@Test(dataProvider = "new_user_data", priority = 4, retryAnalyzer = utils.RetryAnalizer.class)
	public void singUpToBigNeon(User user) {
		LoginStepsFacade loginFacade = new LoginStepsFacade(driver);
		maximizeWindow();
		loginFacade.givenUserIsOnLoginPage();
		loginFacade.whenUserClicksOnRegisterLink();
		loginFacade.whenUserEntersRegistrationDataAndClicksOnCreateAccount(user);
		boolean retVal = loginFacade.thenUserShouldBeOnHomePage();
		loginFacade.logOut();
		Assert.assertTrue(retVal);
	}
	
	@DataProvider(name = "new_user_data")
	public static Object[][] dataProvider() {
		User user = User.generateRandomUser();
		return new Object[][] {{user}};
	}
	
}
