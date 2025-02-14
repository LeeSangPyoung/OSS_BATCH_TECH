package nexcore.scheduler.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.beans.factory.annotation.Value;
import org.apache.commons.dbcp2.BasicDataSource; // ✅ PostgreSQL 커넥션 풀 설정

import javax.sql.DataSource;

@Configuration
@PropertySource("classpath:nexcore-scheduler-server.properties") // 기존 설정 파일 로드
public class PropertyConfig {

    @Value("${db.driverClassName}")
    private String driverClassName;

    @Value("${db.url}")
    private String dbUrl;

    @Value("${db.username}")
    private String dbUsername;

    @Value("${db.password}")
    private String dbPassword;

    @Bean
    public DataSource dataSource() {
        BasicDataSource dataSource = new BasicDataSource();
        dataSource.setDriverClassName(driverClassName);
        dataSource.setUrl(dbUrl);
        dataSource.setUsername(dbUsername);
        dataSource.setPassword(dbPassword);
        dataSource.setMaxTotal(10); // 커넥션 풀 최대 개수
        dataSource.setMaxIdle(5);   // 유휴 커넥션 개수
        return dataSource;
    }
}
