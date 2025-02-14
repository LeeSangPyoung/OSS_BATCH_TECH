package nexcore.scheduler.ioc;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * <ul>
 * <li>업무 그룹명 : nexcore-scheduler-4</li>
 * <li>서브 업무명 : nexcore.scheduler.ioc</li>
 * <li>설  명 : Spring bean container 시작점</li>
 * <li>작성일 : 2016. 1. 12.</li>
 * <li>작성자 : 정호철</li>
 * </ul>
 */
@Component
public class BeanRegistry {
    protected static ClassPathXmlApplicationContext appContext;

    public static void init(String configFile) {
        init(new String[]{configFile});
    }

    public static void init(String[] configFiles) {
    	System.out.println("Bean init!");
        if (configFiles == null || configFiles.length == 0) {
            throw new IllegalArgumentException("Config file(s) must be provided!");
        }

        try {
            System.out.println("🔹 BeanRegistry 초기화 시작...");
            
            // Spring Context 초기화
            appContext = new ClassPathXmlApplicationContext(configFiles);
            
            System.out.println("✅ BeanRegistry 초기화 성공!");
            
            // 등록된 Bean 목록 출력
            System.out.println("🔹 등록된 Bean 목록: " + Arrays.toString(appContext.getBeanDefinitionNames()));

        } catch (Exception e) {
            System.err.println("❌ BeanRegistry 초기화 실패: " + e.getMessage());
            throw new RuntimeException("BeanRegistry 초기화 중 오류 발생!", e);
        }
    }

    /**
     * Spring Context 종료 (자원 해제)
     */
    public static void destroy() {
        if (appContext != null) {
            System.out.println("🔹 BeanRegistry 종료...");
            appContext.close();
            appContext = null;
        }
    }

    /**
     * Bean 조회 메서드
     * 
     * @param componentId 조회할 Bean의 ID
     * @return 등록된 Bean 객체 (없으면 null)
     */
    public static Object lookup(String componentId) {
        if (appContext == null) {
            throw new IllegalStateException("BeanRegistry is not initialized! Call init() first.");
        }

        if (!appContext.containsBean(componentId)) {
            System.err.println("❌ Bean 조회 실패: '" + componentId + "' Bean이 존재하지 않습니다.");
            return null;
        }

        System.out.println("✅ Bean 조회 성공: '" + componentId + "' → " + appContext.getBean(componentId).getClass().getName());
        return appContext.getBean(componentId);
    }

    public static ApplicationContext getApplicationContext() {
        return appContext;
    }
}
