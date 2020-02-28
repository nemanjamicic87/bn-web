package pages.components;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import pages.BaseComponent;
import utils.JsUtils;

public class GenericDropDown extends BaseComponent {

	private WebElement activateDropDown;

	private WebElement dropDownContainer;

	/**
	 * activateDropDown param is element that activtes(opens) drop down. Oftenly it's some div on input element
	 * dropDownContainer param is element that holds the the list of options in drop down,
	 * most oftenly in the project it's a div with some unique id, often starting with menu-*.*. 
	 * @param driver
	 * @param activateDropDown
	 * @param dropDownContainer
	 */
	public GenericDropDown(WebDriver driver, WebElement activateDropDown, WebElement dropDownContainer) {
		super(driver);
		this.activateDropDown = activateDropDown;
		this.dropDownContainer = dropDownContainer;
	}

	/**
	 * Check if value parameter is present in "value" attribute of activateDropDown element passed to
	 * constructor
	 * @param relativeToContainer
	 * @param value
	 */
	
	public void selectElementFromDropDown(By relativeToContainer, String value) {
		if (value != null) {
			openMenuAndSelect(relativeToContainer);
			explicitWait(5, ExpectedConditions.attributeToBe(activateDropDown, "value", value));
		}
	}

	public void selectElementFromDropDownNoValueCheck(By relativeToContainer) {
		openMenuAndSelect(relativeToContainer);
	}
	/**
	 * Does the check if value parameter is text present in activateDropDown element passed to constructor 
	 * @param relativeToContainer
	 * @param value
	 */
	public void selectElementFromDropDownHiddenInput(By relativeToContainer, String value) {
		if (value != null) {
			openMenuAndSelect(relativeToContainer);
			explicitWait(5, ExpectedConditions.textToBePresentInElement(activateDropDown, value));
		}
	}
	
	private void openMenuAndSelect(By relativeToContainer) {
		waitForTime(500);
		waitVisibilityAndBrowserCheckClick(activateDropDown);
		explicitWaitForVisiblity(dropDownContainer);
		WebElement selectedElement = dropDownContainer.findElement(relativeToContainer);
		explicitWaitForVisiblity(selectedElement);
		explicitWaitForClickable(selectedElement);
		waitForTime(500);
		explicitWaitForVisibilityAndClickableWithClick(selectedElement);
	}
	
	public List<String> getDropDownList(){
		waitForTime(500);
		new JsUtils(driver).jsScrollIntoView(activateDropDown);
		waitVisibilityAndBrowserCheckClick(activateDropDown);
		explicitWaitForVisiblity(dropDownContainer);
		List<WebElement> list = getAccessUtils().getChildElementsFromParentLocatedBy(dropDownContainer, By.xpath(".//li"));
		List<String> retVal = getAccessUtils().getTextOfElements(list);
		waitVisibilityAndBrowserCheckClick(dropDownContainer);
		return retVal; 
	}
	
	public static By dropDownListContainsXpath(String value) {
		return By.xpath(".//ul//li[contains(text(),'" + value + "')]");
	}

}
