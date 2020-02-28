package pages.components.dialogs;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class CancelEventDialog extends DialogContainerComponent{
	
	@FindBy(xpath = "//div/h1[contains(text(),'Cancel Event')]")
	private WebElement title;
	
	@FindBy(xpath = "//form//button[@type='submit' and span[contains(text(),'Cancel event')]]")
	private WebElement cancelEventButton;
	
	private String CANCEL_EVENT_BTN_LABEL = "Cancel event";

	@FindBy(xpath = "//form//button[@type='button' and span[contains(text(),'Keep event')]]")
	private WebElement keepEventButton;
	
	public CancelEventDialog(WebDriver driver) {
		super(driver);
	}
	
	public void clickOnCancelEventButton() {
		isVisible();
		clickOnButtonWithLabel(CANCEL_EVENT_BTN_LABEL);
	}

}
