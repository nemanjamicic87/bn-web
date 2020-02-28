package test.facade.reports;

import java.time.ZoneId;
import java.util.List;
import java.util.Map;

import org.openqa.selenium.WebDriver;
import org.testng.Assert;
import org.testng.asserts.SoftAssert;

import data.holders.DataHolder;
import data.holders.reports.boxoffice.OperatorTableData;
import data.holders.reports.boxoffice.OperatorTableRowData;
import data.holders.reports.boxoffice.ReportsBoxOfficePageData;
import model.Event;
import model.Purchase;
import pages.admin.reports.ReportsBoxOfficeSalesPage;
import pages.admin.reports.ReportsMainPage;
import test.facade.BaseFacadeSteps;
import utils.DateRange;
import utils.ProjectUtils;

public class ReportsBoxOfficeFacade extends BaseFacadeSteps {

	private ReportsMainPage reportsMainPage;
	private ReportsBoxOfficeSalesPage reportsBoxOfficePage;

	public ReportsBoxOfficeFacade(WebDriver driver) {
		super(driver);
	}

	public ReportsMainPage getReportsMainPage() {
		return this.reportsMainPage != null ? this.reportsMainPage
				: (this.reportsMainPage = new ReportsMainPage(driver));
	}

	public ReportsBoxOfficeSalesPage getReportsBoxOfficePage() {
		return this.reportsBoxOfficePage != null ? this.reportsBoxOfficePage
				: (this.reportsBoxOfficePage = new ReportsBoxOfficeSalesPage(driver));
	}

	public void enterDates() {
		String[] dates = ProjectUtils.getDatesWithSpecifiedRangeInDaysWithStartOffset(-1, 1);
		enterDates(dates[1], dates[1]);
	}

	public void enterDates(DateRange range) {
		String fromDate = ProjectUtils.formatDate(ProjectUtils.DATE_FORMAT, range.getStartDate());
		String toDate = ProjectUtils.formatDate(ProjectUtils.DATE_FORMAT, range.getEndDate());
		enterDates(fromDate, toDate);
	}

	public void enterDates(String from, String to) {
		getReportsBoxOfficePage().enterDateRanges(from, to);
		Assert.assertTrue(getReportsBoxOfficePage().checkIfDatesAreCorrect(from, to), "Dates do not match");
	}

	public boolean whenUserSearchesForEventInBoxOfficeReport(Event event) {
		return getReportsBoxOfficePage().isEventInOperatorBoxOfficeSales(event.getEventName());
	}

	public boolean whenUserChecksIfPurchaseEventsAreInReport(List<Purchase> boxOfficePurchases, DataHolder holder) {
		ReportsBoxOfficePageData dataHolder = ((ReportsBoxOfficePageData) holder);
		Map<String, OperatorTableRowData> rowData = dataHolder.getRows();
		for (Purchase purchase : boxOfficePurchases) {
			OperatorTableRowData data = rowData.get(purchase.getEvent().getEventName());
			if (data == null) {
				return false;
			}
		}
		return true;
	}

	public void thenThereShouldBeMultipeTablesWithCorrectOrder(DataHolder dataHolder) {
		List<OperatorTableData> tableDates = ((ReportsBoxOfficePageData)dataHolder).getTables();
		SoftAssert sa = new SoftAssert();
		if(tableDates.size() > 1) {
			boolean isOrderdByOperatorName = isOrderdByOperatorNameAlphabetically(tableDates);
			sa.assertTrue(isOrderdByOperatorName, "Operator tables not ordered by operator name");
			boolean isDataInTablesOrdered = isDataInTablesOrdered(tableDates);
			sa.assertTrue(isDataInTablesOrdered, "Rows in table(s) not orderd by date and event name");
		} else {
			sa.fail("Number of tables is not greater than one");
		}
		sa.assertAll();
	}
	
	public boolean isZoneInRowsEqual(ZoneId ordZoneId) {
		ReportsBoxOfficePageData dataHolder = (ReportsBoxOfficePageData) getPageDataHolder();
		return dataHolder.isZoneEqualTo(ordZoneId);
	}

	private boolean isDataInTablesOrdered(List<OperatorTableData> tables) {
		for(OperatorTableData table : tables) {
			boolean isOrdered = ProjectUtils.isListOrdered(table.getRows());
			if (!isOrdered) {
				return false;
			}
		}
		return true;
	}

	private boolean isOrderdByOperatorNameAlphabetically(List<OperatorTableData> tables) {
		return ProjectUtils.isListOrdered(tables);
	}

	public DataHolder getPageDataHolder() {
		return getReportsBoxOfficePage().getDataHolder();
	}

	@Override
	protected void setData(String key, Object value) {
	}

	@Override
	protected Object getData(String key) {
		return null;
	}
}