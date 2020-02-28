package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import model.User;
import utils.Constants;

public class SignUpPage extends BasePage {

	@FindBy(id = "first_name")
	private WebElement firstNameField;
	
	@FindBy(id = "first_name-error-text")
	private WebElement firstNameError;

	@FindBy(id = "last_name")
	private WebElement lastNameField;
	
	@FindBy(id = "last_name-error-text")
	private WebElement lastNameError;

	@FindBy(id = "email")
	private WebElement emailField;
	
	@FindBy(id = "email-error-text")
	private WebElement emailError;

	@FindBy(id = "password")
	private WebElement passwordField;
	
	@FindBy(id = "password")
	private WebElement passwordError;

	@FindBy(id = "confirmPassword")
	private WebElement confirmPasswordField;
	
	@FindBy(id = "confirmPassword-error-text")
	private WebElement confirmPasswordError;

	@FindBy(css = ".g-recaptcha")
	private WebElement recaptchaToken;

	@FindBy(xpath = "//form//button[@type='submit']")
	private WebElement createAccountButton;

	public SignUpPage(WebDriver driver) {
		super(driver);
	}

	@Override
	public void presetUrl() {
		setUrl(Constants.getSignUpBigNeon());
	}
	
	public void createAccount(User user) {
		createAccount(user.getFirstName(), user.getLastName(), user.getEmailAddress(), user.getPass(), user.getPassConfirm());
	}
	
	public void createAccount(String firstName, String lastName, String emailAddress, String password,
			String confirmPassword) {
		waitVisibilityAndSendKeys(firstNameField, firstName);
		waitVisibilityAndSendKeys(lastNameField, lastName);
		waitVisibilityAndSendKeys(emailField, emailAddress);
		waitVisibilityAndSendKeys(passwordField, password);
		waitVisibilityAndSendKeys(confirmPasswordField, confirmPassword);
//		new RecaptchaFrame(driver).clickOnRecaptcha();
		waitVisibilityAndBrowserCheckClick(createAccountButton);
	}
}
