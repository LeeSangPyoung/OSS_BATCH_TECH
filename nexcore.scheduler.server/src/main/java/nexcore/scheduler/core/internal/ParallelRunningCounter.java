package nexcore.scheduler.core.internal;

import java.sql.SQLException;
import java.util.List;

import nexcore.scheduler.entity.AdminAuth;
import nexcore.scheduler.entity.ParallelGroup;

//import com.ibatis.sqlmap.client.SqlMapClient;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
/**
 * <ul>
 * <li>업무 그룹명 : 금융 프레임워크 </li>
 * <li>서브 업무명 : 배치 코어</li>
 * <li>설  명 : Parallel Job의 max running을 관리 </li>
 * <li>작성일 : 2010. 5. 7.</li>
 * <li>작성자 : 정호철</li>
 * </ul>
 */
public class ParallelRunningCounter {
    @Autowired
    private SqlSessionFactory sqlSessionFactory;  // ✅ Spring에서 주입

	private SqlSession sqlSession;

	
	public ParallelRunningCounter() {
	}

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

	/**
	 * DB 에서 parallel 설정 값을 읽음.
	 * @param groupName
	 * @return
	 */
	/*
	 * public ParallelGroup getParallelGroup(String groupName) throws SQLException {
	 * return (ParallelGroup)sqlMapClient.queryForObject(
	 * "nbs.scheduler.selectParallelGroup", groupName); }
	 */
	public ParallelGroup getParallelGroup(String groupName) throws SQLException {
	    try (SqlSession session = sqlSessionFactory.openSession()) {
	        return session.selectOne("nbs.scheduler.selectParallelGroup", groupName);
	    }
	}

	/**
	 * DB 에서 parallel 설정 값중 MAX 값을 읽되. FOR UPDATE 를 이용하여 LOCK 을 걸어서 읽는다.
	 * 이중화 환경에서 동시성문제를 해결할때 사용된다.
	 * @param groupName
	 * @return
	 */
	/*
	 * public int getParallelGroupMaxWithLock(String groupName) throws SQLException
	 * { Integer max = (Integer)sqlMapClient.queryForObject(
	 * "nbs.scheduler.selectParallelGroupMaxWithLock", groupName);
	 * 
	 * if (max == null) { return -1; }else { return max.intValue(); } }
	 */
	public int getParallelGroupMaxWithLock(String groupName) throws SQLException {
	    try (SqlSession session = sqlSessionFactory.openSession()) {
	        Integer max = session.selectOne("nbs.scheduler.selectParallelGroupMaxWithLock", groupName);
	        return (max == null) ? -1 : max;
	    }
	}
	/**
	 * 전체 병렬 그룹 조회
	 * @return
	 * @throws SQLException
	 */
	/*
	 * public List<ParallelGroup> getAllParallelGroupsList() throws SQLException {
	 * List<ParallelGroup> list =
	 * sqlMapClient.queryForList("nbs.scheduler.selectAllParallelGroup", null);
	 * return list; }
	 */
	private List<ParallelGroup> getAllParallelGroupsList() throws SQLException {
	    try (SqlSession session = sqlSessionFactory.openSession()) {
	        return session.selectList("nbs.scheduler.selectAllParallelGroup");
	    }
	}

	/**
	 * 최대 실행 수 값을 변경
	 * @param groupName
	 * @param newMaxLimit
	 */
	/*
	 * public void addParallelGroup(ParallelGroup parallelGroup, AdminAuth auth)
	 * throws SQLException { int updateCnt =
	 * sqlMapClient.update("nbs.scheduler.insertParallelGroup", parallelGroup); if
	 * (updateCnt < 1) { // TODO warning 로그. } }
	 */
	private void addParallelGroup(ParallelGroup parallelGroup, AdminAuth auth) throws SQLException {
	    try (SqlSession session = sqlSessionFactory.openSession()) {
	        int updateCnt = session.insert("nbs.scheduler.insertParallelGroup", parallelGroup);
	        session.commit(); // ✅ MyBatis에서는 수동 commit 필요

	        if (updateCnt < 1) {
	            // TODO warning 로그 추가 필요
	        }
	    }
	}

	/**
	 * 최대 실행 수 값을 변경
	 * @param groupName
	 * @param newMaxLimit
	 */
	/*
	 * public void modifyParallelGroup(ParallelGroup parallelGroup, AdminAuth auth)
	 * throws SQLException { int updateCnt =
	 * sqlMapClient.update("nbs.scheduler.updateParallelGroup", parallelGroup); if
	 * (updateCnt < 1) { // TODO warning 로그. } }
	 */
	private void modifyParallelGroup(ParallelGroup parallelGroup, AdminAuth auth) throws SQLException {
	    try (SqlSession session = sqlSessionFactory.openSession()) {
	        int updateCnt = session.update("nbs.scheduler.updateParallelGroup", parallelGroup);
	        session.commit(); // ✅ MyBatis에서는 수동 commit 필요

	        if (updateCnt < 1) {
	            // TODO warning 로그 추가 필요
	        }
	    }
	}
	
	/**
	 * 최대 실행 변수 제거
	 * @param groupName
	 * @param newMaxLimit
	 */
	/*
	 * public void deleteParallelGroup(String groupName, AdminAuth auth) throws
	 * SQLException { int updateCnt =
	 * sqlMapClient.update("nbs.scheduler.deleteParallelGroup", groupName); if
	 * (updateCnt < 1) { // TODO warning 로그. } }
	 */
	private void deleteParallelGroup(String groupName, AdminAuth auth) throws SQLException {
	    try (SqlSession session = sqlSessionFactory.openSession()) {
	        int updateCnt = session.delete("nbs.scheduler.deleteParallelGroup", groupName);
	        session.commit(); // ✅ MyBatis에서는 수동 commit 필요

	        if (updateCnt < 1) {
	            // TODO warning 로그 추가 필요
	        }
	    }
	}
}
