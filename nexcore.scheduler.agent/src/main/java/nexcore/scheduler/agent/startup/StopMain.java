package nexcore.scheduler.agent.startup;

import java.net.InetAddress;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import nexcore.framework.supports.EncryptionUtils;
import nexcore.scheduler.entity.AdminAuth;
import nexcore.scheduler.util.Util;

/**
 * <ul>
 * <li>업무 그룹명 : 금융 프레임워크 </li>
 * <li>서브 업무명 : 배치 코어</li>
 * <li>설  명 : Non-WAS 배치 Agent 를 shutdown 시키는 메인 메소드</li>
 * <li>작성일 : 2010. 10. 27.</li>
 * <li>작성자 : 정호철</li>
 * </ul>
 */
public class StopMain {

    public static void main(String[] args) throws Exception {
        if (args.length < 4) {
            System.out.println("Usage: StopMain [ip] [port] [admin id] [admin password]");
            return;
        }

        String serverUrl = "http://" + args[0] + ":" + args[1] + "/agent/shutdown";
        
        // 비밀번호 복호화
        String encPassword = args[3];
        String decPassword = encPassword;
        if (!Util.isBlank(encPassword)) {
            decPassword = EncryptionUtils.decode(encPassword);
        }

        // AdminAuth 객체 생성
        AdminAuth adminAuth = new AdminAuth(args[2], InetAddress.getLocalHost().getHostAddress(), decPassword);

        // REST 요청을 위한 RestTemplate 설정
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<AdminAuth> request = new HttpEntity<>(adminAuth, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(serverUrl, request, String.class);
            System.out.println("Shutdown Response: " + response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
