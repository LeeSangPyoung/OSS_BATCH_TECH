package skcc.oss.batch.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.servlet.http.HttpSession;

@Controller
public class JspController {

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("message", "JSP with Spring Boot");
        return "index";  // index.jsp 매핑
    }

    @GetMapping("/jobmon/index")
    public String viewIndex(Model model) {
        model.addAttribute("message", "This is /jobmon/index.jsp");
        return "/jobmon/index";  // view_jobins.jsp 매핑
    }
    
    @GetMapping("/jobmon/view_jobins")
    public String viewJobIns(Model model) {
    	System.out.println("17171717");
        model.addAttribute("message", "This is /jobmon/view_jobins.jsp");
        return "/jobmon/view_jobins";  // view_jobins.jsp 매핑
    }
    
    @GetMapping("/jobmon/view_jobins.jsp")
    public String JspviewJobIns(Model model) {
    	System.out.println("35353535");
        model.addAttribute("message", "This is /jobmon/view_jobins.jsp");
        return "/jobmon/view_jobins";  // view_jobins.jsp 매핑
    }
    @GetMapping("/jobmon/view_jobdef")
    public String JspviewJobdef(Model model) {
        model.addAttribute("message", "This is /jobmon/view_jobdef.jsp");
        return "/jobmon/view_jobdef";  // view_jobins.jsp 매핑
    }

    
    @GetMapping("/jobmon/svc_jobins_xml")
    public String JspSvcJobinsXml(Model model) {
        System.out.println("1818181818");  // 로그 확인용
        model.addAttribute("message", "This is /jobmon/svc_jobins_xml.jsp");
        return "jobmon/svc_jobins_xml";  // "/WEB-INF/views/jobmon/svc_jobins_xml.jsp"로 연결됨
    }
    
    
    @GetMapping("/jobmon/view_jobdef_table")
    public String JspViewJobDefTable(Model model) {
        System.out.println("1818181818");  // 로그 확인용
        model.addAttribute("message", "This is /jobmon/svc_jobins_xml.jsp");
        return "jobmon/view_jobdef_table";  // "/WEB-INF/views/jobmon/svc_jobins_xml.jsp"로 연결됨
    }
    
    @GetMapping("/jobmon/common_query_jobdef")
    public String CommonQueryJobdef(Model model) {
        System.out.println("1818181818");  // 로그 확인용
        model.addAttribute("message", "This is /jobmon/common_query_jobdef.jsp");
        return "jobmon/common_query_jobdef";  // "/WEB-INF/views/jobmon/svc_jobins_xml.jsp"로 연결됨
    }

    
    @GetMapping("/jobmon/login")
    public String viewLogin(Model model) {
        model.addAttribute("message", "This is /jobmon/login.jsp");
        return "/jobmon/login";  // view_jobins.jsp 매핑
    }
    @GetMapping("/jobmon/form_jobdef")
    public String FormJobDef(Model model) {
        model.addAttribute("message", "This is /jobmon/form_jobdef.jsp");
        return "/jobmon/form_jobdef";  // view_jobins.jsp 매핑
    }
    @GetMapping("/jobmon/popup_jobgroup")
    public String popupJobgroup(Model model) {
        model.addAttribute("message", "This is /jobmon/popup_jobgroup.jsp");
        return "/jobmon/popup_jobgroup";  // view_jobins.jsp 매핑
    } 
    @GetMapping("/jobmon/view_server")
    public String viewServer(Model model) {
        model.addAttribute("message", "This is /jobmon/view_server.jsp");
        return "jobmon/view_server";  // view_jobins.jsp 매핑
    } 
    
    @GetMapping("/jobmon/form_server")
    public String formServer(Model model) {
        model.addAttribute("message", "This is /jobmon/form_server.jsp");
        return "/jobmon/form_server";  // view_jobins.jsp 매핑
    } 
    
    @GetMapping("/jobmon/action_server")
    public String actionServer(Model model) {
        model.addAttribute("message", "This is /jobmon/action_server.jsp");
        return "/jobmon/action_server";  // view_jobins.jsp 매핑
    } 
    
    
    @PostMapping("/jobmon/action_server")
    public String postactionServer(Model model) {
        model.addAttribute("message", "This is /jobmon/action_server.jsp");
        return "/jobmon/action_server";  // view_jobins.jsp 매핑
    } 
     
    @GetMapping("/jobmon/view_jobgroupmon")
    public String viewJobGroupMon(Model model) {
        model.addAttribute("message", "This is /jobmon/view_jobgroupmon.jsp");
        return "/jobmon/view_jobgroupmon";  // view_jobins.jsp 매핑
    } 
    
    @GetMapping("/jobmon/common_query_jobgroupmon")
    public String commonQueryJobGroupMon(Model model) {
        model.addAttribute("message", "This is /jobmon/common_query_jobgroupmon.jsp");
        return "/jobmon/common_query_jobgroupmon";  // view_jobins.jsp 매핑
    } 
    @GetMapping("/jobmon/view_setting")
    public String viewSetting(Model model) {
        model.addAttribute("message", "This is /jobmon/view_setting.jsp");
        return "/jobmon/view_setting";  // view_jobins.jsp 매핑
    } 
    @PostMapping("/jobmon/view_setting")
    public String postViewSetting(Model model) {
        model.addAttribute("message", "This is /jobmon/view_setting.jsp");
        return "/jobmon/view_setting";  // view_jobins.jsp 매핑
    } 
    @GetMapping("/jobmon/view_setting_jobgroup")
    public String viewSettingJobGroup(Model model) {
        model.addAttribute("message", "This is /jobmon/view_setting_jobgroup.jsp");
        return "/jobmon/view_setting_jobgroup";  // view_jobins.jsp 매핑
    } 
    @GetMapping("/jobmon/form_setting_jobgroup")
    public String formSettingJobGroup(Model model) {
        model.addAttribute("message", "This is /jobmon/form_setting_jobgroup.jsp");
        return "/jobmon/form_setting_jobgroup";  // view_jobins.jsp 매핑
    } 
    
    @GetMapping("/jobmon/action_setting")
    public String actionSetting(Model model) {
        model.addAttribute("message", "This is /jobmon/action_setting.jsp");
        return "/jobmon/action_setting";  // view_jobins.jsp 매핑
    } 
    @PostMapping("/jobmon/action_setting")
    public String postActionSetting(Model model) {
        model.addAttribute("message", "This is /jobmon/action_setting.jsp");
        return "/jobmon/action_setting";  // view_jobins.jsp 매핑
    } 
    
    @GetMapping("/jobmon/view_setting_user")
    public String viewSettingUser(Model model) {
        model.addAttribute("message", "This is /jobmon/view_setting_user.jsp");
        return "/jobmon/view_setting_user";  // view_jobins.jsp 매핑
    } 
    
    @GetMapping("/jobmon/form_setting_user")
    public String formSettingUser(Model model) {
        model.addAttribute("message", "This is /jobmon/form_setting_user.jsp");
        return "/jobmon/form_setting_user";  // view_jobins.jsp 매핑
    } 
    
    @GetMapping("/jobmon/action_user")
    public String actionUser(Model model) {
        model.addAttribute("message", "This is /jobmon/action_user.jsp");
        return "/jobmon/action_user";  // view_jobins.jsp 매핑
    } 
    
    @PostMapping("/jobmon/action_user")
    public String postActionUser(Model model) {
        model.addAttribute("message", "This is /jobmon/action_user.jsp");
        return "/jobmon/action_user";  // view_jobins.jsp 매핑
    } 
    
    @GetMapping("/jobmon/view_setting_sysmon")
    public String viewSettingSysMon(Model model) {
        model.addAttribute("message", "This is /jobmon/view_setting_sysmon.jsp");
        return "/jobmon/view_setting_sysmon";  // view_jobins.jsp 매핑
    } 
    
    @GetMapping("/jobmon/view_setting_gparam")
    public String viewSettingGParam(Model model) {
        model.addAttribute("message", "This is /jobmon/view_setting_gparam.jsp");
        return "/jobmon/view_setting_gparam";  // view_jobins.jsp 매핑
    } 
    
    /*** 🔥 여기에 추가: `POST /jobmon/login` 요청을 처리하는 메서드 ***/
    @PostMapping("/login")
    public String handleLogin(
            @RequestParam("user_id") String userId,
            @RequestParam("user_password") String password,
            HttpSession session,
            Model model) {
        
        // ⚠️ 여기에 실제 로그인 로직 추가 필요 (임시 처리)
        if ("admin".equals(userId) && "1234".equals(password)) {
            session.setAttribute("user", userId);
            return "redirect:/jobmon/view_jobins"; // 로그인 성공 시 이동할 페이지
        } else {
            model.addAttribute("error", "로그인 실패: 아이디 또는 비밀번호가 틀립니다.");
            return "/jobmon/login"; // 로그인 실패 시 다시 로그인 페이지로
        }
    }
}