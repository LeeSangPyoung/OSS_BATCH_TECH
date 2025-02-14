package skcc.oss.batch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.stereotype.Controller;

import nexcore.scheduler.ioc.BeanRegistry;

@SpringBootApplication
@ComponentScan(basePackages = {"skcc.oss.batch", "nexcore.scheduler"})
@Controller
public class BatchApplication {
    public static void main(String[] args) {
        System.out.println("✅ A + B 프로젝트 실행 시작");

     // 기존 StarterMain의 초기화 코드 반영

        
        // A 프로젝트 실행 (B 프로젝트가 포함됨)
        SpringApplication.run(BatchApplication.class, args);
    }
}

