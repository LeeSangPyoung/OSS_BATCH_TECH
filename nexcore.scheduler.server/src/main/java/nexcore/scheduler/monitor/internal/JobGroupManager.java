package nexcore.scheduler.monitor.internal;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.springframework.beans.factory.annotation.Autowired;

import nexcore.scheduler.entity.JobGroup;
import nexcore.scheduler.entity.JobGroupAttr;
import nexcore.scheduler.entity.JobGroupAttrDef;
import nexcore.scheduler.util.DateUtil;

//import com.ibatis.sqlmap.client.SqlMapClient;

/**
 * <ul>
 * <li>업무 그룹명 : 금융 프레임워크 </li>
 * <li>서브 업무명 : 배치 코어</li>
 * <li>설  명 : Job 그룹 DAO </li>
 * <li>작성일 : 2013. 1. 16.</li>
 * <li>작성자 : 정호철</li>
 * </ul>
 */

public class JobGroupManager {
    @Autowired
    private SqlSessionFactory sqlSessionFactory;  // ✅ Spring에서 주입

	//private SqlMapClient                sqlMapClient;
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

	// ====================================================================================
	
	public JobGroupAttrDef selectJobGroupAttrDef(String jobGroupAttrDefid) throws SQLException {
		//return (JobGroupAttrDef)sqlMapClient.queryForObject("nbs.monitor.selectJobGroupAttrDef", jobGroupAttrDefid);
		return sqlSession.selectOne("nbs.monitor.selectJobGroupAttrDef", jobGroupAttrDefid);

	}
	
//	public List<JobGroupAttrDef> selectJobGroupAttrDefByQuery(String queryCondition, String orderBy) throws SQLException {
//		Map map = new HashMap();
//		map.put("queryCondition", queryCondition);
//		map.put("orderBy",        orderBy);
//		return (List)sqlMapClient.queryForList("nbs.monitor.selectJobGroupAttrDefByQuery", map);
//	}
	public List<JobGroupAttrDef> selectJobGroupAttrDefByQuery(String queryCondition, String orderBy) throws SQLException {
	    Map<String, Object> map = new HashMap<>();
	    map.put("queryCondition", queryCondition);
	    map.put("orderBy", orderBy);
	    return sqlSession.selectList("nbs.monitor.selectJobGroupAttrDefByQuery", map);
	}

//	public boolean insertJobGroupAttrDef(JobGroupAttrDef jobGroupAttrDef) throws SQLException {
//		long current = System.currentTimeMillis();
//		jobGroupAttrDef.setLastModifyTime(DateUtil.getTimestampString(current));
//		return sqlMapClient.update("nbs.monitor.insertJobGroupAttrDef", jobGroupAttrDef) > 0;
//	}
//	
//	public boolean updateJobGroupAttrDef(JobGroupAttrDef jobGroupAttrDef) throws SQLException {
//		jobGroupAttrDef.setLastModifyTime(DateUtil.getCurrentTimestampString());
//		return sqlMapClient.update("nbs.monitor.updateJobGroupAttrDef", jobGroupAttrDef) > 0;
//	}
//	
//	public boolean deleteJobGroupAttrDef(String jobGroupAttrDefId) throws SQLException {
//		return sqlMapClient.delete("nbs.monitor.deleteJobGroupAttrDef", jobGroupAttrDefId) > 0;
//	}
	public boolean insertJobGroupAttrDef(JobGroupAttrDef jobGroupAttrDef) throws SQLException {
	    long current = System.currentTimeMillis();
	    jobGroupAttrDef.setLastModifyTime(DateUtil.getTimestampString(current));
	    return sqlSession.insert("nbs.monitor.insertJobGroupAttrDef", jobGroupAttrDef) > 0;
	}

	public boolean updateJobGroupAttrDef(JobGroupAttrDef jobGroupAttrDef) throws SQLException {
	    jobGroupAttrDef.setLastModifyTime(DateUtil.getCurrentTimestampString());
	    return sqlSession.update("nbs.monitor.updateJobGroupAttrDef", jobGroupAttrDef) > 0;
	}

	public boolean deleteJobGroupAttrDef(String jobGroupAttrDefId) throws SQLException {
	    return sqlSession.delete("nbs.monitor.deleteJobGroupAttrDef", jobGroupAttrDefId) > 0;
	}


	// ====================================================================================
	
//	public JobGroup selectJobGroup(String id) throws SQLException {
//		return (JobGroup)sqlMapClient.queryForObject("nbs.monitor.selectJobGroup", id);
//	}
	public JobGroup selectJobGroup(String id) throws SQLException {
	    return sqlSession.selectOne("nbs.monitor.selectJobGroup", id);
	}

//	public List<JobGroup> selectJobGroupByQuery(String queryCondition, String orderBy) throws SQLException {
//		Map map = new HashMap();
//		map.put("queryCondition", queryCondition);
//		map.put("orderBy",        orderBy);
//		return (List)sqlMapClient.queryForList("nbs.monitor.selectJobGroupByQuery", map);
//	}
	public List<JobGroup> selectJobGroupByQuery(String queryCondition, String orderBy) throws SQLException {
	    Map<String, Object> map = new HashMap<>();
	    map.put("queryCondition", queryCondition);
	    map.put("orderBy", orderBy);
	    return sqlSession.selectList("nbs.monitor.selectJobGroupByQuery", map);
	}

	/**
	 * @param queryParamMap {groupIdLike, groupNameLike, groupDescLike, authorizedJobGroupIdViewList}
	 * @return
	 * @throws SQLException
	 */
//	public List<JobGroup> selectJobGroupByDynamicQuery(Map queryParamMap) throws SQLException {
//		return (List)sqlMapClient.queryForList("nbs.monitor.selectJobGroupByDynamicQuery", queryParamMap);
//	}
	public List<JobGroup> selectJobGroupByDynamicQuery(Map<String, Object> queryParamMap) throws SQLException {
	    return sqlSession.selectList("nbs.monitor.selectJobGroupByDynamicQuery", queryParamMap);
	}

//	public int insertJobGroup(JobGroup jobGroup) throws SQLException {
//		long current = System.currentTimeMillis();
//		jobGroup.setCreateTime    (DateUtil.getTimestampString(current));
//		jobGroup.setLastModifyTime(DateUtil.getTimestampString(current));
//		int cnt = sqlMapClient.update("nbs.monitor.insertJobGroup", jobGroup);
//		insertJobGroupAttr(jobGroup.getAttributeList());
//		return cnt;
//	}
//	
//	public void insertJobGroupAttr(List<JobGroupAttr> jobGroupAttrList) throws SQLException {
//		sqlMapClient.startBatch();
//		for (JobGroupAttr attr : jobGroupAttrList) {
//			sqlMapClient.update("nbs.monitor.insertJobGroupAttr", attr);
//		}
//		sqlMapClient.executeBatch();
//	}
//
//	public boolean updateJobGroup(JobGroup jobGroup) throws SQLException {
//		jobGroup.setLastModifyTime(DateUtil.getCurrentTimestampString());
//		int cnt = sqlMapClient.update("nbs.monitor.updateJobGroup", jobGroup);
//		if (cnt > 0) {
//			deleteJobGroupAttr(jobGroup.getId());
//			insertJobGroupAttr(jobGroup.getAttributeList());
//		}
//		return cnt > 0;
//	}
//	
//	public boolean deleteJobGroup(String id) throws SQLException {
//		int cnt = sqlMapClient.delete("nbs.monitor.deleteJobGroup", id);
//		if (cnt > 0) {
//			deleteJobGroupAttr(id);
//		}
//		return cnt > 0;
//	}
//
//	public boolean deleteJobGroupAttr(String id) throws SQLException {
//		return sqlMapClient.delete("nbs.monitor.deleteJobGroupAttr", id) > 0;
//	}
	public int insertJobGroup(JobGroup jobGroup) throws SQLException {
	    long current = System.currentTimeMillis();
	    jobGroup.setCreateTime(DateUtil.getTimestampString(current));
	    jobGroup.setLastModifyTime(DateUtil.getTimestampString(current));
	    
	    int cnt = sqlSession.insert("nbs.monitor.insertJobGroup", jobGroup);
	    insertJobGroupAttr(jobGroup.getAttributeList());
	    return cnt;
	}

	public void insertJobGroupAttr(List<JobGroupAttr> jobGroupAttrList) throws SQLException {
	    try (SqlSession session = sqlSessionFactory.openSession(false)) { // 수동 커밋 모드
	        for (JobGroupAttr attr : jobGroupAttrList) {
	            session.insert("nbs.monitor.insertJobGroupAttr", attr);
	        }
	        session.commit(); // 트랜잭션 커밋
	    }
	}

	public boolean updateJobGroup(JobGroup jobGroup) throws SQLException {
	    jobGroup.setLastModifyTime(DateUtil.getCurrentTimestampString());
	    int cnt = sqlSession.update("nbs.monitor.updateJobGroup", jobGroup);
	    if (cnt > 0) {
	        deleteJobGroupAttr(jobGroup.getId());
	        insertJobGroupAttr(jobGroup.getAttributeList());
	    }
	    return cnt > 0;
	}

	public boolean deleteJobGroup(String id) throws SQLException {
	    int cnt = sqlSession.delete("nbs.monitor.deleteJobGroup", id);
	    if (cnt > 0) {
	        deleteJobGroupAttr(id);
	    }
	    return cnt > 0;
	}

	public boolean deleteJobGroupAttr(String id) throws SQLException {
	    return sqlSession.delete("nbs.monitor.deleteJobGroupAttr", id) > 0;
	}

}