package nexcore.scheduler.controller.internal;

import java.sql.Connection;
import javax.sql.DataSource;

import org.apache.commons.dbcp.BasicDataSource;
import org.springframework.stereotype.Component;

@Component
public class DBChecker {
    private DataSource dataSource;

    public DBChecker() {
    }

    public void init() {
        Connection conn = null;

        try {
            // ✅ DataSource가 BasicDataSource인지 확인하고 정보 출력
            if (dataSource instanceof BasicDataSource) {
                BasicDataSource bds = (BasicDataSource) dataSource;
                System.out.println("🔹 Database Connection Info:");
                System.out.println("🔹 URL: " + bds.getUrl());
                System.out.println("🔹 Username: " + bds.getUsername());
                System.out.println("🔹 Password: " + bds.getPassword());  // 보안 이슈로 필요 시 주석 처리
            } else {
                System.out.println("❌ DataSource is not an instance of BasicDataSource");
            }

            // ✅ 실제 DB 연결 시도
            conn = dataSource.getConnection();
            System.out.println("✅ DB Connection Successful");

        } catch (Exception e) {
            System.out.println("❌ DB Connection Failed!");
            e.printStackTrace();
            System.exit(2);
        } finally {
            try {
                if (conn != null) conn.close();
            } catch (Exception ee) {
                ee.printStackTrace();
            }
        }
    }

    public void destroy() {
    }

    public DataSource getDataSource() {
        return dataSource;
    }

    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
    }
}
