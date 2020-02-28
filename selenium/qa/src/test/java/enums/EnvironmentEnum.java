package enums;

public enum EnvironmentEnum {
	
	DEVELOP("develop","develop_",true),
	BETA("beta","beta_",true),
	LOCAL("local","local_",false);
	
	private String value;
	private String dataFilePrefix;
	private boolean serverAuth;
	
	private EnvironmentEnum(String value, String dataFilePrefix, boolean serverAuth) {
		this.value = value;
		this.dataFilePrefix = dataFilePrefix;
		this.serverAuth = serverAuth;
	}

	public String getValue() {
		return value;
	}

	public String getDataFilePrefix() {
		return dataFilePrefix;
	}
	
	public boolean getServerAuth() {
		return this.serverAuth;
	}
	
	public static EnvironmentEnum getEnvironmentEnum(String value) {
		for(EnvironmentEnum env : values()) {
			if (value.contains(env.getValue())) {
				return env;
			}
		}
		return DEVELOP;
	}

}