package pages.components.dialogs;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class RefundOverrideDialog extends DialogContainerComponent {

	@FindBy(xpath = "//h1[contains(text(),'Refund Override')]")
	private WebElement title;
	
	@FindBy(xpath = "//p[b[contains(text(),'Are you sure you want to process the refund?')]]")
	private WebElement content;
	
	public RefundOverrideDialog(WebDriver driver) {
		super(driver);
	}
	
	public void clickOnCancelButton() {
		clickOnButtonWithLabel("Cancel");
	}
	
	public void clickOnConfirmButton() {
		waitForTime(1000);
		WebElement element = getButtonWithLabel("Confirm");
		explicitWait(5, ExpectedConditions.refreshed(ExpectedConditions.visibilityOf(element)));
		waitVisibilityAndBrowserCheckClick(element);
		
	}

}
