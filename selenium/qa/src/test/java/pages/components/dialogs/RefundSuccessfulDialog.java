package pages.components.dialogs;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class RefundSuccessfulDialog extends DialogContainerComponent{
	
	@FindBy(xpath = "//div[h1[contains(text(),'Refund successful')]]//p[contains(text(),'$')]")
	public WebElement refundAmount;

	public RefundSuccessfulDialog(WebDriver driver) {
		super(driver);
	}
	
	public void clickOnGotIt() {
		clickOnButtonWithLabel("Got it");
	}

}
