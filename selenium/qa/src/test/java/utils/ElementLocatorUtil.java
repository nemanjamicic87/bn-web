package utils;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class ElementLocatorUtil {

	public static final String XPATH = "xpath:";
	public static final String ID = "id:";

	private WebDriver driver;

	public ElementLocatorUtil(WebDriver driver) {
		super();
		this.driver = driver;
	}

	public By getBy(WebElement element) {
		String val = element.toString();
		By retVal = null;
		if (val.contains(XPATH)) {
			retVal =  getByXpathFromElement(element);
		} else if (val.contains(ID)) {
			retVal =  getByIdFromElement(element);
		} 
		return retVal;
	}

	public By getByIdFromElement(WebElement element) {
		String locator = getLocatorStringFromElement(element, ID);
		locator = locator.replace("]", "");
		return By.id(locator.trim());
	}

	public By getByXpathFromElement(WebElement element) {
		String locator = getLocatorStringFromElement(element, XPATH);
		return By.xpath(locator);
	}

	public String getLocatorStringFromElement(WebElement element, String using) {
		String val = element.toString();
		val = val.substring(1, val.length() -1);
		String[] tokens = val.split(using);
		String locator = tokens[tokens.length - 1];
		return locator;
	}

}
