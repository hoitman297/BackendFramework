SET FOREIGN_KEY_CHECKS=0;
SET NAMES utf8mb4;

SET @pw = (SELECT user_password FROM user WHERE user_id = 3);

-- ============ BRANCH (지점 5개) ============
INSERT INTO branch (branch_name, branch_short_name, status_center, address, manager_name, phone, sort_order) VALUES
('서울 강남지점', '강남', '운영', '서울특별시 강남구 테헤란로 123', '김강남', '02-1234-5678', 1),
('서울 강북지점', '강북', '운영', '서울특별시 강북구 도봉로 456', '이강북', '02-2345-6789', 2),
('부산 해운대지점', '해운대', '운영', '부산광역시 해운대구 해운대로 789', '박해운대', '051-3456-7890', 3),
('대구 중구지점', '대구', '운영', '대구광역시 중구 중앙대로 321', '최대구', '053-4567-8901', 4),
('인천 부평지점', '부평', '운영', '인천광역시 부평구 부평대로 654', '정인천', '032-5678-9012', 5);

-- ============ DEVICE MODEL (기기 모델 4개) ============
INSERT INTO device_model (model_name, version, device_specs) VALUES
('갤럭시 탭 A9', 'SM-X115', '10.1인치 / RAM 4GB / 64GB / 안드로이드 13'),
('아이패드 10세대', 'A2696', '10.9인치 / RAM 4GB / 64GB / iPadOS 17'),
('갤럭시 워치 6', 'SM-R930', '40mm / RAM 2GB / 16GB / WearOS 4'),
('갤럭시 A54', 'SM-A546', '6.4인치 / RAM 8GB / 128GB / 안드로이드 13');

-- ============ DEPARTMENT (부서 4개) ============
INSERT INTO department (dept_name, sort_order, is_used, apply_date) VALUES
('영업부', 1, 'Y', '2024-01-01 00:00:00'),
('기술지원부', 2, 'Y', '2024-01-01 00:00:00'),
('물류부', 3, 'Y', '2024-01-01 00:00:00'),
('관리부', 4, 'Y', '2024-01-01 00:00:00');

-- ============ TEAM (팀 8개, 부서별 2팀) ============
INSERT INTO team (dept_id, team_name, sort_order, is_used, apply_date) VALUES
(1, '영업1팀', 1, 'Y', '2024-01-01 00:00:00'),
(1, '영업2팀', 2, 'Y', '2024-01-01 00:00:00'),
(2, '기술1팀', 1, 'Y', '2024-01-01 00:00:00'),
(2, '기술2팀', 2, 'Y', '2024-01-01 00:00:00'),
(3, '물류1팀', 1, 'Y', '2024-01-01 00:00:00'),
(3, '물류2팀', 2, 'Y', '2024-01-01 00:00:00'),
(4, '총무팀',  1, 'Y', '2024-01-01 00:00:00'),
(4, '인사팀',  2, 'Y', '2024-01-01 00:00:00');

-- ============ USER (직원 12명) ============
-- rank: 1=직원, 2=지점장, 3=어드민 / is_company: Y=기업, N=개인
INSERT INTO user (user_name, is_deleted, user_password, email, phone, center_id, is_company, department, team, `rank`, work_status, `role`, created_at) VALUES
('김영업',  'N', @pw, 'kim.sales@erica.com',      '010-1111-2222', 1, 'Y', '영업부',   '영업1팀', 1, '재직', 'ADMIN', NOW()),
('이영업',  'N', @pw, 'lee.sales@erica.com',      '010-2222-3333', 1, 'Y', '영업부',   '영업2팀', 1, '재직', 'ADMIN', NOW()),
('박지점장','N', @pw, 'park.branch@erica.com',    '010-3333-4444', 1, 'Y', '영업부',   '영업1팀', 2, '재직', 'ADMIN', NOW()),
('최기술',  'N', @pw, 'choi.tech@erica.com',      '010-4444-5555', 1, 'Y', '기술지원부','기술1팀', 1, '재직', 'ADMIN', NOW()),
('정기술',  'N', @pw, 'jung.tech@erica.com',      '010-5555-6666', 1, 'Y', '기술지원부','기술2팀', 1, '재직', 'ADMIN', NOW()),
('강물류',  'N', @pw, 'kang.logistics@erica.com', '010-6666-7777', 1, 'Y', '물류부',   '물류1팀', 1, '재직', 'ADMIN', NOW()),
('조물류',  'N', @pw, 'cho.logistics@erica.com',  '010-7777-8888', 1, 'N', '물류부',   '물류2팀', 1, '재직', 'ADMIN', NOW()),
('윤관리',  'N', @pw, 'yoon.admin@erica.com',     '010-8888-9999', 1, 'Y', '관리부',   '총무팀',  1, '재직', 'ADMIN', NOW()),
('장인사',  'N', @pw, 'jang.hr@erica.com',        '010-9999-0000', 1, 'Y', '관리부',   '인사팀',  2, '재직', 'ADMIN', NOW()),
('한개인',  'N', @pw, 'han.personal@erica.com',   '010-1234-5678', 1, 'N', '영업부',   '영업1팀', 1, '재직', 'ADMIN', NOW()),
('오휴직',  'N', @pw, 'oh.leave@erica.com',       '010-2345-6789', 1, 'Y', '기술지원부','기술1팀', 1, '휴직', 'ADMIN', NOW()),
('임퇴직',  'N', @pw, 'lim.retired@erica.com',    '010-3456-7890', 1, 'Y', '관리부',   '총무팀',  1, '퇴직', 'ADMIN', NOW());

-- ============ MANAGER (지점 담당자 6명) ============
INSERT INTO manager (branch_id, manager_name, department, team, rank_name, email, phone, work_status, is_company) VALUES
(1, '김강남',  '영업부',    '영업1팀', '팀장',  'kim.gn@erica.com',   '010-1001-0001', '재직', 'Y'),
(1, '이강남',  '기술지원부','기술1팀', '사원',  'lee.gn@erica.com',   '010-1001-0002', '재직', 'Y'),
(2, '박강북',  '영업부',    '영업2팀', '팀장',  'park.gb@erica.com',  '010-2001-0001', '재직', 'Y'),
(3, '최해운대','물류부',    '물류1팀', '지점장','choi.hd@erica.com',  '010-3001-0001', '재직', 'Y'),
(4, '정대구',  '관리부',    '총무팀',  '팀장',  'jung.dg@erica.com',  '010-4001-0001', '재직', 'Y'),
(5, '강인천',  '영업부',    '영업1팀', '팀장',  'kang.ic@erica.com',  '010-5001-0001', '재직', 'Y');

-- ============ DEVICE (기기 15대) ============
-- device_status: 0=사용가능, 1=대여중, 3=AS중
INSERT INTO device (model_id, branch_id, device_status, battery_level, receive_date, user_id, center_id) VALUES
-- 사용가능 (1~5번)
(1, 1, 0, 95, '2024-03-01 09:00:00', 3, 1),
(1, 1, 0, 88, '2024-03-01 09:00:00', 3, 1),
(2, 2, 0,100, '2024-04-01 09:00:00', 3, 1),
(3, 3, 0, 72, '2024-05-01 09:00:00', 3, 1),
(4, 4, 0, 61, '2024-05-15 09:00:00', 3, 1),
-- 대여중 (6~10번)
(1, 1, 1, 45, '2024-03-01 09:00:00', 3, 1),
(2, 2, 1, 30, '2024-04-01 09:00:00', 3, 1),
(2, 3, 1, 55, '2024-04-15 09:00:00', 3, 1),
(3, 4, 1, 80, '2024-05-01 09:00:00', 3, 1),
(4, 5, 1, 25, '2024-05-20 09:00:00', 3, 1),
-- 반납완료 이력 보유 (11~13번)
(1, 2, 0, 90, '2024-02-01 09:00:00', 3, 1),
(3, 3, 0, 77, '2024-02-15 09:00:00', 3, 1),
(4, 5, 0, 83, '2024-03-01 09:00:00', 3, 1),
-- AS중 (14~15번)
(2, 1, 3, 10, '2024-06-01 09:00:00', 3, 1),
(4, 4, 3,  5, '2024-06-10 09:00:00', 3, 1);

-- ============ RENTAL (대여 이력 9건) ============
-- status_rent: 0=대기, 1=대여중, 2=회수중, 3=반납완료, 9=취소
INSERT INTO rental (device_id, branch_id, status_rent, req_date, exp_start_date, exp_return_date, receipt_date, return_date, is_worn, user_id) VALUES
-- 현재 대여중 (device 6~10)
( 6, 1, 1, '2025-05-01 10:00:00', '2025-05-03 09:00:00', '2025-08-01 18:00:00', '2025-05-03 09:00:00', NULL,                   'N', (SELECT user_id FROM user WHERE email='kim.sales@erica.com')),
( 7, 2, 1, '2025-05-05 10:00:00', '2025-05-07 09:00:00', '2025-08-05 18:00:00', '2025-05-07 09:00:00', NULL,                   'N', (SELECT user_id FROM user WHERE email='lee.sales@erica.com')),
( 8, 3, 1, '2025-05-10 10:00:00', '2025-05-12 09:00:00', '2025-08-10 18:00:00', '2025-05-12 09:00:00', NULL,                   'N', (SELECT user_id FROM user WHERE email='choi.tech@erica.com')),
( 9, 4, 1, '2025-05-15 10:00:00', '2025-05-17 09:00:00', '2025-08-15 18:00:00', '2025-05-17 09:00:00', NULL,                   'N', (SELECT user_id FROM user WHERE email='kang.logistics@erica.com')),
(10, 5, 1, '2025-05-20 10:00:00', '2025-05-22 09:00:00', '2025-08-20 18:00:00', '2025-05-22 09:00:00', NULL,                   'N', (SELECT user_id FROM user WHERE email='park.branch@erica.com')),
-- 반납완료 (device 11~13)
(11, 2, 3, '2025-01-10 10:00:00', '2025-01-12 09:00:00', '2025-04-10 18:00:00', '2025-01-12 09:00:00', '2025-04-08 15:00:00', 'N', (SELECT user_id FROM user WHERE email='jung.tech@erica.com')),
(12, 3, 3, '2025-02-01 10:00:00', '2025-02-03 09:00:00', '2025-05-01 18:00:00', '2025-02-03 09:00:00', '2025-04-28 15:00:00', 'N', (SELECT user_id FROM user WHERE email='yoon.admin@erica.com')),
(13, 5, 3, '2025-03-01 10:00:00', '2025-03-03 09:00:00', '2025-06-01 18:00:00', '2025-03-03 09:00:00', '2025-05-30 15:00:00', 'Y', (SELECT user_id FROM user WHERE email='han.personal@erica.com')),
-- 취소
( 1, 1, 9, '2025-04-01 10:00:00', '2025-04-03 09:00:00', '2025-07-01 18:00:00', NULL,                   NULL,                   'N', (SELECT user_id FROM user WHERE email='cho.logistics@erica.com'));

-- ============ DEVICE AS (AS 이력 4건) ============
-- status_as: 1=접수, 2=수거완료, 9=완료 / type_as: 1=일반, 2=긴급
INSERT INTO device_as (device_id, branch_id, status_as, type_as, receipt_date, receipt_details, checker_name, collection_date, manager_name, repair_details, completion_date, user_id) VALUES
(14, 1, 2, 2, '2026-06-05 09:00:00', '화면 파손 및 배터리 불량',  '김기술', '2026-06-06 10:00:00', '이수리', NULL,               NULL,                   (SELECT user_id FROM user WHERE email='choi.tech@erica.com')),
(15, 4, 1, 2, '2026-06-10 09:00:00', '전원 불량 및 충전 안 됨',   '박기술', NULL,                   NULL,     NULL,               NULL,                   (SELECT user_id FROM user WHERE email='jung.tech@erica.com')),
( 6, 1, 9, 1, '2025-03-15 09:00:00', '배터리 성능 저하',           '최기술', '2025-03-16 10:00:00', '김수리', '배터리 교체 완료', '2025-03-20 15:00:00', (SELECT user_id FROM user WHERE email='kim.sales@erica.com')),
( 7, 2, 9, 1, '2025-02-01 09:00:00', '화면 터치 불량',             '이기술', '2025-02-02 10:00:00', '박수리', '터치 패널 교체 완료', '2025-02-10 15:00:00', (SELECT user_id FROM user WHERE email='lee.sales@erica.com'));

-- ============ DEVICE LOG (사용 로그 7건) ============
INSERT INTO device_log (device_id, last_used_date, usage_time_per_day, total_usage_time, resp_rate_per_day, steps_per_day, total_steps, last_location, user_id) VALUES
( 6, NOW(),                     120, 3600,  98, 5200, 156000, '서울특별시 강남구',    (SELECT user_id FROM user WHERE email='kim.sales@erica.com')),
( 7, NOW(),                      90, 2700,  95, 4800, 144000, '서울특별시 강북구',    (SELECT user_id FROM user WHERE email='lee.sales@erica.com')),
( 8, NOW(),                     150, 4500,  99, 6100, 183000, '부산광역시 해운대구',  (SELECT user_id FROM user WHERE email='choi.tech@erica.com')),
( 9, NOW(),                      80, 2400,  92, 3900, 117000, '대구광역시 중구',      (SELECT user_id FROM user WHERE email='kang.logistics@erica.com')),
(10, NOW(),                     110, 3300,  97, 5500, 165000, '인천광역시 부평구',    (SELECT user_id FROM user WHERE email='park.branch@erica.com')),
(11, '2025-04-08 10:00:00',      75, 6750,  88, 4200, 378000, '서울특별시 강북구',    (SELECT user_id FROM user WHERE email='jung.tech@erica.com')),
(12, '2025-04-28 10:00:00',      60, 5400,  91, 3500, 315000, '부산광역시 해운대구',  (SELECT user_id FROM user WHERE email='yoon.admin@erica.com'));

SET FOREIGN_KEY_CHECKS=1;
