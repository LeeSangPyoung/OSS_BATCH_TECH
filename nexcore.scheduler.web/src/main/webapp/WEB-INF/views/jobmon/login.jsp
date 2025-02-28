<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="euc-kr"%>
<%@ include file= "common.jsp" %>
<%@page import="nexcore.scheduler.core.VERSION"%>
<%
    String cmd      = request.getParameter("cmd");
    String userid   = nvl(request.getParameter("user_id"));
    String password = request.getParameter("user_password");
    System.out.println(888);
    System.out.println(cmd);
    if ("login".equals(cmd)) {
    	System.out.println(10);
        try {
        	
        	System.out.println(12);
            ControllerAdminLocal admin = getControllerAdmin();
            User user = admin.login(userid, password, getUserIp(request));
            if (user!=null) {
            	System.out.println(16);
                session.setAttribute("user",      user);
                session.setAttribute("loginTime", new Long(System.currentTimeMillis()));
                response.sendRedirect("/jobmon/view_jobins");
            }else {
            	System.out.println(21);
                putMsg(session, "Login Fail. ");
            }
        }catch(Exception e) {
            putMsg(session, e.getMessage());
        }
    }else if ("logout".equals(cmd)) {
        String ltime1 = request.getParameter("login_time");
        String ltime2 = String.valueOf(session.getAttribute("loginTime"));
        if (Util.equalsIgnoreNull(ltime1, ltime2)) { // 濡�洹몄�명�� 洹� �щ���� 留���吏� 理������� 寃�利�.
            session.removeAttribute("user");
            session.removeAttribute("loginTime");
        }
        response.sendRedirect("/jobmon/view_jobins");
    }
%>
<html>

<head>
<title>[<%=getServerName()%>]<%=Label.get("common.title")%> <%=Label.get("common.login")%></title>
<jsp:include page="display_msg.jsp" flush="true"/>

<script src="./script/app/include-lib.js"></script>
<script type="text/javascript" language="javascript">

function doPreSubmit(arg) {
	if(arg == "13") {
		doSubmit();
	}
}

function doSubmit() {
	//珥�湲곕��� ����
	alert(123);
	$a.session('menu_no1', 1); //leftmenu open 
	$a.session('menu_no2', 7); //leftmenu close
	
	//醫�痢〓��� �쇱묠����濡� �명��
	$a.session('menu_open', true);
	
	// `cmd` 媛� ����
	let cmdInput = document.querySelector("input[name='cmd']");
	console.log("cmd 媛� ����:", cmdInput ? cmdInput.value : "cmd input ����");
	alert(cmdInput.value);

	
	document.MyForm.action = "/login";
	
	alert(123);
	document.MyForm.submit();
}

function doCancel() {
	document.MyForm.reset();
}

function doLoad() {
	displayMsg();
	document.MyForm.user_id.focus();
	$("body").addClass('login-bg');//body�� 吏��� class瑜� ���⑺��嫄곕�� style�� 遺��ы��硫� ���⑸��吏� ����, �ㅼ��怨� 媛��� 泥�由ы��. 
}


</script>
</head>

<body onLoad="javascript:doLoad()">
<form name="MyForm" method="post">
<input type="hidden" name="cmd" value="login">
	<div class="login-header">
<%-- 		<h1><img src="./styles/images/nexcore-logo.png" alt="NEXCORE" /></h1>  --%>
	</div>
	<div class="login-wrap">
		<div class="login-title"> 
			<h2 class="Color-white">OSS <br>Batch Scheduler</h2>
		</div>
		<div class="login">
			<p class="login-domain"><%=Label.get("common.server")%> : <%=getServerName()%>(<%=getHostName()%>)</p>
			<ul class="login-list">
				<li><label><%=Label.get("user.id")%></label><input type="text" name="user_id" class="Textinput njf-login__id" placeholder="<%=Label.get("user.id")%>"></li>
				<li><label><%=Label.get("user.name")%></label><input type="password" name="user_password" class="Textinput njf-login__pw"  placeholder="<%=Label.get("user.password")%>"></li>
 			</ul>
 			<button class="njf-login__btn" onClick="javascript:doSubmit();return false;" onMouseOver="this.style.cursor='pointer'"><%=Label.get("common.login")%></button>
		</div>
		<div class="login-footer">
			Copyright &copy; <%=nexcore.scheduler.core.VERSION.getBuildYear()%> SK Holdings Co., Ltd. All rights reserved.
		</div>
	</div>
</form>
</body>
</html>