package nexcore.scheduler.controller.internal;

import nexcore.scheduler.controller.IJobExecutionIdMaker;
import nexcore.scheduler.core.internal.TableBaseIdGenerator;
import nexcore.scheduler.exception.SchedulerException;

// import com.ibatis.sqlmap.client.SqlMapClient;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
/**
 * <ul>
 * <li>업무 그룹명 : 금융 프레임워크 </li>
 * <li>서브 업무명 : 배치 코어</li>
 * <li>설  명 : 기본 Job Execution Id 생성기. JOB INSTANCE ID + SEQ(6). 멀티노드 환경에서의 테이블 방식</li>
 * <li>작성일 : 2012. 10. 11.</li>
 * <li>작성자 : 정호철</li>
 * </ul>
 */

public class TableBaseJobExecutionIdMaker implements IJobExecutionIdMaker {
	@Autowired
	private SqlSessionFactory sqlSessionFactory;  // ✅ Spring에서 주입
	// private SqlMapClient            sqlMapClient;
	private SqlSession sqlSession;

	private int                     retryCount;

	private TableBaseIdGenerator    tableBaseIdGenerator;
	
	public void init() {
		if (retryCount==0) {
			tableBaseIdGenerator = new TableBaseIdGenerator("JE", sqlSession);
		}else {
			tableBaseIdGenerator = new TableBaseIdGenerator("JE", sqlSession, retryCount);
		}
	}
	
	public void destroy() {
	}

	/*
	 * public SqlMapClient getSqlMapClient() { return sqlMapClient; }
	 * 
	 * public void setSqlMapClient(SqlMapClient sqlMapClient) { this.sqlMapClient =
	 * sqlMapClient; }
	 */
	
	public SqlSession getSqlMapClient() {
		return sqlSession;
	}

	public void setSqlMapClient(SqlSession sqlSession) {
		this.sqlSession = sqlSession;
	}

	public int getRetryCount() {
		return retryCount;
	}

	public void setRetryCount(int retryCount) {
		this.retryCount = retryCount;
	}

	public String makeJobExecutionId(String jobInstanceId) {
		try {
			int newSeq = tableBaseIdGenerator.getNextSeq(jobInstanceId);
			if (newSeq > 999999) {
				throw new SchedulerException("main.max.jobexeid.exceed.error", jobInstanceId);
			}
			return jobInstanceId + String.format("%06d", newSeq);
		}catch(Exception e) {
			throw new SchedulerException("main.get.max.jobexeid.error", e, jobInstanceId);
		}
	}

	public String getMonitoringString() {
		return null;
	}
}

