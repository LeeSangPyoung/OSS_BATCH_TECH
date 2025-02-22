package nexcore.scheduler.monitor.internal;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.springframework.beans.factory.annotation.Autowired;

import nexcore.scheduler.entity.JobDefinition;
import nexcore.scheduler.entity.ViewFilter;
import nexcore.scheduler.util.DateUtil;


/**
 * <ul>
 * <li>업무 그룹명 : 금융 프레임워크 </li>
 * <li>서브 업무명 : 배치 코어</li>
 * <li>설  명 : View Filter 매니저</li>
 * <li>작성일 : 2011. 1. 5.</li>
 * <li>작성자 : 정호철</li>
 * </ul>
 */
public class ViewFilterManager {
    @Autowired
    private SqlSessionFactory sqlSessionFactory;  // ✅ Spring에서 주입

	private SqlSession sqlSession;

	
	public void init() {
	}
	
	public void destroy() {
	}
	
	public SqlSession getSqlMapClient() {
		return sqlSession;
	}

	public void setSqlMapClient(SqlSession sqlSession) {
		this.sqlSession = sqlSession;
	}
    public void setSqlSessionFactory(SqlSessionFactory sqlSessionFactory) {
        this.sqlSessionFactory = sqlSessionFactory;
        this.sqlSession = sqlSessionFactory.openSession(); // ✅ setter에서 세션 초기화
    }
//	private int insertViewFilter(ViewFilter vf) throws SQLException {
//		int cnt = sqlMapClient.update("nbs.monitor.insertViewFilter", vf);
//		return cnt;
//	}
	private int insertViewFilter(ViewFilter vf) throws SQLException {
	    try (SqlSession session = sqlSessionFactory.openSession(true)) { // 자동 커밋 모드
	        return session.insert("nbs.monitor.insertViewFilter", vf);
	    }
	}

	private int insertViewFilterJobList(ViewFilter vf) throws SQLException {
		return insertViewFilterJobList(vf.getId(), vf.getJobIdList());
	}

//	private int insertViewFilterJobList(int id, List<String> jobIdList) throws SQLException {
//		Map map = new HashMap();
//		
//		int cnt = 0;
//		sqlMapClient.startBatch();
//		for (String jobId : jobIdList) {
//			map.put("id",    id);
//			map.put("jobId", jobId);
//			cnt += sqlMapClient.update("nbs.monitor.insertViewFilterJobList", map);
//		}
//		sqlMapClient.executeBatch();
//		updateViewFilterJobCount(id);
//		return cnt;
//	}
	private int insertViewFilterJobList(int id, List<String> jobIdList) throws SQLException {
	    Map<String, Object> map = new HashMap<>();
	    int cnt = 0;

	    try (SqlSession session = sqlSessionFactory.openSession(true)) { // 자동 커밋 모드
	        for (String jobId : jobIdList) {
	            map.put("id", id);
	            map.put("jobId", jobId);
	            cnt += session.update("nbs.monitor.insertViewFilterJobList", map);
	        }
	    }
	    
	    updateViewFilterJobCount(id);
	    return cnt;
	}

	
//	private ViewFilter selectViewFilter(int id) throws SQLException {
//		return (ViewFilter)sqlMapClient.queryForObject("nbs.monitor.selectViewFilter", id);
//	}
//
//	private List<ViewFilter> selectViewFilterByQuery(String query, String orderBy) throws SQLException {
//		Map param = new HashMap();
//		param.put("queryCondition", query);
//		param.put("orderBy",        orderBy);
//		return sqlMapClient.queryForList("nbs.monitor.selectViewFilterByQuery", param);
//	}
//
//	private List<String> selectViewFilterJobList(int id) throws SQLException {
//		return (List<String>)sqlMapClient.queryForList("nbs.monitor.selectViewFilterJobList", id);
//	}
//	
//	private List<JobDefinition> selectJobDefListByViewFilter(int id) throws SQLException {
//		return (List<JobDefinition>)sqlMapClient.queryForList("nbs.monitor.selectJobDefListByViewFilter", id);
//	}
//
//	private int updateViewFilter(ViewFilter vf) throws SQLException {
//		return sqlMapClient.update("nbs.monitor.updateViewFilter", vf);
//	}
//	
//	private int updateViewFilterJobCount(int id) throws SQLException {
//		Map m = new HashMap();
//		m.put("id", id);
//		m.put("lastModifyTime", DateUtil.getCurrentTimestampString());
//		return sqlMapClient.update("nbs.monitor.updateViewFilterJobCount", m);
//	}
//
//	private int deleteViewFilter(int id) throws SQLException {
//		return sqlMapClient.delete("nbs.monitor.deleteViewFilter", id);
//	}
//
//	private int deleteViewFilterJobList(int id) throws SQLException {
//		Map map = new HashMap();
//		map.put("id", id);
//		int cnt = sqlMapClient.delete("nbs.monitor.deleteViewFilterJobList", map);
//		return cnt;
//	}
	private ViewFilter selectViewFilter(int id) throws SQLException {
	    try (SqlSession session = sqlSessionFactory.openSession()) { // 자동 커밋 모드
	        return session.selectOne("nbs.monitor.selectViewFilter", id);
	    }
	}

	private List<ViewFilter> selectViewFilterByQuery(String query, String orderBy) throws SQLException {
	    Map<String, String> param = new HashMap<>();
	    param.put("queryCondition", query);
	    param.put("orderBy", orderBy);

	    try (SqlSession session = sqlSessionFactory.openSession()) { // 자동 커밋 모드
	        return session.selectList("nbs.monitor.selectViewFilterByQuery", param);
	    }
	}

	private List<String> selectViewFilterJobList(int id) throws SQLException {
	    try (SqlSession session = sqlSessionFactory.openSession()) { // 자동 커밋 모드
	        return session.selectList("nbs.monitor.selectViewFilterJobList", id);
	    }
	}

	private List<JobDefinition> selectJobDefListByViewFilter(int id) throws SQLException {
	    try (SqlSession session = sqlSessionFactory.openSession()) { // 자동 커밋 모드
	        return session.selectList("nbs.monitor.selectJobDefListByViewFilter", id);
	    }
	}

	private int updateViewFilter(ViewFilter vf) throws SQLException {
	    try (SqlSession session = sqlSessionFactory.openSession(true)) { // 자동 커밋 모드
	        return session.update("nbs.monitor.updateViewFilter", vf);
	    }
	}

	private int updateViewFilterJobCount(int id) throws SQLException {
	    Map<String, Object> m = new HashMap<>();
	    m.put("id", id);
	    m.put("lastModifyTime", DateUtil.getCurrentTimestampString());

	    try (SqlSession session = sqlSessionFactory.openSession(true)) { // 자동 커밋 모드
	        return session.update("nbs.monitor.updateViewFilterJobCount", m);
	    }
	}

	private int deleteViewFilter(int id) throws SQLException {
	    try (SqlSession session = sqlSessionFactory.openSession(true)) { // 자동 커밋 모드
	        return session.delete("nbs.monitor.deleteViewFilter", id);
	    }
	}

	private int deleteViewFilterJobList(int id) throws SQLException {
	    Map<String, Integer> map = new HashMap<>();
	    map.put("id", id);

	    try (SqlSession session = sqlSessionFactory.openSession(true)) { // 자동 커밋 모드
	        return session.delete("nbs.monitor.deleteViewFilterJobList", map);
	    }
	}

//	
//	private int deleteViewFilterJobList(int id, List<String> jobIdList) throws SQLException {
//		Map map = new HashMap();
//		
//		int cnt = 0;
//		sqlMapClient.startBatch();
//		for (String jobId : jobIdList) {
//			map.put("id",    id);
//			map.put("jobId", jobId);
//			cnt += sqlMapClient.update("nbs.monitor.deleteViewFilterJobList", map);
//		}
//		sqlMapClient.executeBatch();
//		updateViewFilterJobCount(id);
//		return cnt;
//	}

	private int deleteViewFilterJobList(int id, List<String> jobIdList) throws SQLException {
	    Map<String, Object> map = new HashMap<>();
	    int cnt = 0;

	    try (SqlSession session = sqlSessionFactory.openSession(true)) { // 자동 커밋 모드
	        for (String jobId : jobIdList) {
	            map.put("id", id);
	            map.put("jobId", jobId);
	            cnt += session.delete("nbs.monitor.deleteViewFilterJobList", map);
	        }
	    }

	    updateViewFilterJobCount(id);
	    return cnt;
	}

	public int addViewFilter(ViewFilter vf) throws SQLException {
		vf.setLastModifyTime(DateUtil.getCurrentTimestampString());
		int cnt = insertViewFilter(vf);
		insertViewFilterJobList(vf);
		return cnt;
	}

	public ViewFilter getViewFilter(int id) throws SQLException {
		return selectViewFilter(id);
	}
	
	public List<ViewFilter> getViewFiltersByQuery(String query, String orderBy) throws SQLException {
		return (List<ViewFilter>) selectViewFilterByQuery(query, orderBy);
	}
	
	public ViewFilter getViewFilterDeep(int id) throws SQLException {
		ViewFilter vf = selectViewFilter(id);
		List<String> jobIdList = selectViewFilterJobList(id);
		vf.setJobIdList(jobIdList);
		return vf;
	}
	
	public List<JobDefinition> getJobDefinitionsByViewFilter(int id) throws SQLException {
		return (List<JobDefinition>) selectJobDefListByViewFilter(id);
	}

	public int modifyViewFilter(ViewFilter vf) throws SQLException {
		vf.setLastModifyTime(DateUtil.getCurrentTimestampString());
		int cnt = updateViewFilter(vf);
		deleteViewFilterJobList(vf.getId());
		insertViewFilterJobList(vf);
		return cnt;
	}
	
	public int modifyViewFilterNoJobList(ViewFilter vf) throws SQLException {
		vf.setLastModifyTime(DateUtil.getCurrentTimestampString());
		int cnt = updateViewFilter(vf);
		return cnt;
	}
	
	public int modifyViewFilterAddJobList(int id, List<String> jobIdList) throws SQLException {
		int cnt = insertViewFilterJobList(id, jobIdList);
		return cnt;
	}

	public int modifyViewFilterDelJobList(int id, List<String> jobIdList) throws SQLException {
		int cnt = deleteViewFilterJobList(id, jobIdList);
		return cnt;
	}
	
	public int removeViewFilter(int id) throws SQLException {
		int cnt = deleteViewFilter(id);
		deleteViewFilterJobList(id);
		return cnt;
	}
}