package utils;

import java.math.BigDecimal;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class AccessabilityUtil {

	private WebDriver driver;

	public AccessabilityUtil(WebDriver driver) {
		this.driver = driver;
	}

	public String getUrlPath() throws URISyntaxException {
		String url = driver.getCurrentUrl();
		URI uri = new URI(url);
		String path = uri.getPath();
		return path;
	}

	public String getTextOfElemenyLocatedBy(By by) {
		WebElement element = new WebDriverWait(driver, 15).until(ExpectedConditions.visibilityOfElementLocated(by));
		String text = element.getText();
		return text.trim();
	}

	public List<String> getTextOfElements(List<WebElement> elements) {
		if (elements == null) {
			throw new IllegalArgumentException("List passed to getTextOfElements method is null");
		}
		List<String> retVal = new ArrayList<>(elements.size());
		for (WebElement el : elements) {
			retVal.add(getTextOfElement(el));
		}
		return retVal;
	}

	public String getTextOfElement(WebElement element) {
		return element.getText().trim();
	}

	public WebElement getChildElementFromParentLocatedBy(WebElement parent, By relativeChildBy) {
		return getChildElementFromParentLocatedBy(parent, relativeChildBy, 15);
	}

	public WebElement getChildElementFromParentLocatedBy(WebElement parent, By relativeChildBy, int seconds) {
		new WebDriverWait(driver, seconds).until(ExpectedConditions.visibilityOf(parent));
		WebElement element = new WebDriverWait(driver, seconds)
				.until(ExpectedConditions.visibilityOf(parent.findElement(relativeChildBy)));
		return element;
	}

	public List<WebElement> getChildElementsFromParentLocatedBy(WebElement parent, By relativeChildBy) {
		new WebDriverWait(driver, 15).until(ExpectedConditions.visibilityOf(parent));
		List<WebElement> elements = new WebDriverWait(driver, 15)
				.until(ExpectedConditions.visibilityOfAllElements(parent.findElements(relativeChildBy)));
		return elements;
	}

	public Integer getIntegerAmount(WebElement parent, By relativeChildBy, WebDriver driver) {
		WebElement el = getChildElementFromParentLocatedBy(parent, relativeChildBy);
		String text = el.getText();
		if (text.isEmpty()) {
			return null;
		}
		return Integer.parseInt(text.trim());
	}

	public Integer getIntAmount(WebElement parent, String relativeElPath) {
		if (!isChildElementVisibleFromParentLocatedBy(parent, By.xpath(relativeElPath), 3)) {
			return null;
		}
		WebElement el = getChildElementFromParentLocatedBy(parent, By.xpath(relativeElPath));
		return getIntegerAmount(el, "$", "");
	}

	public Integer getIntegerAmount(WebElement element, String oldChar, String newChar) {
		String text = ProjectUtils.getTextForElementAndReplace(element, oldChar, newChar);
		if (text.isEmpty()) {
			return null;
		}
		return Integer.parseInt(text.trim());
	}

	public BigDecimal getBigDecimalMoneyAmount(WebElement parent, String relativeElPath) {
		if (!isChildElementVisibleFromParentLocatedBy(parent, By.xpath(relativeElPath), 3)) {
			return null;
		}
		WebElement el = getChildElementFromParentLocatedBy(parent, By.xpath(relativeElPath));
		return getBigDecimalMoneyAmount(el);

	}

	public BigDecimal getBigDecimalMoneyAmount(String xpath) {
		WebElement element = driver.findElement(By.xpath(xpath));
		return getBigDecimalMoneyAmount(element);
	}

	public BigDecimal getBigDecimalMoneyAmount(WebElement element) {
		return getBigDecimalMoneyAmount(element, "$", "");

	}

	public BigDecimal getBigDecimalMoneyAmount(WebElement element, String oldChar, String newChar) {
		String text = ProjectUtils.getTextForElementAndReplace(element, oldChar, newChar);
		if (text == null || text.isEmpty()) {
			return null;
		}
		return new BigDecimal(text.trim());
	}

	public Double getDoubleAmount(WebElement parent, String relativeElPath) {
		if (!isChildElementVisibleFromParentLocatedBy(parent, By.xpath(relativeElPath), 3)) {
			return null;
		}
		WebElement el = getChildElementFromParentLocatedBy(parent, By.xpath(relativeElPath));
		return getDoubleAmount(el, "$", "");
	}

	public String getText(WebElement parent, By by) {
		if (!isChildElementVisibleFromParentLocatedBy(parent, by, 3)) {
			return null;
		}
		WebElement el = getChildElementFromParentLocatedBy(parent, by);
		return el.getText().trim();
	}
	
	public String getValue(WebElement element) {
		waitVisiblity(element);
		String value = element.getAttribute("value");
		return value;
	}

	public Double getDoubleAmount(WebElement element, String oldChar, String newChar) {
		String text = ProjectUtils.getTextForElementAndReplace(element, oldChar, newChar);
		if (text.isEmpty()) {
			return null;
		}
		return Double.parseDouble(text.trim());
	}

	public BigDecimal getBigDecimalAmount(WebElement element, String oldChar, String newChar) {
		String text = ProjectUtils.getTextForElementAndReplace(element, oldChar, newChar);
		if (text.isEmpty()) {
			return null;
		}
		return new BigDecimal(text);
	}

	public BigDecimal getBigDecimalAmount(WebElement parent, String relativeChildXpath) {
		if (!isChildElementVisibleFromParentLocatedBy(parent, By.xpath(relativeChildXpath), 3)) {
			return null;
		}
		WebElement el = getChildElementFromParentLocatedBy(parent, By.xpath(relativeChildXpath));
		return getBigDecimalAmount(el, "$", "");
	}

	public boolean refreshElement(WebElement toBeRefreshed) {
		try {
			new WebDriverWait(driver, 10)
					.until(ExpectedConditions.refreshed(ExpectedConditions.visibilityOf(toBeRefreshed)));
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	public boolean refreshElement(List<WebElement> toBeRefreshed) {
		try {
			new WebDriverWait(driver, 10)
					.until(ExpectedConditions.refreshed(ExpectedConditions.visibilityOfAllElements(toBeRefreshed)));
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	public boolean isChildElementVisibleFromParentLocatedBy(WebElement parent, By relativeChildBy) {
		return isChildElementVisibleFromParentLocatedBy(parent, relativeChildBy, 15);
	}

	public boolean isChildElementVisibleFromParentLocatedBy(WebElement parent, By relativeChildBy, int seconds) {
		boolean retVal = false;
		try {
			getChildElementFromParentLocatedBy(parent, relativeChildBy, seconds);
			retVal = true;
		} catch (Exception e) {
			retVal = false;
		}
		return retVal;
	}

	public void clearInputFields(WebElement... inputFields) {
		for (WebElement el : inputFields) {
			clearInputField(el);
		}
	}

	public void clearInputField(WebElement inputField) {
		new WebDriverWait(driver, 10).until(ExpectedConditions.visibilityOf(inputField));
		String text = inputField.getAttribute("value");
		for (int i = 0; i < text.length() + 4; i++) {
			inputField.sendKeys(Keys.BACK_SPACE);
		}
	}
	
	private void waitVisiblity(WebElement element) {
		waitVisibility(element, 10);
	}
	
	private void waitVisibility(WebElement element, int timeInSec) {
		new WebDriverWait(driver, timeInSec).until(ExpectedConditions.visibilityOf(element));
	}
}