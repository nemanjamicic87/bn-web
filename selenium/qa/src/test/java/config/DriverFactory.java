package config;

import enums.EnvironmentEnum;

public class DriverFactory {

    public static DriverManager getDriverManager(String config, String environment) {

        DriverManager manager = null;
        try {
     		String browser = System.getProperty("browser");
            BrowsersEnum browserEnum = BrowsersEnum.getEnumForCode(browser);

            switch (browserEnum) {
                case FIREFOX:
                    System.out.println("Firefox local");
                    manager = new FirefoxDriverManager();
                    break;
                case CHROME:
                    System.out.println("Chrome local");
                    manager = new ChromeDriverManager();
                    break;
                case SAFARI:
                    System.out.println("Safari local");
                    manager = new SafariDriverManager();
                    break;
                case REMOTE:
                    System.out.println("Remoting");
                    String username = System.getProperty("username");
                    String accessKey = System.getProperty("key");
                    String URL = "https://" + username + ":" + accessKey + "@hub-cloud.browserstack.com/wd/hub";
                    manager = new RemoteDriverManager(URL, config, environment);
                    break;
                case HUB:
                    String huburl = System.getProperty("huburl");
					System.out.println("Remote hub: " + huburl);
                    String configFileName = System.getProperty("config");
                    manager = new HubRemoteDriverManager(huburl, configFileName, environment);
                    break;
                default:
                    System.out.println("Local default");
                    manager = new FirefoxDriverManager();
                    break;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return manager;
    }

    public static String getUsername() {
        return System.getProperty("username");
    }

    public static String getAccessKey() {
        return System.getProperty("key");
    }

	public static EnvironmentEnum getEnvironmentEnum() {
		String environment = System.getProperty("baseurl");
		return EnvironmentEnum.getEnvironmentEnum(environment);
	}

	public static BrowsersEnum getBrowser() {
		String code = System.getProperty("browser");
		return BrowsersEnum.getEnumForCode(code);
	}
}
