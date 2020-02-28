package pages.components.dialogs;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import pages.BaseComponent;

public class DialogContainerComponent extends BaseComponent{
	
	@FindBy(xpath = "//body//div[@role='dialog' and @aria-labelledby='dialog-title']")
	private WebElement dialogContainer;
	
	private By dialogContainerBy = By.xpath("//body//div[@role='dialog' and @aria-labelledby='dialog-title']");

	public DialogContainerComponent(WebDriver driver) {
		super(driver);
	}
	
	public boolean isInvisible(long waitSec) {
		return isExplicitlyInvisible(waitSec, dialogContainerBy);
	}
	
	public boolean isVisible() {
		return isExplicitlyWaitVisible(dialogContainer);
	}
	
	public WebElement getDialogContainer() {
		return dialogContainer;
	}

	public void setDialogContainer(WebElement dialogContainer) {
		this.dialogContainer = dialogContainer;
	}

}
