# 임대 관리 시스템 API 명세서

> **Base URL:** `http://localhost:8081/api`  
> **Content-Type:** `application/json`  
> **작성일:** 2026-05-30  
> **DB 버전:** v3.1

---

## 공통 응답 규격 (Common Response)

모든 API는 아래 구조로 응답합니다.

```json
{
  "status": 200,
  "message": "Success",
  "data": { }
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| status | Integer | HTTP 상태 코드 (200, 400, 500 등) |
| message | String | 처리 결과 메시지 |
| data | Object \| Array \| null | 실제 반환 데이터 |

### 공통 에러 응답

| HTTP 상태 | message | 원인 |
|-----------|---------|------|
| 400 | Bad Request | 필수 파라미터 누락, 유효성 검사 실패 |
| 404 | Not Found | 요청한 리소스 없음 |
| 500 | Internal Server Error | 서버 내부 오류 |

---

## 1. 사용자 관리 (User)

### USR-001 사용자 등록

**`POST`** `/users`

신규 사용자 계정 생성

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| user_name | String | ✅ | 1~50자 | 사용자 이름 |
| email | String | ✅ | 이메일 형식, 최대 100자, **중복 불가** | 이메일 |
| user_password | String | ✅ | 최대 255자 | 비밀번호 |
| phone | String | ✅ | 숫자/하이픈, 최대 15자 | 전화번호 |
| center_id | Integer | ❌ | 양수, `center` 테이블에 존재 | 소속 센터 ID |
| is_company | String | ✅ | `"Y"` 또는 `"N"` | 기업(Y) / 개인(N) |

#### Request 예시

```json
{
  "user_name": "홍길동",
  "email": "hong@example.com",
  "user_password": "password123",
  "phone": "010-1234-5678",
  "center_id": 1,
  "is_company": "N"
}
```

#### Response (200)

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "user_id": 10,
    "user_name": "홍길동",
    "email": "hong@example.com",
    "phone": "010-1234-5678",
    "center_id": 1,
    "is_company": "N",
    "is_deleted": "N",
    "created_at": "2026-05-30T10:00:00"
  }
}
```

---

### USR-002 사용자 목록 조회

**`GET`** `/users`

소속 센터별 / 유형별 사용자 목록 조회

#### Query Parameters

| 파라미터 | 타입 | 필수 | 유효성 검사 | 설명 |
|----------|------|:----:|------------|------|
| center_id | Integer | ❌ | 양수 | 센터 ID |
| is_company | String | ❌ | `"Y"` 또는 `"N"` | 기업/개인 구분 |
| department | String | ❌ | 최대 100자 | 부서명 |
| team | String | ❌ | 최대 100자 | 팀명 |

#### Response (200) — `data`: User[]

---

### USR-003 사용자 정보 수정

**`PATCH`** `/users/{user_id}`

사용자 프로필 및 활성 상태 변경

#### Path Parameter

| 파라미터 | 타입 | 필수 | 유효성 검사 |
|----------|------|:----:|------------|
| user_id | Integer | ✅ | 양수, `user` 테이블에 존재 |

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| user_name | String | ❌ | 1~50자 | 사용자 이름 |
| phone | String | ❌ | 숫자/하이픈, 최대 15자 | 전화번호 |
| is_deleted | String | ❌ | `"Y"` 또는 `"N"` | 활성(N) / 비활성(Y) |

---

## 2. 지점 담당자 관리 (Manager)

### MGR-001 담당자 등록

**`POST`** `/managers`

지점에 소속된 담당자 정보 등록

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| branch_id | Integer | ✅ | 양수, `branch` 테이블에 존재 | 소속 지점 ID |
| name | String | ✅ | 1~50자 | 담당자명 |
| contact | String | ❌ | 숫자/하이픈, 최대 15자 | 연락처 |
| email | String | ✅ | 이메일 형식, 최대 100자 | 이메일 |
| is_main | String | ✅ | `"Y"` 또는 `"N"` | 주담당자(Y) / 부담당자(N) |

---

### MGR-002 담당자 목록 조회

**`GET`** `/managers`

특정 지점의 모든 담당자 목록 조회

#### Query Parameters

| 파라미터 | 타입 | 필수 | 유효성 검사 | 설명 |
|----------|------|:----:|------------|------|
| branch_id | Integer | ✅ | 양수 | 지점 ID |

---

### MGR-003 담당자 정보 수정

**`PATCH`** `/managers/{manager_id}`

담당자 연락처 및 주/부 권한 수정

#### Path Parameter

| 파라미터 | 타입 | 필수 | 유효성 검사 |
|----------|------|:----:|------------|
| manager_id | Integer | ✅ | 양수, `manager` 테이블에 존재 |

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| name | String | ❌ | 1~50자 | 담당자명 |
| contact | String | ❌ | 숫자/하이픈, 최대 15자 | 연락처 |
| is_main | String | ❌ | `"Y"` 또는 `"N"` | 주/부 담당자 여부 |

---

## 3. 디바이스 모델 관리 (Model)

### MDL-001 모델 등록

**`POST`** `/models`

신규 디바이스 모델 정보 생성

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| model_name | String | ✅ | 1~100자 | 모델명 |
| version | String | ❌ | 최대 50자 | 버전 |
| manual_url | String | ❌ | URL 형식 | 메뉴얼 다운로드 경로 |

---

### MDL-002 모델 목록 조회

**`GET`** `/models`

전체 디바이스 모델 정보 조회

#### Query Parameters

| 파라미터 | 타입 | 필수 | 유효성 검사 | 설명 |
|----------|------|:----:|------------|------|
| is_deleted | String | ❌ | `"Y"` 또는 `"N"` | 활성 여부 필터 |

> **정렬:** 모델명 기준  
> ⚠️ **현재 구현 엔드포인트:** `/device-models` (명세와 경로 상이)

---

### MDL-003 모델 정보 수정

**`PATCH`** `/models/{model_id}`

특정 모델의 부분 정보 수정

#### Path Parameter

| 파라미터 | 타입 | 필수 | 유효성 검사 |
|----------|------|:----:|------------|
| model_id | Integer | ✅ | 양수, `device_model` 테이블에 존재 |

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| model_name | String | ❌ | 1~100자 | 모델명 |
| version | String | ❌ | 최대 50자 | 버전 |
| manual_url | String | ❌ | URL 형식 | 메뉴얼 경로 |

---

### MDL-004 모델 삭제

**`DELETE`** `/models/{model_id}`

모델 논리적 삭제 처리

#### Path Parameter

| 파라미터 | 타입 | 필수 | 유효성 검사 |
|----------|------|:----:|------------|
| model_id | Integer | ✅ | 양수, `device_model` 테이블에 존재 |

> **연쇄 처리:** `is_deleted = 'Y'` 설정 시 해당 모델을 참조하는 `device` 데이터도 조회 불가 상태로 자동 변경됨

---

## 4. 디바이스 현황 (Device)

### DEV-001 디바이스 등록

**`POST`** `/devices`

신규 디바이스 할당 및 정보 생성

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| model_id | Integer | ✅ | 양수, `device_model` 테이블에 존재 | 모델 ID |
| branch_id | Integer | ✅ | 양수, `branch` 테이블에 존재 | 배정 지점 ID |
| user_id | Integer | ✅ | 양수, `user` 테이블에 존재 | 사용자 ID |
| center_id | Integer | ❌ | 양수, `center` 테이블에 존재 | 센터 ID |
| device_status | Integer | ❌ | `0, 1, 2, 3, 4, 9` 중 하나, 기본값 `0` | 기기 상태 |
| battery_level | Integer | ❌ | `0` 이상 `100` 이하, 기본값 `100` | 배터리(%) |
| receive_date | String | ❌ | ISO 8601 (`yyyy-MM-ddTHH:mm:ss`) | 입고일 |
| dispatch_date | String | ❌ | ISO 8601 | 지점발송일 |
| device_specs | String | ❌ | - | 상세 스펙 |

> **device_status 코드표**
> | 값 | 의미 |
> |----|------|
> | 0 | 입고 |
> | 1 | 임대중 |
> | 2 | 임대대기 |
> | 3 | AS접수 |
> | 4 | AS완료 |
> | 9 | 폐기 |

#### Response (200)

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "device_id": 5,
    "model_id": 1,
    "model_name": "ERICA-W1",
    "branch_id": 2,
    "branch_name": "서울지점",
    "device_status": 0,
    "battery_level": 100,
    "receive_date": "2026-05-30T09:00:00",
    "created_at": "2026-05-30T09:00:00"
  }
}
```

---

### DEV-002 디바이스 목록 조회

**`GET`** `/devices`

지점별 디바이스 및 모델 정보 목록 조회

#### Query Parameters

| 파라미터 | 타입 | 필수 | 유효성 검사 | 설명 |
|----------|------|:----:|------------|------|
| branch_id | Integer | ❌ | 양수 | 지점 ID 필터 |
| device_status | Integer | ❌ | `0, 1, 2, 3, 4, 9` 중 하나 | 상태 필터 |

> **정렬:** 입고일(`receive_date`), 최근 임대일(`last_rental_date`)

---

### DEV-003 디바이스 상세 조회

**`GET`** `/devices/{device_id}`

특정 디바이스의 상세 제원 및 상태 정보 조회

#### Path Parameter

| 파라미터 | 타입 | 필수 | 유효성 검사 |
|----------|------|:----:|------------|
| device_id | Integer | ✅ | 양수, `device` 테이블에 존재 |

---

### DEV-004 디바이스 정보 수정

**`PATCH`** `/devices/{device_id}`

특정 디바이스 상태 및 정보 부분 업데이트

#### Path Parameter

| 파라미터 | 타입 | 필수 | 유효성 검사 |
|----------|------|:----:|------------|
| device_id | Integer | ✅ | 양수, `device` 테이블에 존재 |

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| device_status | Integer | ❌ | `0, 1, 2, 3, 4, 9` 중 하나 | 기기 상태 |
| battery_level | Integer | ❌ | `0` 이상 `100` 이하 | 배터리(%) |
| branch_id | Integer | ❌ | 양수, `branch` 테이블에 존재 | 배정 지점 변경 |

---

### DEV-005 디바이스 삭제

**`DELETE`** `/devices/{device_id}`

디바이스 논리적 삭제 처리 (`deleted_at` 갱신)

#### Path Parameter

| 파라미터 | 타입 | 필수 | 유효성 검사 |
|----------|------|:----:|------------|
| device_id | Integer | ✅ | 양수, `device` 테이블에 존재 |

---

### DEV-006 디바이스 수량 통계

**`GET`** `/devices/stats/count`

모델별 / 지점별 디바이스 총수량 및 상태별 수량 집계 반환

#### Query Parameters

| 파라미터 | 타입 | 필수 | 유효성 검사 | 설명 |
|----------|------|:----:|------------|------|
| branch_id | Integer | ❌ | 양수 | 지점 필터 |
| model_id | Integer | ❌ | 양수 | 모델 필터 |

#### Response (200) 예시

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "total": 50,
    "by_status": {
      "입고": 10,
      "임대중": 25,
      "임대대기": 8,
      "AS접수": 3,
      "AS완료": 2,
      "폐기": 2
    }
  }
}
```

---

## 5. 디바이스 AS 관리 (AS)

### AS-001 AS 내역 등록

**`POST`** `/as`

신규 AS 건 접수

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| device_id | Integer | ✅ | 양수, `device` 테이블에 존재 | 디바이스 ID |
| user_id | Integer | ✅ | 양수, `user` 테이블에 존재 | 접수자 ID |
| type_as | Integer | ✅ | `0, 1, 2, 3, 9` 중 하나 | AS 유형 |
| receipt_details | String | ❌ | - | 접수내역 |
| checker_name | String | ❌ | 최대 50자 | 확인자명 |
| rental_id | Integer | ❌ | 양수, `rental` 테이블에 존재 | 연관 임대 이력 |
| branch_id | Integer | ✅ | 양수, `branch` 테이블에 존재 | AS 발생 지점 |

> **type_as 코드표**
> | 값 | 의미 |
> |----|------|
> | 0 | 파손 |
> | 1 | 침수 |
> | 2 | 소프트웨어 |
> | 3 | 기타 |
> | 9 | 불명 |

---

### AS-002 AS 목록 기간 조회

**`GET`** `/as`

설정한 기간 내의 접수/완료된 AS 목록 조회

#### Query Parameters

| 파라미터 | 타입 | 필수 | 유효성 검사 | 설명 |
|----------|------|:----:|------------|------|
| start_date | String | ✅ | `yyyy-MM-dd` 형식 | 조회 시작일 |
| end_date | String | ✅ | `yyyy-MM-dd` 형식, `start_date` 이후 | 조회 종료일 |
| branch_id | Integer | ❌ | 양수 | 지점 필터 |
| status_as | Integer | ❌ | `0, 1, 2, 3, 9` 중 하나 | AS 상태 필터 |
| type_as | Integer | ❌ | `0, 1, 2, 3, 9` 중 하나 | AS 유형 필터 |

> **정렬:** 접수일(`receipt_date`)  
> **status_as 코드표**
> | 값 | 의미 |
> |----|------|
> | 0 | 이상무 |
> | 1 | 접수 |
> | 2 | 진행중 |
> | 3 | 완료 |
> | 9 | 취소 |

---

### AS-003 AS 상세 내역 조회

**`GET`** `/as/{as_id}`

특정 AS 건의 수리 내역, 완료일 등 상세 조회

#### Path Parameter

| 파라미터 | 타입 | 필수 | 유효성 검사 |
|----------|------|:----:|------------|
| as_id | Integer | ✅ | 양수, `device_as` 테이블에 존재 |

---

### AS-004 AS 진행 상태 수정

**`PATCH`** `/as/{as_id}`

AS 처리 상태 부분 업데이트

#### Path Parameter

| 파라미터 | 타입 | 필수 | 유효성 검사 |
|----------|------|:----:|------------|
| as_id | Integer | ✅ | 양수, `device_as` 테이블에 존재 |

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| status_as | Integer | ❌ | `0, 1, 2, 3, 9` 중 하나 | AS 상태 |
| repair_details | String | ❌ | - | 수리 내역 |
| completion_date | String | ❌ | ISO 8601 | 완료일 |
| collection_date | String | ❌ | ISO 8601 | 수거일 |
| redispatch_date | String | ❌ | ISO 8601 | 재발송일 |

---

## 6. 디바이스 임대 현황 (Rental)

### RNT-001 임대 신청 등록

**`POST`** `/rentals`

디바이스 임대 신청 정보 생성

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| device_id | Integer | ✅ | 양수, `device` 테이블에 존재 | 디바이스 ID |
| branch_id | Integer | ✅ | 양수, `branch` 테이블에 존재 | 임대 지점 ID |
| user_id | Integer | ✅ | 양수, `user` 테이블에 존재 | 신청자 ID |
| exp_start_date | String | ❌ | ISO 8601 | 사용예정시작일 |
| exp_return_date | String | ✅ | ISO 8601, `exp_start_date` 이후 | 반납예정일 |

---

### RNT-002 임대 현황 목록 조회

**`GET`** `/rentals`

지점별 / 상태별 전체 임대 진행 현황 조회

#### Query Parameters

| 파라미터 | 타입 | 필수 | 유효성 검사 | 설명 |
|----------|------|:----:|------------|------|
| status_rent | Integer | ❌ | `0, 1, 2, 3, 9` 중 하나 | 임대 상태 필터 |
| branch_id | Integer | ❌ | 양수 | 지점 필터 |
| model_id | Integer | ❌ | 양수 | 모델 필터 |

> **정렬:** 신청일(`req_date`), 반납예정일(`exp_return_date`)  
> **status_rent 코드표**
> | 값 | 의미 |
> |----|------|
> | 0 | 신청 |
> | 1 | 수령대기 |
> | 2 | 임대중(사용중) |
> | 3 | 반납완료 |
> | 9 | 취소 |

---

### RNT-003 신청자별 임대 이력 조회

**`GET`** `/rentals/history/{user_id}`

특정 사용자의 과거 및 현재 임대 이력 조회

#### Path Parameter

| 파라미터 | 타입 | 필수 | 유효성 검사 |
|----------|------|:----:|------------|
| user_id | Integer | ✅ | 양수, `user` 테이블에 존재 |

#### Query Parameters

| 파라미터 | 타입 | 필수 | 유효성 검사 | 설명 |
|----------|------|:----:|------------|------|
| status_rent | Integer | ❌ | `0, 1, 2, 3, 9` 중 하나 | 임대 상태 필터 |

> **정렬:** 임대일자(`req_date`)

---

### RNT-004 임대 상태 수정

**`PATCH`** `/rentals/{rental_id}`

임대 진행 상태 변경 및 정보 부분 수정

#### Path Parameter

| 파라미터 | 타입 | 필수 | 유효성 검사 |
|----------|------|:----:|------------|
| rental_id | Integer | ✅ | 양수, `rental` 테이블에 존재 |

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| status_rent | Integer | ❌ | `0, 1, 2, 3, 9` 중 하나 | 임대 상태 |
| receipt_date | String | ❌ | ISO 8601 | 실제 수령일 |
| return_date | String | ❌ | ISO 8601, `receipt_date` 이후 | 실제 반납일 |
| is_worn | String | ❌ | `"Y"` 또는 `"N"` | 착용 여부 |

---

## 7. 디바이스 사용 생체 정보 (Log & Emergency)

### LOG-001 생체 정보 기록

**`POST`** `/logs`

디바이스에서 측정된 사용자 생체 정보 및 위치 저장

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| device_id | Integer | ✅ | 양수, `device` 테이블에 존재 | 디바이스 ID |
| user_id | Integer | ✅ | 양수, `user` 테이블에 존재 | 사용자 ID |
| usage_time_per_day | Integer | ❌ | 0 이상, 분 단위 (MEDIUMINT: 최대 8,388,607) | 일별 사용시간(분) |
| resp_rate_per_day | Integer | ❌ | 0 이상 (MEDIUMINT) | 일별 호흡수 |
| steps_per_day | Integer | ❌ | 0 이상 (MEDIUMINT) | 일별 걸음수 |
| last_location | String | ❌ | - | 최근 사용자 위치 |

---

### LOG-002 사용자 생체 목록 조회

**`GET`** `/logs/{user_id}`

특정 사용자의 누적 생체 데이터 조회

#### Path Parameter

| 파라미터 | 타입 | 필수 | 유효성 검사 |
|----------|------|:----:|------------|
| user_id | Integer | ✅ | 양수, `user` 테이블에 존재 |

#### Query Parameters

| 파라미터 | 타입 | 필수 | 유효성 검사 | 설명 |
|----------|------|:----:|------------|------|
| start_date | String | ❌ | `yyyy-MM-dd` 형식 | 조회 시작일 |
| end_date | String | ❌ | `yyyy-MM-dd` 형식, `start_date` 이후 | 조회 종료일 |

> **정렬:** 생성일시(`created_at`)

---

### EMG-001 응급 상황 등록

**`POST`** `/emergencies`

과호흡, 낙상 등 응급 상황 발생 시 기록 생성

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| user_id | Integer | ✅ | 양수, `user` 테이블에 존재 | 사용자 ID |
| device_id | Integer | ✅ | 양수, `device` 테이블에 존재 | 디바이스 ID |
| type_emergency | String | ❌ | 최대 50자 (예: `"과호흡"`, `"낙상"`) | 응급 유형 |
| location_address | String | ❌ | - | 응급 발생 주소 |

> 등록 시 `status_emergency = 0` (대기), `severity_emergency = 0` (낮음) 으로 자동 설정

---

### EMG-002 응급 상황 처리 수정

**`PATCH`** `/emergencies/{emergency_id}`

응급 상황 확인 및 조치 결과 부분 수정

#### Path Parameter

| 파라미터 | 타입 | 필수 | 유효성 검사 |
|----------|------|:----:|------------|
| emergency_id | Integer | ✅ | 양수, `emergency` 테이블에 존재 |

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| status_emergency | Integer | ❌ | `0, 1, 2` 중 하나 | 처리 상태 |
| severity_emergency | Integer | ❌ | `0, 1, 2` 중 하나 | 심각도 |
| resolved_time | String | ❌ | ISO 8601 | 종료 시각 |

> **status_emergency 코드표**
> | 값 | 의미 |
> |----|------|
> | 0 | 대기 |
> | 1 | 오탐 |
> | 2 | 처리완료 |
>
> **severity_emergency 코드표**
> | 값 | 의미 |
> |----|------|
> | 0 | 낮음 |
> | 1 | 중간 |
> | 2 | 높음 |

---

## 8. 지점 관리 (Branch)

### BCH-001 지점 등록

**`POST`** `/branches`

신규 임대 지점 생성

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| branch_name | String | ✅ | 1~100자 | 지점명 |
| main_phone | String | ❌ | 숫자/하이픈, 최대 15자 | 대표전화번호 |
| address | String | ❌ | - | 주소 |
| detail_address | String | ❌ | 최대 255자 | 상세주소 |
| manager_name | String | ❌ | 최대 50자 | 지점장명 |

---

### BCH-002 지점 목록 조회

**`GET`** `/branches`

운영 중인 지점 목록 정보 조회

#### Query Parameters

| 파라미터 | 타입 | 필수 | 유효성 검사 | 설명 |
|----------|------|:----:|------------|------|
| status_center | String | ❌ | `"활성"` 또는 `"비활성"` | 지점 상태 필터 |

> **정렬:** 지점번호(`branch_id`)  
> **주의:** 서버 내부적으로 `"활성"` → `"Y"`, `"비활성"` → `"N"` 으로 변환 처리됨

---

### BCH-003 지점 정보 수정

**`PATCH`** `/branches/{branch_id}`

지점 상태 및 기본 정보 부분 업데이트 (수정할 값만 전달)

#### Path Parameter

| 파라미터 | 타입 | 필수 | 유효성 검사 |
|----------|------|:----:|------------|
| branch_id | Integer | ✅ | 양수, `branch` 테이블에 존재 |

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| branch_name | String | ❌ | 1~100자 | 지점명 |
| status_center | String | ❌ | `"Y"` 또는 `"N"` | 활성(Y) / 비활성(N) |
| main_phone | String | ❌ | 숫자/하이픈, 최대 15자 | 대표전화번호 |
| address | String | ❌ | - | 주소 |

---

## 9. 센터 정보 (Center)

### SYS-001 센터 등록

**`POST`** `/centers`

신규 센터 정보 및 사업자 등록 내역 생성

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| center_name | String | ✅ | 1~100자 | 센터명 |
| biz_reg_no | String | ❌ | 12자 고정 (`CHAR(12)`), **중복 불가** | 사업자등록번호 |
| director_name | String | ❌ | 최대 50자 | 센터장명 |
| address | String | ❌ | - | 주소 |

---

### SYS-002 센터 정보 상세 조회

**`GET`** `/centers/{center_id}`

특정 센터의 기본 정보 및 상세 정보 조회

#### Path Parameter

| 파라미터 | 타입 | 필수 | 유효성 검사 |
|----------|------|:----:|------------|
| center_id | Integer | ✅ | 양수, `center` 테이블에 존재 |

---

### SYS-003 센터 정보 수정

**`PATCH`** `/centers/{center_id}`

센터의 연락처 등 정보 부분 업데이트

#### Path Parameter

| 파라미터 | 타입 | 필수 | 유효성 검사 |
|----------|------|:----:|------------|
| center_id | Integer | ✅ | 양수, `center` 테이블에 존재 |

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| center_name | String | ❌ | 1~100자 | 센터명 |
| center_short_name | String | ❌ | 최대 50자 | 센터명 약칭 |
| eng_name | String | ❌ | 최대 100자 | 영문센터명 |
| director_name | String | ❌ | 최대 50자 | 센터장명 |
| main_phone | String | ❌ | 숫자/하이픈, 최대 15자 | 대표전화번호 |
| main_fax | String | ❌ | 숫자/하이픈, 최대 15자 | 대표팩스번호 |
| biz_type | String | ❌ | 최대 50자 | 업태 |
| biz_category | String | ❌ | 최대 50자 | 업종 |
| tax_mgr_name | String | ❌ | 최대 50자 | 세금계산서 담당자명 |
| logo_img_url | String | ❌ | 최대 255자, URL 형식 | 로고 이미지 URL |
| seal_img_url | String | ❌ | 최대 255자, URL 형식 | 직인 이미지 URL |

---

### SYS-004 이미지 파일 업로드

**`POST`** `/centers/upload`

센터 직인, 로고 등 이미지 파일 업로드

> **Content-Type:** `multipart/form-data`

#### Request Form Data

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| center_id | Integer | ✅ | 양수, `center` 테이블에 존재 | 센터 ID |
| image_file | File | ✅ | 이미지 형식 (`jpg`, `jpeg`, `png`, `gif`), 최대 10MB | 업로드 이미지 |

#### Response (200) 예시

```json
{
  "status": 200,
  "message": "Upload Success",
  "data": {
    "image_url": "/uploads/centers/1/logo_20260530.png"
  }
}
```

---

## 10. 조직 관리 (Department / Team)

> **명세서 외 구현 API** — 화면설계서 7번(부서/팀), 8번(담당직원) 화면 대응

### DEPT-001 부서 목록 조회

**`GET`** `/depts`

전체 부서 목록 조회

#### Response (200) — `data`: Department[]

```json
{
  "dept_id": 1,
  "dept_name": "경영",
  "sort_order": 1,
  "is_used": "Y",
  "apply_date": "2025-01-01T00:00:00"
}
```

---

### DEPT-002 부서 등록

**`POST`** `/depts`

신규 부서 생성

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| dept_name | String | ✅ | 1~100자 | 부서명 |
| sort_order | Integer | ❌ | 0 이상 | 정렬 순서 |
| is_used | String | ❌ | `"Y"` 또는 `"N"`, 기본값 `"Y"` | 사용 여부 |
| apply_date | String | ❌ | `yyyy-MM-dd` 형식 | 생성 적용일 |

---

### TEAM-001 팀 목록 조회

**`GET`** `/teams`

특정 부서의 팀 목록 조회

#### Query Parameters

| 파라미터 | 타입 | 필수 | 유효성 검사 | 설명 |
|----------|------|:----:|------------|------|
| dept_id | Integer | ✅ | 양수, `department` 테이블에 존재 | 부서 ID |

---

### TEAM-002 팀 등록

**`POST`** `/teams`

신규 팀 생성

#### Request Body

| 필드 | 타입 | 필수 | 유효성 검사 | 설명 |
|------|------|:----:|------------|------|
| dept_id | Integer | ✅ | 양수, `department` 테이블에 존재 | 소속 부서 ID |
| team_name | String | ✅ | 1~100자 | 팀명 |
| sort_order | Integer | ❌ | 0 이상 | 정렬 순서 |
| is_used | String | ❌ | `"Y"` 또는 `"N"`, 기본값 `"Y"` | 사용 여부 |
| apply_date | String | ❌ | `yyyy-MM-dd` 형식 | 생성 적용일 |

---

## 구현 현황 요약

| API ID | 엔드포인트 | 구현 여부 | 비고 |
|--------|------------|:---------:|------|
| USR-001~003 | /users | ✅ | |
| MGR-001~002 | /managers | ✅ | |
| MGR-003 | /managers/{id} | ❌ | 미구현 |
| MDL-001 | POST /models | ❌ | 미구현 |
| MDL-002 | GET /models | ⚠️ | `/device-models` 로 구현 (경로 상이) |
| MDL-003~004 | /models/{id} | ❌ | 미구현 |
| DEV-001~002, 004~005 | /devices | ✅ | |
| DEV-003 | /devices/{id} | ❌ | 미구현 |
| DEV-006 | /devices/stats/count | ❌ | 미구현 |
| AS-001, 004 | /as | ✅ | |
| AS-002 | GET /as | ⚠️ | 기간 파라미터(start_date, end_date) 미처리 |
| AS-003 | GET /as/{id} | ❌ | 미구현 |
| RNT-001~004 | /rentals | ✅ | |
| LOG-001 | POST /logs | ❌ | 미구현 |
| LOG-002 | GET /logs/{user_id} | ⚠️ | `GET /logs` 전체 조회만 구현 |
| EMG-001~002 | /emergencies | ❌ | 미구현 |
| BCH-001~003 | /branches | ✅ | |
| SYS-001 | POST /centers | ❌ | 미구현 |
| SYS-002~003 | /centers/{id} | ✅ | |
| SYS-004 | /centers/upload | ❌ | 미구현 |
| DEPT-001~002 | /depts | ✅ | 명세 외 구현 |
| TEAM-001~002 | /teams | ✅ | 명세 외 구현 |
