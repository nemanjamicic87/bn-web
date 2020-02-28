package pages.admin.venue;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import pages.AbstractBase;
import utils.ProjectUtils;

public class ValidationVenueFields extends AbstractBase{

	@FindBy(xpath = "//p[@id='name-error-text' and contains(text(), 'Missing name')]")
	private WebElement venueNameErrorText;
	@FindBy(xpath = "//p[@id='organization-error-text' and contains(text(), 'Select an organization')]")
	private WebElement organizationErrorText;
	@FindBy(id = "timezone-error-text")
	private WebElement timezoneErrorText;
	@FindBy(xpath = "//p[@id='address-error-text' and contains(text(), 'Missing address')]")
	private WebElement addressErrorText;
	@FindBy(xpath = "//p[@id='city-error-text' and contains(text(), 'Missing city')]")
	private WebElement cityErrorText;
	@FindBy(xpath = "//p[@id='postal_code-error-text' and contains(text(), 'Missing postal_code')]")
	private WebElement zipErrorText;
	@FindBy(xpath = "//p[@id='state-error-text' and contains(text(), 'Missing state')]")
	private WebElement stateErrorText;
	
	public ValidationVenueFields(WebDriver driver) {
		super(driver);
	}
	
	public int numberOfInvalidFields(boolean createVenue) {
		int count = 0;
		for(WebElement el : getAllElements(createVenue)) {
			if(isElementVisible(el)) {
				count++;
			}
		}
		return count;
	}
	
	
	public List<WebElement> getAllElements(boolean createVenue){
		List<WebElement> elements = new ArrayList<>();
		elements.add(venueNameErrorText);
		if (createVenue) {
			elements.add(organizationErrorText);
		}
		elements.add(timezoneErrorText);
		elements.add(addressErrorText);
		elements.add(cityErrorText);
		if (createVenue) {
			elements.add(stateErrorText);
		}
		elements.add(zipErrorText);
		return elements;
	}
	
	public boolean isElementVisible(WebElement element) {
		if (isExplicitlyWaitVisible(2, element)) {
			getAccessUtils().refreshElement(element);
			String color = element.getCssValue("color");
			if (color.equals(ProjectUtils.CSS_REQUIRED_FIELD_COLOR) ||
					color.equals(ProjectUtils.CSS_REQUIRED_FIELD_COLOR_RGBA)) {
				return true;
			}
		}
		return false;
	}

}