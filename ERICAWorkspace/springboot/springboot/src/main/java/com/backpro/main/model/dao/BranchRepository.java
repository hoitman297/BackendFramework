package com.backpro.main.model.dao;

import java.util.List;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import com.backpro.main.model.vo.Branch;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {


    // 기존 유지
    List<Branch> findByIsDeleted(String isDeleted);
    List<Branch> findByStatusCenterAndIsDeleted(String statusCenter, String isDeleted);

    // [FIX] BranchService.getBranches()에서 호출하나 메서드 삭제됨 → 복구
    @Query("""
        select b from Branch b
        where b.isDeleted = 'N'
          and (:status is null or :status = '' or b.statusCenter = :status)
          and (:keyword is null or :keyword = ''
            or lower(b.branchName) like lower(concat('%', :keyword, '%'))
            or lower(coalesce(b.detailAddress, '')) like lower(concat('%', :keyword, '%'))
            or lower(coalesce(b.address, '')) like lower(concat('%', :keyword, '%'))
            or lower(coalesce(b.phone, '')) like lower(concat('%', :keyword, '%'))
          )
        order by b.sortOrder asc, b.branchId desc
    """)
    List<Branch> search(@Param("status") String status, @Param("keyword") String keyword);

}
