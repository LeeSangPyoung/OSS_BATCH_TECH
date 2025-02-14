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
        model.addAttribute("message", "This is /jobmon/view_jobins.jsp");
        return "/jobmon/view_jobins";  // view_jobins.jsp 매핑
    }
    
    @GetMapping("/jobmon/login")
    public String viewLogin(Model model) {
        model.addAttribute("message", "This is /jobmon/login.jsp");
        return "/jobmon/login";  // view_jobins.jsp 매핑
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