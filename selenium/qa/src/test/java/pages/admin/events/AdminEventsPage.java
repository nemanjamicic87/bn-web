package pages.admin.events;

import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;

import pages.BasePage;
import pages.components.admin.events.EventSummaryComponent;
import utils.Constants;
import utils.SeleniumUtils;

public class AdminEventsPage extends BasePage {

	@FindBy(linkText = "Upcoming")
	private WebElement upcomingEvents;

	@FindBy(linkText = "Past")
	private WebElement pastEvents;

	@FindBy(xpath = "//body//main//a[@href='/admin/events/create']/button")
	private WebElement createEventButton;

	@FindBy(xpath = "//main//div[div[div[div[div[p[contains(text(),'Events')]]]]]]")
	private WebElement eventsDashboardContainer;

	// relative to eventsDashboardContainer
	private String relativeEventListContainer = "./div[2]/div/div/div";

	public AdminEventsPage(WebDriver driver) {
		super(driver);
	}

	@Override
	public void presetUrl() {
		setUrl(Constants.getAdminEvents());
	}

	public EventSummaryComponent findEventByName(String eventName) {
		if (isEventPresent(eventName)) {
			WebElement element = findWebElementEventByName(eventName);
			EventSummaryComponent component = new EventSummaryComponent(driver, element);
			return component;
		} else {
			return null;
		}
	}

	public EventSummaryComponent findEvent(String eventName, Predicate<EventSummaryComponent> predicate) {
		if (isEventPresent(eventName)) {
			List<WebElement> elements = findWebElementsEventByName(eventName);
			Optional<EventSummaryComponent> optionalComponent = elements.stream()
					.map(e -> new EventSummaryComponent(driver, e)).filter(predicate).findFirst();
			if (optionalComponent != null && optionalComponent.isPresent()) {
				return optionalComponent.get();
			} else {
				return null;
			}
		} else {
			return null;
		}
	}

	/*
	 * Returns first event component that matches the predicate conditions, or returns null
	 */
	public EventSummaryComponent findEvent(Predicate<EventSummaryComponent> predicate) {
		List<WebElement> allEvents = findAllWebElements();
		if (allEvents != null) {
			Optional<EventSummaryComponent> optionalComponent = allEvents.stream()
					.map(e -> new EventSummaryComponent(driver, e)).filter(predicate).findFirst();
			if (optionalComponent != null && optionalComponent.isPresent()) {
				return optionalComponent.get();
			} else {
				return null;
			}
		} else {
			return null;
		}
	}

	private List<WebElement> findAllWebElements() {
		List<WebElement> allEvents = SeleniumUtils.getChildElementsFromParentLocatedBy(eventsDashboardContainer,
				By.xpath(relativeEventListContainer), driver);
		if (allEvents != null && !allEvents.isEmpty()) {
			return allEvents;
		} else {
			return null;
		}
	}

	private List<WebElement> findWebElementsEventByName(String eventName) {
		explicitWaitForVisiblity(eventsDashboardContainer);
		List<WebElement> list = explicitWait(15,
				ExpectedConditions.visibilityOfAllElementsLocatedBy(findByNameXpath(eventName)));
		return list;
	}

	private WebElement findWebElementEventByName(String eventName) {
		explicitWaitForVisiblity(eventsDashboardContainer);
		WebElement event = explicitWait(15, ExpectedConditions.visibilityOfElementLocated(findByNameXpath(eventName)));
		return event;
	}

	private boolean isEventPresent(String eventName) {
		explicitWaitForVisiblity(eventsDashboardContainer);
		return isExplicitlyWaitVisible(6, findByNameXpath(eventName));
	}

	private By findByNameXpath(String eventName) {
		return By.xpath("//main//div[div[div[div[div[a[p[contains(text(),'" + eventName + "')]]]]]]]");
	}

	public void clickCreateEvent() {
		waitForTime(1000);
		waitVisibilityAndClick(createEventButton);
	}

}
