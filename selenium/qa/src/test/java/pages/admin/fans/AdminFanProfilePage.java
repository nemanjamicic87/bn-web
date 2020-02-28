package pages.admin.fans;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;

import pages.BasePage;
import pages.components.admin.fans.manage.FanProfileEventSummaryComponent;
import utils.Constants;

public class AdminFanProfilePage extends BasePage {

	private String fanId;

	@FindBy(xpath = "//main//div[div[p[contains(text(),'Fan Profile')]]]/following-sibling::div/div/div/div[1]")
	private WebElement fanInformationContainer;

	@FindBy(xpath = "//main//div[div[p[contains(text(),'Fan Profile')]]]/following-sibling::div/div/div/div[1]/div/div/div[2]/p[1]")
	private WebElement userNameElement;

	@FindBy(xpath = "//main//div[div[p[contains(text(),'Fan Profile')]]]/following-sibling::div/div/div/div[1]/div/div/div[2]/p[2]")
	private WebElement emailElement;

	@FindBy(xpath = "//main//div[p[contains(text(),'Event Activity')]]/div/p/a[span[contains(text(),'Upcoming')]]")
	private WebElement upcomingEventsLink;

	@FindBy(xpath = "//main//div[p[contains(text(),'Event Activity')]]/div/p/a[span[contains(text(),'Past')]]")
	private WebElement pastEventsLink;

	public AdminFanProfilePage(WebDriver driver, String fanId) {
		super(driver);
		this.fanId = fanId;
		presetUrl();
	}

	@Override
	public void presetUrl() {
		setUrl(Constants.getAdminFans() + "/" + fanId);
	}
	
	public void navigate() {
		super.navigate();
		driver.get(getUrl());
	}

	public String getFanName() {
		explicitWaitForVisiblity(userNameElement);
		String text = userNameElement.getText();
		return text;
	}

	public String getFanEmail() {
		explicitWaitForVisiblity(emailElement);
		return emailElement.getText();
	}
	
	public FanProfileEventSummaryComponent findSummaryComponent(Predicate<FanProfileEventSummaryComponent> predicate, int eventListLimit) {
		List<WebElement> listOfEvents = findEvents(eventListLimit);
		Optional<FanProfileEventSummaryComponent> optionalSummaryCard = listOfEvents.stream()
				.map(el->new FanProfileEventSummaryComponent(driver, el))
				.filter(predicate)
				.findFirst();
		return optionalSummaryCard.isPresent()?optionalSummaryCard.get():null;
	}

	public List<FanProfileEventDataHolder> getEventsData(int eventListLimit) {

		List<WebElement> listOfEvents = findEvents(eventListLimit);
		List<FanProfileEventSummaryComponent> eventComponents = listOfEvents.stream()
				.map(el -> new FanProfileEventSummaryComponent(driver, el))
				.collect(Collectors.toList());
		List<FanProfileEventDataHolder> eventDataList = eventComponents.stream()
				.map(el -> new FanProfileEventDataHolder(el))
				.collect(Collectors.toList());
		return eventDataList;
	}

	public List<WebElement> findEvents(int limit) {
		if (limit == 0) {
			limit = 30;
		}
		List<WebElement> events = explicitWaitForVisiblityForAllElements(By.xpath(
				"//main//div[p[contains(text(),'Event Activity')]]/div[not(@class) and position() <= " + limit + "]"));
		return events;
	}

	public void clickOnUpcomingEvents() {
		waitVisibilityAndBrowserCheckClick(upcomingEventsLink);
	}

	public void clickOnPastEvents() {
		waitVisibilityAndBrowserCheckClick(pastEventsLink);
	}

	public boolean isOnPastEventsPage() {
		return isExplicitConditionTrue(15, ExpectedConditions.urlToBe(getUrl() + "/past"));
	}

	public class FanProfileEventDataHolder {

		private String eventName;
		private LocalDateTime dateTime;

		public FanProfileEventDataHolder(FanProfileEventSummaryComponent eventComponent) {
			this.eventName = eventComponent.getEventName();
			this.dateTime = eventComponent.getEventDateAndTime();
		}

		public String getEventName() {
			return eventName;
		}

		public void setEventName(String eventName) {
			this.eventName = eventName;
		}

		public LocalDateTime getDateTime() {
			return dateTime;
		}

		public void setDateTime(LocalDateTime dateTime) {
			this.dateTime = dateTime;
		}

		@Override
		public int hashCode() {
			final int prime = 31;
			int result = 1;
			result = prime * result + getOuterType().hashCode();
			result = prime * result + ((dateTime == null) ? 0 : dateTime.hashCode());
			result = prime * result + ((eventName == null) ? 0 : eventName.hashCode());
			return result;
		}

		@Override
		public boolean equals(Object obj) {
			if (this == obj)
				return true;
			if (obj == null)
				return false;
			if (getClass() != obj.getClass())
				return false;
			FanProfileEventDataHolder other = (FanProfileEventDataHolder) obj;
			if (!getOuterType().equals(other.getOuterType()))
				return false;
			if (dateTime == null) {
				if (other.dateTime != null)
					return false;
			} else if (!dateTime.equals(other.dateTime))
				return false;
			if (eventName == null) {
				if (other.eventName != null)
					return false;
			} else if (!eventName.equals(other.eventName))
				return false;
			return true;
		}

		private AdminFanProfilePage getOuterType() {
			return AdminFanProfilePage.this;
		}
	}
}