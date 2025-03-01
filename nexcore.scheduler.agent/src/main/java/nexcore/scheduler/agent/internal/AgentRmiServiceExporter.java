package nexcore.scheduler.agent.internal;

import java.net.ServerSocket;

import nexcore.scheduler.exception.AgentException;
import nexcore.scheduler.util.Util;

import org.springframework.web.bind.annotation.*;
import nexcore.scheduler.entity.IAgentService;
@RestController
@RequestMapping("/agent/rmi")
public class AgentRmiServiceExporter {

    private int rmiPort;
    private boolean enable = true;
    private boolean checkPortDup = false;
    private String serviceName;
    private IAgentService service;

    public void setService(IAgentService service) {
        this.service = service;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    @PostMapping("/init")
    public void init() {
        Util.logServerInitConsole("RMI", "Agent RMI Service Initialized");
    }

    @DeleteMapping("/destroy")
    public void destroy() {
        if (enable) {
            Util.logServerInitConsole("RMI", "Agent RMI Service Destroyed");
        }
    }

    @GetMapping("/status")
    public String status() {
        return enable ? "RMI Service Enabled" : "RMI Service Disabled";
    }

    @PostMapping("/enable/{flag}")
    public void setEnable(@PathVariable boolean flag) {
        this.enable = flag;
        Util.logServerInitConsole("RMI", "Service enable set to: " + flag);
    }

    @GetMapping("/check-port-dup")
    public boolean isCheckPortDup() {
        return checkPortDup;
    }

    @PostMapping("/check-port-dup/{flag}")
    public void setCheckPortDup(@PathVariable boolean flag) {
        this.checkPortDup = flag;
        Util.logServerInitConsole("RMI", "Check Port Duplication set to: " + flag);
    }

    @PostMapping("/set-registry-port/{port}")
    public void setRegistryPort(@PathVariable int port) {
        this.rmiPort = port;
        Util.logServerInitConsole("RMI", "Registry Port Set: " + port);
    }

    @PostMapping("/start")
    public void afterPropertiesSet() {
        if (enable) {
            try {
                if (checkPortDup) {
                    try (ServerSocket ss = new ServerSocket(this.rmiPort)) {
                        // 포트 사용 가능
                    } catch (Exception e) {
                        throw new AgentException("agent.server.port.error", e);
                    }
                }
                Util.logServerInitConsole("RMI", "(Registry Port: " + rmiPort + ")");

                // 환경 변수 설정
                try {
                    System.setProperty("NC_BATAGENT_RMI_PORT", String.valueOf(rmiPort));
                } catch (Exception e) {
                    System.out.println("System.setProperty(\"NC_BATAGENT_RMI_PORT\", \"" + rmiPort + "\") fail.");
                }

            } catch (Exception e) {
                e.printStackTrace();
                System.exit(1);
            }
        }
    }
}
