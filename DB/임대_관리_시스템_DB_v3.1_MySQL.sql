-- ==========================================
-- 임대 관리 시스템 DB v3.2 (MySQL)
-- ==========================================

DROP DATABASE IF EXISTS `ERICA`;
CREATE DATABASE `ERICA`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE `ERICA`;



SET FOREIGN_KEY_CHECKS = 0;

-- 1단계: 테이블 생성 (CREATE TABLE)

-- 1. 사용자 테이블
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
    `user_id`       BIGINT        NOT NULL AUTO_INCREMENT COMMENT '사용자 ID',
    `user_name`     VARCHAR(50)   NOT NULL COMMENT '사용자 이름',
    `is_deleted`    CHAR(1)       NOT NULL DEFAULT 'N' COMMENT 'Y : 비활성(삭제), N: 활성',
    `user_password` VARCHAR(255)  NOT NULL COMMENT '사용자 PASSWORD (해싱 대비)',
    `email`         VARCHAR(100)  NOT NULL COMMENT '사용자 이메일 (중복 불가)',
    `phone`         VARCHAR(15)   NOT NULL COMMENT '사용자 전화번호',
    `center_id`     BIGINT        NULL     COMMENT '센터 고유 식별자',
    `is_company`    CHAR(1)       NOT NULL DEFAULT 'N' COMMENT 'Y : 기업, N: 개인',
    `department`    VARCHAR(100)  NULL     COMMENT '부서명',
    `team`          VARCHAR(100)  NULL     COMMENT '팀명',
    `rank`          VARCHAR(50)   NULL     COMMENT '직급',
    `work_status`   VARCHAR(50)   NULL     COMMENT '재직 상태 (재직/휴직/퇴직 등)',
    `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시점',
    `deleted_at`    DATETIME      NULL     COMMENT '삭제 시점',
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `uq_user_email` (`email`),
    CONSTRAINT `chk_user_is_deleted` CHECK (`is_deleted` IN ('Y', 'N')),
    CONSTRAINT `chk_user_is_company` CHECK (`is_company` IN ('Y', 'N'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자';

-- 2. 센터 정보 테이블
DROP TABLE IF EXISTS `center`;
CREATE TABLE `center` (
    `center_id`         BIGINT        NOT NULL AUTO_INCREMENT COMMENT '센터 고유 식별자',
    `center_name`       VARCHAR(100)  NOT NULL COMMENT '센터명',
    `center_short_name` VARCHAR(50)   NULL     COMMENT '센터명 약칭',
    `eng_name`          VARCHAR(100)  NULL     COMMENT '영문센터명',
    `biz_reg_no`        CHAR(12)      NULL     COMMENT '사업자등록번호 (중복 불가)',
    `director_name`     VARCHAR(50)   NULL     COMMENT '센터장',
    `address`           TEXT          NULL     COMMENT '주소',
    `main_phone`        VARCHAR(15)   NULL     COMMENT '대표전화번호',
    `main_fax`          VARCHAR(15)   NULL     COMMENT '대표팩스번호',
    `biz_type`          VARCHAR(50)   NULL     COMMENT '업태',
    `biz_category`      VARCHAR(50)   NULL     COMMENT '업종',
    `tax_mgr_name`      VARCHAR(50)   NULL     COMMENT '세금계산서 담당자명',
    `logo_img_url`      VARCHAR(255)  NULL     COMMENT '센터 로고 이미지 URL',
    `seal_img_url`      VARCHAR(255)  NULL     COMMENT '센터 직인 이미지 URL',
    `created_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시점',
    `deleted_at`        DATETIME      NULL     COMMENT '삭제 시점',
    PRIMARY KEY (`center_id`),
    UNIQUE KEY `uq_center_biz_reg_no` (`biz_reg_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='센터 정보';

-- 3. 지점 테이블
DROP TABLE IF EXISTS `branch`;
CREATE TABLE `branch` (
    `branch_id`        BIGINT        NOT NULL AUTO_INCREMENT COMMENT '지점 고유 식별자',
    `branch_name`      VARCHAR(100)  NOT NULL COMMENT '지점명',
    `branch_short_name` VARCHAR(50)  NULL     COMMENT '지점명 약칭',
    `status_center`    VARCHAR(20)   NOT NULL DEFAULT '운영' COMMENT '지점 상태 (운영/폐쇄/준비)',
    `address`          TEXT          NULL     COMMENT '주소',
    `detail_address`   VARCHAR(255)  NULL     COMMENT '상세주소',
    `manager_name`     VARCHAR(50)   NULL     COMMENT '지점장명',
    `phone`            VARCHAR(15)   NULL     COMMENT '대표전화번호',
    `fax`              VARCHAR(15)   NULL     COMMENT '팩스번호',
    `sort_order`       INT           NOT NULL DEFAULT 1 COMMENT '정렬 순서',
    `is_deleted`       CHAR(1)       NOT NULL DEFAULT 'N' COMMENT 'Y : 비활성(삭제), N: 활성',
    `created_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시점',
    `updated_at`       DATETIME      NULL     COMMENT '수정 시점',
    `deleted_at`       DATETIME      NULL     COMMENT '삭제 시점',
    PRIMARY KEY (`branch_id`),
    CONSTRAINT `chk_branch_status_center` CHECK (`status_center` IN ('운영', '폐쇄', '준비')),
    CONSTRAINT `chk_branch_is_deleted`    CHECK (`is_deleted` IN ('Y', 'N'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='지점';

-- 4. 지점 담당자 테이블
DROP TABLE IF EXISTS `manager`;
CREATE TABLE `manager` (
    `manager_id`   BIGINT        NOT NULL AUTO_INCREMENT COMMENT '담당자 식별자',
    `branch_id`    BIGINT        NOT NULL COMMENT '소속 지점 식별자',
    `manager_name` VARCHAR(50)   NOT NULL COMMENT '담당자명',
    `department`   VARCHAR(50)   NULL     COMMENT '부서명',
    `team`         VARCHAR(50)   NULL     COMMENT '팀명',
    `rank_name`    VARCHAR(30)   NULL     COMMENT '직급명',
    `email`        VARCHAR(100)  NULL     COMMENT '이메일',
    `phone`        VARCHAR(15)   NULL     COMMENT '연락처',
    `work_status`  VARCHAR(20)   NOT NULL DEFAULT '재직' COMMENT '재직 상태 (재직/휴직/퇴직)',
    `is_company`   CHAR(1)       NOT NULL DEFAULT 'Y' COMMENT 'Y: 기업, N: 개인',
    `created_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시점',
    `deleted_at`   DATETIME      NULL     COMMENT '삭제 시점',
    PRIMARY KEY (`manager_id`),
    CONSTRAINT `chk_manager_is_company` CHECK (`is_company` IN ('Y', 'N'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='지점 담당자';

-- 5. 부서 테이블
DROP TABLE IF EXISTS `department`;
CREATE TABLE `department` (
    `dept_id`    BIGINT        NOT NULL AUTO_INCREMENT COMMENT '부서 식별자',
    `dept_name`  VARCHAR(100)  NOT NULL COMMENT '부서명',
    `sort_order` INT           NOT NULL DEFAULT 1 COMMENT '정렬 순서',
    `is_used`    CHAR(1)       NOT NULL DEFAULT 'Y' COMMENT 'Y: 사용, N: 미사용',
    `apply_date` DATETIME      NULL     COMMENT '적용일',
    `created_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시점',
    PRIMARY KEY (`dept_id`),
    CONSTRAINT `chk_dept_is_used` CHECK (`is_used` IN ('Y', 'N'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='부서';

-- 6. 팀 테이블
DROP TABLE IF EXISTS `team`;
CREATE TABLE `team` (
    `team_id`    BIGINT        NOT NULL AUTO_INCREMENT COMMENT '팀 식별자',
    `dept_id`    BIGINT        NOT NULL COMMENT '소속 부서 식별자',
    `team_name`  VARCHAR(100)  NOT NULL COMMENT '팀명',
    `sort_order` INT           NOT NULL DEFAULT 1 COMMENT '정렬 순서',
    `is_used`    CHAR(1)       NOT NULL DEFAULT 'Y' COMMENT 'Y: 사용, N: 미사용',
    `apply_date` DATETIME      NULL     COMMENT '적용일',
    `created_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시점',
    PRIMARY KEY (`team_id`),
    CONSTRAINT `chk_team_is_used` CHECK (`is_used` IN ('Y', 'N'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='팀';

-- 7. 디바이스 모델 테이블
DROP TABLE IF EXISTS `device_model`;
CREATE TABLE `device_model` (
    `model_id`      BIGINT        NOT NULL AUTO_INCREMENT COMMENT '모델 고유 식별자',
    `model_name`    VARCHAR(100)  NOT NULL COMMENT '모델명',
    `version`       VARCHAR(50)   NULL     COMMENT '버전',
    `manual_url`    TEXT          NULL     COMMENT '메뉴얼 다운로드 경로',
    `device_specs`  TEXT          NULL     COMMENT '디바이스 상세 스펙',
    `is_deleted`    CHAR(1)       NOT NULL DEFAULT 'N' COMMENT 'Y : 비활성(삭제), N: 활성',
    `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시점',
    `deleted_at`    DATETIME      NULL     COMMENT '삭제 시점',
    PRIMARY KEY (`model_id`),
    CONSTRAINT `chk_device_model_is_deleted` CHECK (`is_deleted` IN ('Y', 'N'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='디바이스 모델';

-- 8. 디바이스 현황 테이블
DROP TABLE IF EXISTS `device`;
CREATE TABLE `device` (
    `device_id`        BIGINT        NOT NULL AUTO_INCREMENT COMMENT '디바이스 고유 ID',
    `model_id`         BIGINT        NOT NULL COMMENT '모델 식별자',
    `branch_id`        BIGINT        NOT NULL COMMENT '현재 배정된 지점 식별자',
    `device_status`    TINYINT       NOT NULL DEFAULT 0 COMMENT '기기 상태 (입고:0, 임대중:1, 임대대기:2, AS접수:3, AS완료:4, 폐기:9)',
    `battery_level`    TINYINT       NOT NULL DEFAULT 100 COMMENT '현재 배터리 상태(%, 0~100)',
    `receive_date`     DATETIME      NULL     COMMENT '입고일',
    `dispatch_date`    DATETIME      NULL     COMMENT '지점발송일',
    `last_rental_date` DATETIME      NULL     COMMENT '최근 임대일',
    `last_as_date`     DATETIME      NULL     COMMENT '최근 AS일',
    `device_specs`     TEXT          NULL     COMMENT '디바이스 상세 스펙',
    `user_id`          BIGINT        NOT NULL COMMENT '사용자 ID',
    `center_id`        BIGINT        NULL     COMMENT '센터 고유 식별자',
    `created_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시점',
    `deleted_at`       DATETIME      NULL     COMMENT '삭제 시점',
    PRIMARY KEY (`device_id`),
    CONSTRAINT `chk_device_battery` CHECK (`battery_level` BETWEEN 0 AND 100),
    CONSTRAINT `chk_device_status`  CHECK (`device_status` IN (0, 1, 2, 3, 4, 9))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='디바이스 현황';

-- 9. 디바이스 임대 이력 테이블
DROP TABLE IF EXISTS `rental`;
CREATE TABLE `rental` (
    `rental_id`        BIGINT        NOT NULL AUTO_INCREMENT COMMENT '임대 이력 식별자',
    `device_id`        BIGINT        NOT NULL COMMENT '대여된 디바이스 ID',
    `branch_id`        BIGINT        NOT NULL COMMENT '임대 지점',
    `status_rent`      TINYINT       NOT NULL DEFAULT 0 COMMENT '임대 상태 (신청:0, 수령대기:1, 임대중:2, 반납완료:3, 취소:9)',
    `req_date`         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '신청일',
    `exp_start_date`   DATETIME      NULL     COMMENT '사용예정시작일',
    `exp_return_date`  DATETIME      NOT NULL COMMENT '반납예정일',
    `receipt_date`     DATETIME      NULL     COMMENT '수령일',
    `return_date`      DATETIME      NULL     COMMENT '반납일',
    `is_worn`          CHAR(1)       NOT NULL DEFAULT 'N' COMMENT '착용여부 (Y/N)',
    `user_id`          BIGINT        NOT NULL COMMENT '신청자 ID',
    `created_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시점',
    `deleted_at`       DATETIME      NULL     COMMENT '삭제 시점',
    PRIMARY KEY (`rental_id`),
    CONSTRAINT `chk_rental_is_worn` CHECK (`is_worn` IN ('Y', 'N')),
    CONSTRAINT `chk_rental_status`  CHECK (`status_rent` IN (0, 1, 2, 3, 9))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='디바이스 임대 이력';

-- 10. 디바이스 AS 이력 테이블
DROP TABLE IF EXISTS `device_as`;
CREATE TABLE `device_as` (
    `as_id`            BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'AS 접수 식별자',
    `device_id`        BIGINT        NOT NULL COMMENT 'AS 대상 디바이스 ID',
    `branch_id`        BIGINT        NOT NULL COMMENT 'AS 발생 지점 식별자',
    `status_as`        TINYINT       NOT NULL DEFAULT 0 COMMENT 'AS 상태 (이상무:0, 접수:1, 진행중:2, 완료:3, 취소:9)',
    `type_as`          TINYINT       NOT NULL DEFAULT 0 COMMENT 'AS 유형 (파손:0, 침수:1, 소프트웨어:2, 기타:3, 불명:9)',
    `receipt_date`     DATETIME      NULL     COMMENT '접수일',
    `receipt_details`  TEXT          NULL     COMMENT '접수내역',
    `checker_name`     VARCHAR(50)   NULL     COMMENT '확인자',
    `collection_date`  DATETIME      NULL     COMMENT '수거일',
    `manager_name`     VARCHAR(50)   NULL     COMMENT '담당자',
    `repair_details`   TEXT          NULL     COMMENT '수리(AS)내역',
    `completion_date`  DATETIME      NULL     COMMENT '완료일',
    `redispatch_date`  DATETIME      NULL     COMMENT '재발송일',
    `user_id`          BIGINT        NOT NULL COMMENT '접수자 ID',
    `rental_id`        BIGINT        NULL     COMMENT '임대 이력 식별자',
    `created_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '데이터 생성 시점',
    `deleted_at`       DATETIME      NULL     COMMENT '삭제 시점',
    PRIMARY KEY (`as_id`),
    CONSTRAINT `chk_device_as_status` CHECK (`status_as` IN (0, 1, 2, 3, 9)),
    CONSTRAINT `chk_device_as_type`   CHECK (`type_as` IN (0, 1, 2, 3, 9))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='디바이스 AS 이력';

-- 11. 응급상황 테이블
DROP TABLE IF EXISTS `emergency`;
CREATE TABLE `emergency` (
    `emergency_id`       BIGINT        NOT NULL AUTO_INCREMENT COMMENT '응급 접수 식별자',
    `type_emergency`     VARCHAR(50)   NULL     COMMENT '응급 유형 (과호흡, 낙상 등)',
    `user_id`            BIGINT        NOT NULL COMMENT '사용자 ID',
    `device_id`          BIGINT        NOT NULL COMMENT '디바이스 고유 ID',
    `event_time`         DATETIME      NULL     COMMENT '응급 상황 발생 시각',
    `location_address`   TEXT          NULL     COMMENT '응급 상황 발생 주소',
    `status_emergency`   TINYINT       NOT NULL DEFAULT 0 COMMENT '응급 상황 처리 상태 (대기:0, 오탐:1, 처리완료:2)',
    `severity_emergency` TINYINT       NOT NULL DEFAULT 0 COMMENT '응급 상황 심각도 (낮음:0, 중간:1, 높음:2)',
    `resolved_time`      DATETIME      NULL     COMMENT '응급 상황 종료 시각',
    `updated_at`         DATETIME      NULL     COMMENT '최종 업데이트 시각',
    `created_at`         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시점',
    `deleted_at`         DATETIME      NULL     COMMENT '삭제 시점',
    PRIMARY KEY (`emergency_id`),
    CONSTRAINT `chk_emergency_status`   CHECK (`status_emergency` IN (0, 1, 2)),
    CONSTRAINT `chk_emergency_severity` CHECK (`severity_emergency` IN (0, 1, 2))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='응급상황';

-- 12. 공통 코드 테이블
DROP TABLE IF EXISTS `master_code`;
CREATE TABLE `master_code` (
    `group_code`  VARCHAR(30)   NOT NULL COMMENT '사용할 칼럼 명',
    `code_value`  TINYINT       NOT NULL COMMENT '입력되는 숫자에 따라 code_name이 정해짐',
    `code_name`   VARCHAR(50)   NOT NULL COMMENT '표시할 상태나 유형',
    `description` TEXT          NULL     COMMENT '설명',
    PRIMARY KEY (`group_code`, `code_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='공통 코드';

-- 13. 식별자 관리 테이블
DROP TABLE IF EXISTS `identifier_master`;
CREATE TABLE `identifier_master` (
    `code_id`           BIGINT        NOT NULL AUTO_INCREMENT COMMENT '코드 마스터 식별자',
    `type_entity`       TINYINT       NOT NULL DEFAULT 0 COMMENT '엔티티의 유형(ex: USER, DEVICE)',
    `entity_pk_value`   BIGINT        NULL     COMMENT '실제 엔티티 테이블의 기본 키 값',
    `target_table_name` VARCHAR(100)  NULL     COMMENT '식별자가 사용되는 테이블명',
    `target_field_name` VARCHAR(100)  NULL     COMMENT '식별자가 사용되는 대상 테이블 내의 필드명',
    `created_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '식별자 생성 시각',
    `description`       TEXT          NULL     COMMENT '식별자에 대한 추가 설명',
    `center_id`         BIGINT        NULL     COMMENT '센터 고유 식별자',
    PRIMARY KEY (`code_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='식별자 관리 테이블';

-- 14. 디바이스 사용 생체 정보 로그 테이블
DROP TABLE IF EXISTS `device_log`;
CREATE TABLE `device_log` (
    `log_id`             BIGINT        NOT NULL AUTO_INCREMENT COMMENT '생체 데이터 로그 식별자',
    `device_id`          BIGINT        NOT NULL COMMENT '데이터를 수집한 디바이스 ID',
    `last_used_date`     DATETIME      NULL     COMMENT '최근사용일',
    `usage_time_per_day` MEDIUMINT     NULL     COMMENT '사용시간/일 (분 단위)',
    `total_usage_time`   MEDIUMINT     NULL     COMMENT '총사용시간 (분 단위)',
    `resp_rate_per_day`  MEDIUMINT     NULL     COMMENT '호흡수/일',
    `steps_per_day`      MEDIUMINT     NULL     COMMENT '걸음수/일',
    `total_steps`        MEDIUMINT     NULL     COMMENT '총 걸음수 (누적)',
    `last_location`      TEXT          NULL     COMMENT '최근사용자위치',
    `user_id`            BIGINT        NOT NULL COMMENT '사용자 ID',
    `created_at`         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시점',
    `deleted_at`         DATETIME      NULL     COMMENT '삭제 시점',
    PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='디바이스 사용 생체 정보 로그';


-- 2단계: 외래키(Foreign Key) 제약 조건 추가

ALTER TABLE `team`
    ADD CONSTRAINT `fk_team_department` FOREIGN KEY (`dept_id`) REFERENCES `department` (`dept_id`);

ALTER TABLE `manager`
    ADD CONSTRAINT `fk_manager_branch` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`);

ALTER TABLE `device`
    ADD CONSTRAINT `fk_device_model`  FOREIGN KEY (`model_id`)  REFERENCES `device_model` (`model_id`),
    ADD CONSTRAINT `fk_device_branch` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`),
    ADD CONSTRAINT `fk_device_user`   FOREIGN KEY (`user_id`)   REFERENCES `user` (`user_id`),
    ADD CONSTRAINT `fk_device_center` FOREIGN KEY (`center_id`) REFERENCES `center` (`center_id`);

ALTER TABLE `rental`
    ADD CONSTRAINT `fk_rental_device` FOREIGN KEY (`device_id`) REFERENCES `device` (`device_id`),
    ADD CONSTRAINT `fk_rental_branch` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`),
    ADD CONSTRAINT `fk_rental_user`   FOREIGN KEY (`user_id`)   REFERENCES `user` (`user_id`);

ALTER TABLE `device_as`
    ADD CONSTRAINT `fk_device_as_device` FOREIGN KEY (`device_id`) REFERENCES `device` (`device_id`),
    ADD CONSTRAINT `fk_device_as_user`   FOREIGN KEY (`user_id`)   REFERENCES `user` (`user_id`),
    ADD CONSTRAINT `fk_device_as_rental` FOREIGN KEY (`rental_id`) REFERENCES `rental` (`rental_id`),
    ADD CONSTRAINT `fk_device_as_branch` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`);

ALTER TABLE `emergency`
    ADD CONSTRAINT `fk_emergency_user`   FOREIGN KEY (`user_id`)   REFERENCES `user` (`user_id`),
    ADD CONSTRAINT `fk_emergency_device` FOREIGN KEY (`device_id`) REFERENCES `device` (`device_id`);

ALTER TABLE `user`
    ADD CONSTRAINT `fk_user_center` FOREIGN KEY (`center_id`) REFERENCES `center` (`center_id`);

ALTER TABLE `device_log`
    ADD CONSTRAINT `fk_device_log_device` FOREIGN KEY (`device_id`) REFERENCES `device` (`device_id`),
    ADD CONSTRAINT `fk_device_log_user`   FOREIGN KEY (`user_id`)   REFERENCES `user` (`user_id`);

ALTER TABLE `identifier_master`
    ADD CONSTRAINT `fk_identifier_master_center` FOREIGN KEY (`center_id`) REFERENCES `center` (`center_id`);

SET FOREIGN_KEY_CHECKS = 1;
