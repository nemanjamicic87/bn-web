package pages.components.admin.orders.manage.tickets;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindAll;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;

import pages.BaseComponent;
import utils.SeleniumUtils;

public class OrderTicketsDetails extends BaseComponent {

	@FindBy(xpath = "//main//div[div[div[div[div[p[text()='Ticket #']]]]]]")
	private WebElement container;

	private final String IS_EXPANDED_CONDITION = "min-height: 0px; height: auto; transition-duration: 300ms;";

	private final String IS_CLOSED_CONDITION = "min-height: 0px; height: 0px; transition-duration: 300ms;";

	@FindAll(value = { @FindBy(xpath = "//main//div[p[text()='Ticket #']]/following-sibling::div[not(@class)]") })
	private List<WebElement> rows;

	private PerOrderFeeComponent perOrderFee;

	public OrderTicketsDetails(WebDriver driver) {
		super(driver);
		this.perOrderFee = new PerOrderFeeComponent(driver);
	}

	public boolean isExpanded() {
		return isExplicitConditionTrue(5,
				ExpectedConditions.attributeContains(container, "style", IS_EXPANDED_CONDITION));
	}

	public boolean isClosed() {
		return isExplicitConditionTrue(5,
				ExpectedConditions.attributeContains(container, "style", IS_CLOSED_CONDITION));
	}

	public TicketRow findTicketRow(Predicate<TicketRow> predicate) {
		Optional<TicketRow> row = rows.stream().map(e -> new TicketRow(driver, e)).filter(predicate).findFirst();
		return row.isPresent() ? row.get() : null;
	}

	public List<TicketRow> findAllTicketRows() {
		return rows.stream().map(el -> new TicketRow(driver, el)).collect(Collectors.toList());
	}

	public PerOrderFeeComponent getPerOrderFee() {
		return this.perOrderFee;
	}

	public class PerOrderFeeComponent extends BaseComponent {

		@FindBy(xpath = "//div[div[p[contains(text(),'Event Fees')]]]")
		private WebElement eventFeeContainer;

		@FindBy(xpath = "//div[div[p[contains(text(),'Credit Card Fees')]]]")
		private WebElement creditCardFeesContainer;

		private String relativeCheckBoxXpath = "./div/div/div";

		private String relativeCheckedBoxXpath = relativeCheckBoxXpath + "/img";

		private String relativeTotalMoneyAmountXpath = "./p[1]";

		private String relativaStatusXpath = "./p[2]";

		public PerOrderFeeComponent(WebDriver driver) {
			super(driver);
		}

		public boolean isVisible() {
			return isExplicitlyWaitVisible(5, eventFeeContainer) && isExplicitlyWaitVisible(5, creditCardFeesContainer);
		}

		public void clickOnCheckBoxes(boolean checkEventFee, boolean checkCardFee) {
			if (checkEventFee) {
				clickOnCheckBox(eventFeeContainer);
			}
			if (checkCardFee) {
				clickOnCheckBox(creditCardFeesContainer);
			}
		}

		private void clickOnCheckBox(WebElement element) {
			WebElement checkBox = getCheckBoxElement(element);
			SeleniumUtils.jsScrollIntoView(checkBox, driver);
			waitVisibilityAndBrowserCheckClick(checkBox);
		}

		public boolean isEntirePerOrderFeeChecked() {
			boolean isEventFeeChecked = isEventFeeChecked();
			boolean isCreditCardFeeChecked = isCreditCardFeeChecked();
			return isEventFeeChecked && isCreditCardFeeChecked;

		}
		
		public boolean isEventFeeChecked() {
			return isFeesChecked(eventFeeContainer);
		}
		
		public boolean isCreditCardFeeChecked() {
			return isFeesChecked(creditCardFeesContainer);
		}

		private boolean isFeesChecked(WebElement container) {
			return getAccessUtils().isChildElementVisibleFromParentLocatedBy(container,
					By.xpath(relativeCheckedBoxXpath), 3);
		}

		public BigDecimal getMoneyAmount(boolean checkEventFee, boolean checkCardFee) {
			BigDecimal eventFeeMoney = null;
			BigDecimal creditCardMoney = null;
			if(checkEventFee) {
				eventFeeMoney = getMoneyAmountElement(eventFeeContainer);
			}
			if (checkCardFee) {
				creditCardMoney = getMoneyAmountElement(creditCardFeesContainer);
			}
			if (creditCardMoney != null && eventFeeMoney != null) {
				return creditCardMoney.add(eventFeeMoney);
			} else if (creditCardMoney == null) {
				return eventFeeMoney;
			} else if (eventFeeMoney == null) {
				return creditCardMoney;
			} else {
				return null;
			}
		}

		private WebElement getCheckBoxElement(WebElement container) {
			return getAccessUtils().getChildElementFromParentLocatedBy(container, By.xpath(relativeCheckBoxXpath));
		}

		private BigDecimal getMoneyAmountElement(WebElement container) {
			return getAccessUtils().getBigDecimalMoneyAmount(container, relativeTotalMoneyAmountXpath);
		}

		private WebElement getStatusElement(WebElement container) {
			return getAccessUtils().getChildElementFromParentLocatedBy(container, By.xpath(relativaStatusXpath));
		}
	}
}