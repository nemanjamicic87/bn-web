package pages;

import java.io.Serializable;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NotFoundException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;

import config.BrowsersEnum;
import config.DriverFactory;
import pages.components.datepicker.DatePickerComponent;
import utils.AccessabilityUtil;
import utils.ElementLocatorUtil;
import utils.SeleniumUtils;

public class AbstractBase implements Serializable {

	public WebDriver driver;
	
	private AccessabilityUtil accessUtils;
	
	private ElementLocatorUtil locatorUtils;

	public AbstractBase(WebDriver driver) {
		this.driver = driver;
		PageFactory.initElements(driver, this);
		this.accessUtils = new AccessabilityUtil(driver);
		this.locatorUtils = new ElementLocatorUtil(driver);
	}
	
	public WebDriver getDriver() {
		return driver;
	}
	
	public ElementLocatorUtil getLocatorUtils() {
		return locatorUtils;
	}
	
	public AccessabilityUtil getAccessUtils() {
		return accessUtils;
	}

	public void setDriver(WebDriver driver) {
		this.driver = driver;
	}
	
	public void enterDate(WebElement inputField, String value) {
		if(value != null && !value.isEmpty() && inputField != null) {
			DatePickerComponent datePicker = new DatePickerComponent(driver, inputField);
			datePicker.selectDate(value);
		}
	}

	public <T, V> T explicitWaitForVisiblityForAllElements(By by) {
		return explicitWait(15, ExpectedConditions.visibilityOfAllElementsLocatedBy(by));
	}
	
	public <T,V> T explicitWaitForVisibilityBy(By by) {
		return explicitWait(15, ExpectedConditions.visibilityOfElementLocated(by));
	}
	
	public void explicitWaitForVisiblityAndClickableWithClick(WebElement element, int seconds) {
		explicitWaitForVisiblity(element, seconds);
		explicitWaitForClickable(element);
		element.click();
	}
	
	public void explicitWaitForVisibilityAndClickableWithClick(WebElement element) {
		explicitWaitForVisiblity(element);
		explicitWaitForClickable(element);
		element.click();
	}

	public boolean isExplicitlyWaitVisible(WebElement element) {
		return isExplicitlyWaitVisible(15, element);
	}

	public boolean isExplicitlyWaitVisible(int timeForSeconds, WebElement element) {
		boolean retVal = false;
		try {
			explicitWait(timeForSeconds, ExpectedConditions.visibilityOf(element));
			retVal = true;
		} catch (Exception e) {
			retVal = false;
		}
		return retVal;
	}

	public boolean isExplicitConditionTrue(int waitForSeconds, Function<? super WebDriver, Boolean> condition) {
		boolean retVal = false;
		try {
			retVal = explicitWait(waitForSeconds, condition);
			retVal = true;
		} catch (Exception e) {
			retVal = false;
		}
		return retVal;
	}

	public boolean isExplicitlyInvisible(long waitForMills, By element) {
		boolean retVal = false;
		long pollingInterval = 200;
		try {
			explicitWait(waitForMills, pollingInterval, ExpectedConditions.invisibilityOfElementLocated(element));
			retVal = true;
		} catch (Exception e) {
			retVal = false;
		}
		return retVal;
	}

	public boolean isExplicitlyWaitVisible(By byElement) {
		return isExplicitlyWaitVisible(15, byElement);
	}

	public boolean isExplicitlyWaitVisible(int waitForSeconds, By byElement) {
		boolean retVal = false;
		try {
			explicitWait(waitForSeconds, ExpectedConditions.visibilityOfElementLocated(byElement));
			retVal = true;
		} catch (Exception e) {
			retVal = false;
		}
		return retVal;
	}
	
	public void waitVisibilityAndBrowserCheckClick(WebElement element, int seconds) {
		if (isSafari()) {
			waitForTime(seconds*1000);
			SeleniumUtils.clickOnElement(element, driver);
		} else {
			explicitWaitForVisiblityAndClickableWithClick(element, seconds);
		}
	}

	public void waitVisibilityAndBrowserCheckClick(WebElement element) {
		if (isSafari()) {
			SeleniumUtils.clickOnElement(element, driver);
		} else {
			explicitWaitForVisibilityAndClickableWithClick(element);
		}
	}
	
	public void waitVisibilityAndSendKeysSlow(WebElement element, String value) {
		if (value == null) {
			return;
		}
		explicitWaitForVisiblity(element);
		explicitWaitForClickable(element);
		for (int i = 0; i < value.length(); i++) {
			element.sendKeys(Character.toString(value.charAt(i)));
			waitForTime(100);
		}
	}
	
	public void waitVisibilityAndClearFieldSendKeys(WebElement inputField, String value) {
		if (value == null) {
			return;
		}
		String text = inputField.getAttribute("value");
	    inputField.clear();
	    String newtext = inputField.getAttribute("value");
	    if(!newtext.isEmpty()) {
			for (int i = 0; i < text.length() + 4; i++) {
				inputField.sendKeys(Keys.BACK_SPACE);
			}
	    }
		waitVisibilityAndSendKeysSlow(inputField,value);

	}

	public void waitVisibilityAndClearFieldSendKeysF(WebElement inputField, String value) {
		explicitWaitForVisiblity(inputField);
		String text = inputField.getAttribute("value");
	    inputField.clear();
	    String newtext = inputField.getAttribute("value");
	    if(!newtext.isEmpty()) {
			for (int i = 0; i < text.length() + 4; i++) {
				inputField.sendKeys(Keys.BACK_SPACE);
			}
	    }
	    waitVisibilityAndSendKeys(inputField,value);
	}
	public void waitVisibilityAndSendKeys(WebElement element, String value) {
		explicitWaitForVisiblity(element);
		explicitWaitForClickable(element);
		element.sendKeys(value);
	}
	
	public void explicitWaitForClicableWithClick(WebElement element) {
		explicitWaitForClickable(element);
		element.click();
	}

	public <T, V> T explicitWaitForClickable(WebElement element) {
		return explicitWait(15, ExpectedConditions.elementToBeClickable(element));
	}

	public void waitVisibilityAndClick(WebElement element) {
		explicitWait(15, ExpectedConditions.and(ExpectedConditions.visibilityOf(element),
				ExpectedConditions.elementToBeClickable(element)));
		element.click();
	}
	
	public <T, V> T explicitWaitForVisiblity(WebElement element, int seconds) {
		return explicitWait(seconds, ExpectedConditions.visibilityOf(element));
	}

	public <T, V> T explicitWaitForVisiblity(WebElement element) {
		return explicitWait(15, ExpectedConditions.visibilityOf(element));
	}

	public <T, V> T explicitWait(int time, Function<? super WebDriver, V> condition) throws TimeoutException {
		return explicitWait(time, 500, condition);
	}
	
	@SuppressWarnings("unchecked")
	public <T, V> T explicitWait(long timeInMillisec, long poolingInterval, Function<? super WebDriver, V> condition) {
		Wait<WebDriver> wait = new FluentWait<WebDriver>(driver).withTimeout(timeInMillisec, TimeUnit.MILLISECONDS)
				.pollingEvery(poolingInterval, TimeUnit.MILLISECONDS);
		return (T) wait.until(condition);
	}
	
	@SuppressWarnings("unchecked")
	public <T, V> T explicitWait(int time, long poolingInterval, Function<? super WebDriver, V> condition)
			throws TimeoutException {
		return (T) new WebDriverWait(driver, time, poolingInterval).until(condition);
	}

	public void waitForTime(long mills) {
		try {
			Wait<WebDriver> wait = new FluentWait<WebDriver>(driver).withTimeout(mills, TimeUnit.MILLISECONDS)
					.pollingEvery(mills, TimeUnit.MILLISECONDS).ignoring(NoSuchElementException.class)
					.ignoring(NotFoundException.class).ignoring(Exception.class);
			wait.until(new Function<WebDriver, WebElement>() {

				@Override
				public WebElement apply(WebDriver t) {
					return driver.findElement(By.id("noelement"));
				}

			});
		} catch (Exception e) {
		}
	}
	
	public boolean isRemote() {
		if (driver.getClass().equals(RemoteWebDriver.class)) {
			return true;
		} else {
			return false;
		}
		
	}

	public boolean isSafari() {
		BrowsersEnum browser = DriverFactory.getBrowser();
		if (BrowsersEnum.REMOTE.equals(browser)) {
			String b = ((RemoteWebDriver) driver).getCapabilities().getBrowserName();
			if (b.toLowerCase().contains("safari")) {
				return true;
			} else {
				return false;
			}
		} else if (BrowsersEnum.SAFARI.equals(browser)) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * NOTE: SAFARI DOES NOT SUPPORT Advanced Interaction API
	 * 
	 * @param text
	 * @return
	 */
	public Actions actionsManualType(String text) {
		Actions actions = new Actions(driver);
		actions.sendKeys(Keys.chord(text)).perform();
		return actions;
	}

	public Actions actionsMoveToElement(WebElement element) {
		Actions actions = new Actions(driver);
		actions.moveToElement(element).perform();
		return actions;
	}
	
	public void clickOnButtonWithLabel(String label) {
		waitVisibilityAndBrowserCheckClick(getButtonWithLabel(label));
	}
	
	public WebElement getButtonWithLabel(String label) {
		return explicitWaitForVisibilityBy(By.xpath("//button[span[contains(text(),'" + label + "')]]"));
	}
	
	

}
