package pages.admin.orders.manage;

import java.util.List;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import model.User;
import pages.BasePage;
import pages.components.admin.orders.manage.ManageOrderRow;
import pages.components.admin.orders.manage.OrderListContainer;
import pages.components.admin.orders.manage.OrderManageSearchHeader;
import utils.Constants;
import utils.SeleniumUtils;

public class OrdersManageAdminPage extends BasePage {

	private OrderManageSearchHeader searchHeader;

	private OrderListContainer listContainer;

	public OrdersManageAdminPage(WebDriver driver) {
		super(driver);
	}

	@Override
	public void presetUrl() {
	}

	@Override
	public boolean isAtPage() {
		return explicitWait(15,
				ExpectedConditions.urlMatches(Constants.getAdminEvents() + "/*.*/dashboard/orders/manage"));
	}

	public OrderManageSearchHeader getSearchHeader() {
		if (searchHeader == null) {
			searchHeader = new OrderManageSearchHeader(driver);
		}
		return searchHeader;
	}

	public OrderListContainer getListContainer() {
		if (listContainer == null) {
			listContainer = new OrderListContainer(driver);
		}
		waitForTime(1000);
		return listContainer;
	}

	public ManageOrderRow findOrderRowWithUserName(String name) {
		return getListContainer().findOrderWithCustomerName(name);
	}
	
	public ManageOrderRow findRowWithOrderId(String orderId) {
		List<WebElement> ordersEl =  getListContainer().findOrdersWithOrderNumber(orderId);
		List<ManageOrderRow> rows = ordersEl.stream().map(el->new ManageOrderRow(driver, el)).collect(Collectors.toList());
		return rows != null ? rows.get(0) : null;
	}
	
	
	public List<ManageOrderRow> findOrderRows(Predicate<ManageOrderRow> predicate){
		List<WebElement> ordersEl = getListContainer().findAllOrdersElements();
		if(ordersEl != null) {
			List<ManageOrderRow> rows = ordersEl.stream().map(el -> new ManageOrderRow(driver, el)).filter(predicate).collect(Collectors.toList());
			return rows;
		}
		return null;
	}

	public boolean seachCheckByEmail(User user) {
		Integer beforeSearch = getNumberOfAllVisibleOrders();
		enterValueInSearchHeaderAndRefeshList(user.getEmailAddress());
		waitForTime(3000);
		Integer allAfterSearch =  listContainer.findOrdersWithUserName(user.getFirstName() + " " + user.getLastName()).size();
		return allAfterSearch.compareTo(beforeSearch) < 0;
	}

	public boolean searchCheck(String param, Function<String, Integer> fn) {
		
		enterValueInSearchHeaderAndRefeshList(param);
		waitForTime(3000);
		Integer allAfterSearch = getNumberOfAllVisibleOrders();
		Integer allWithParam = fn.apply(param);
		return !allAfterSearch.equals(0) && allAfterSearch.equals(allWithParam);
	}

	public ManageOrderRow getFirstRow() {
		return getListContainer().findFirstRow();
	}

	public Integer getNumberOfAllVisibleOrders() {
		return getListContainer().findAllOrdersElements().size();
	}

	public Integer getNumberOfAllVisibleOrdersWithName(String name) {
		return getListContainer().findOrdersWithUserName(name).size();
	}

	public Integer getNumberOfAllVisibleOrdersWithOrderNumber(String orderNumber) {
		return getListContainer().findOrdersWithOrderNumber(orderNumber).size();
	}
	
	public void clearSearchFilter() {
		getSearchHeader().enterSearchValue("");
		SeleniumUtils.refreshElement(getListContainer().getContainer(), driver);
		waitForTime(3000);
	}

	private void enterValueInSearchHeaderAndRefeshList(String value) {
		getSearchHeader().enterSearchValue(value);
		SeleniumUtils.refreshElement(getListContainer().getContainer(), driver);
	}

}
