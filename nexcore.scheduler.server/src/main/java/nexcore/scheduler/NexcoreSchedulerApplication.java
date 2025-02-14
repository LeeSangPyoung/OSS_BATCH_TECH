package nexcore.scheduler;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import nexcore.scheduler.ioc.BeanRegistry;

@SpringBootApplication
@PropertySource("classpath:nexcore-scheduler-server.properties")  // 프로퍼티 파일 로드
@ComponentScan(basePackages = {"nexcore.scheduler"})
public class NexcoreSchedulerApplication {
    public static void main(String[] args) {
        System.out.println("🔹 Nexcore Scheduler Application Starting...");

        // Spring Application 실행
        SpringApplication.run(NexcoreSchedulerApplication.class, args);

        System.out.println("✅ Nexcore Scheduler Backend Started...");
    }
}

@Component
class SchedulerConfig {
    private final Environment env;

    @Value("${NEXCORE_ID:DNBS01}")  // 기본값을 DNBS01로 설정
    private String nexcoreId;

    public SchedulerConfig(Environment env) {
        this.env = env;
    }

    @PostConstruct
    public void init() {
        System.out.println("🔹 Using NEXCORE_ID: " + nexcoreId);

        // ✅ 프로퍼티에서 해당 NEXCORE_ID의 값 직접 로드
        String driverClassName = env.getProperty("scheduler.jdbc.driver." + nexcoreId);
        String jdbcUrl = env.getProperty("scheduler.jdbc.url." + nexcoreId);
        String username = env.getProperty("scheduler.jdbc.username." + nexcoreId);
        String password = env.getProperty("scheduler.jdbc.password." + nexcoreId);

        if (driverClassName == null || jdbcUrl == null) {
            throw new RuntimeException("❌ JDBC 설정을 찾을 수 없습니다. 환경 변수 확인 필요.");
        }

        System.out.println("🔹 Loaded JDBC Config for " + nexcoreId);
        System.out.println("🔹 JDBC Driver: " + driverClassName);
        System.out.println("🔹 JDBC URL: " + jdbcUrl);
        System.out.println("🔹 Username: " + username);

        // ✅ System.setProperty()에 값 설정 (DBCP가 사용할 수 있도록)
        System.setProperty("scheduler.jdbc.driver", driverClassName);
        System.setProperty("scheduler.jdbc.url", jdbcUrl);
        System.setProperty("scheduler.jdbc.username", username);
        System.setProperty("scheduler.jdbc.password", password);

        // ✅ BeanRegistry 초기화 전에 값 적용
        String[] filenamesArray = {"nexcore-scheduler-server-core.xml", "nexcore-scheduler-server.xml"};
        BeanRegistry.init(filenamesArray);
    }
}
