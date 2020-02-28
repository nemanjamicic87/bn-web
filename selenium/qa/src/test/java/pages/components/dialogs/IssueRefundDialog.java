package pages.components.dialogs;

import java.math.BigDecimal;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import pages.components.GenericDropDown;

public class IssueRefundDialog extends DialogContainerComponent {

	public enum RefundReason {
		CANCELLATION_POSTPONEMENT("Cancellation/Postponement", "cancellation"),
		EXCHANGE_UPGRADE("Exchange/Upgrade", "exchange"),
		OVERCART("Overcart", "overcart"),
		UNABLE_TO_ATTEND("Unable to attend", "unable-to-attend"),
		FRAUD_CHARGEBACK("Fraud/Chargeback", "fraud"),
		SNAD("SNAD (significantly not as described)", "snad"),
		PRICE_DISCREPANCY("Price discrepancy", "price"),
		OTHER("Other", "other");

		private String label;
		private String value;

		private RefundReason(String label, String value) {
			this.label = label;
			this.value = value;
		}

		public String getLabel() {
			return label;
		}

		public String getValue() {
			return value;
		}
		
		public static RefundReason getRefundReason(String label) {
			for(RefundReason rr : values()) {
				if (rr.getLabel().equalsIgnoreCase(label)) {
					return rr;
				}
			}
			return null;
		}
	}

	@FindBy(xpath = "//input[@id='reason']/preceding-sibling::div[@role='button' and @aria-haspopup='true']")
	private WebElement selectReasonActivateDropDown;

	@FindBy(id = "menu-reason")
	private WebElement selectReasonDropDownContainer;

	@FindBy(xpath = "//button[@type='button' and span[text()='Cancel']]")
	private WebElement cancelButton;

	@FindBy(xpath = "//button[@type='button' and span[text()='Confirm']]")
	private WebElement confirmButton;

	@FindBy(xpath = "//button[@type='button' and span[contains(text(),'Got it')]]/preceding-sibling::p/span/span")
	private WebElement purchaserInfoParagraph;

	@FindBy(xpath = "//button[@type='button' and span[contains(text(),'Got it')]]")
	private WebElement gotItButton;
	
	@FindBy(xpath = "//div[p[contains(text(),'Refund total')]]/p[2]")
	private WebElement refundTotal;

	public IssueRefundDialog(WebDriver driver) {
		super(driver);
	}

	public void selectRefundReason(RefundReason refundReason) {
		GenericDropDown dropDown = new GenericDropDown(driver, selectReasonActivateDropDown,
				selectReasonDropDownContainer);
		dropDown.selectElementFromDropDownHiddenInput(
				By.xpath(".//ul//li[contains(text(),'" + refundReason.getLabel() + "')]"), refundReason.getLabel());
		waitForTime(1500);
	}
	
	public void clickOnCancel() {
		clickOnButtonWithLabel("Cancel");
	}

	public void clickOnContinue() {
		waitForTime(1500);
		clickOnButtonWithLabel("Confirm");
		waitForTime(1500);
	}
	
	public void clickOnRefundOveride() {
		clickOnButtonWithLabel("Refund Override");
	}

	public void clickOnGotItButton() {
		waitVisibilityAndBrowserCheckClick(gotItButton, 20);
		waitForTime(1500);
	}

	public String getTicketOwnerInfo() {
		explicitWaitForVisiblity(purchaserInfoParagraph);
		String text = purchaserInfoParagraph.getText();
		return text;
	}
	
	public BigDecimal getRefundTotalAmount() {
		BigDecimal retVal = getAccessUtils().getBigDecimalMoneyAmount(refundTotal, "$","");
		return retVal;
	}

}
