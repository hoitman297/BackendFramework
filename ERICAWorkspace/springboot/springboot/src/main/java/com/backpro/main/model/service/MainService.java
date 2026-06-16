package com.backpro.main.model.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.backpro.main.model.dao.*;
import com.backpro.main.model.dto.*;
import com.backpro.main.model.vo.*;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
@Transactional
@RequiredArgsConstructor
public class MainService {

    private final DeviceMapper deviceMapper;
    private final RentalMapper rentalMapper;
    private final DeviceASMapper deviceASMapper;
    private final UserMapper userMapper;
    private final DeviceLogMapper deviceLogMapper;
    private final CenterMapper centerMapper;
    private final BranchMapper branchMapper;
    private final ManagerMapper managerMapper;
    private final DeviceModelMapper deviceModelMapper;
    private final DepartmentMapper departmentMapper;
    private final TeamMapper teamMapper;
    private final EmergencyMapper emergencyMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    // ========== Organization (DEPT/TEAM) ==========

    @Transactional(readOnly = true)
    public List<Department> getAllDepartments() {
        return departmentMapper.findAll();
    }

    public Department saveDepartment(Department dept) {
        departmentMapper.insert(dept);
        return dept;
    }

    @Transactional(readOnly = true)
    public List<Team> getTeamsByDept(Long deptId) {
        return teamMapper.findByDeptId(deptId);
    }

    public Team saveTeam(Team team) {
        teamMapper.insert(team);
        return team;
    }

    public Department updateDepartment(Long id, Department dept) {
        dept.setDeptId(id);
        departmentMapper.update(dept);
        return dept;
    }

    public void deleteDepartment(Long id) {
        departmentMapper.softDelete(id);
    }

    public Team updateTeam(Long id, Team team) {
        team.setTeamId(id);
        teamMapper.update(team);
        return team;
    }

    public void deleteTeam(Long id) {
        teamMapper.softDelete(id);
    }

    // ========== Branch (BCH) ==========

    @Transactional(readOnly = true)
    public List<Branch> getAllBranches(String status) {
        if (status == null || status.isEmpty()) {
            return branchMapper.findByIsDeleted("N");
        }
        return branchMapper.findByStatusCenterAndIsDeleted(status, "N");
    }

    public Branch saveBranch(Branch branch) {
        if (branch.getBranchId() == null) {
            branchMapper.insert(branch);
        } else {
            branchMapper.update(branch);
        }
        return branchMapper.findById(branch.getBranchId()).orElse(branch);
    }

    public void deleteBranch(Long id) {
        Branch branch = branchMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Branch not found: " + id));
        branch.setIsDeleted("Y");
        branch.setDeletedAt(java.time.LocalDateTime.now());
        branchMapper.update(branch);
    }

    // ========== Manager (MGR) ==========

    @Transactional(readOnly = true)
    public List<Manager> getManagersByBranch(Long branchId) {
        return managerMapper.findByBranchIdAndDeletedAtIsNull(branchId);
    }

    public Manager saveManager(Manager manager) {
        managerMapper.insert(manager);
        return manager;
    }

    public Manager updateManager(Long managerId, Manager manager) {
        managerMapper.findById(managerId)
                .orElseThrow(() -> new IllegalArgumentException("Manager not found: " + managerId));
        manager.setManagerId(managerId);
        managerMapper.update(manager);
        return managerMapper.findById(managerId).orElse(manager);
    }

    // ========== DeviceModel (MDL) ==========

    @Transactional(readOnly = true)
    public List<DeviceModel> getAllDeviceModels() {
        return deviceModelMapper.findAll();
    }

    public DeviceModel createModel(DeviceModel model) {
        deviceModelMapper.insert(model);
        return deviceModelMapper.findById(model.getModelId()).orElse(model);
    }

    public DeviceModel updateModel(Long modelId, DeviceModel model) {
        deviceModelMapper.findById(modelId)
                .orElseThrow(() -> new IllegalArgumentException("DeviceModel not found: " + modelId));
        model.setModelId(modelId);
        deviceModelMapper.update(model);
        return deviceModelMapper.findById(modelId).orElse(model);
    }

    public void deleteModel(Long modelId) {
        deviceModelMapper.findById(modelId)
                .orElseThrow(() -> new IllegalArgumentException("DeviceModel not found: " + modelId));
        deviceModelMapper.softDelete(modelId);
    }

    // ========== Device (DEV) ==========

    @Transactional(readOnly = true)
    public List<DeviceResponseDto> getDevices(Long branchId) {
        if (branchId != null) {
            return deviceMapper.findByBranchIdWithDetails(branchId);
        }
        return deviceMapper.findAllWithDetails();
    }

    @Transactional(readOnly = true)
    public DeviceResponseDto getDeviceById(Long deviceId) {
        return deviceMapper.findByIdWithDetails(deviceId)
                .orElseThrow(() -> new IllegalArgumentException("Device not found: " + deviceId));
    }

    @Transactional(readOnly = true)
    public DeviceStatsDto getDeviceStats(Long branchId, Long modelId) {
        return deviceMapper.findStats(branchId, modelId);
    }

    public DeviceResponseDto createDevice(DeviceRequestDto req) {
        deviceModelMapper.findById(req.getModelId())
                .orElseThrow(() -> new IllegalArgumentException("DeviceModel not found: " + req.getModelId()));
        branchMapper.findById(req.getBranchId())
                .orElseThrow(() -> new IllegalArgumentException("Branch not found: " + req.getBranchId()));
        userMapper.findById(req.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + req.getUserId()));

        Device device = Device.builder()
                .modelId(req.getModelId())
                .branchId(req.getBranchId())
                .userId(req.getUserId())
                .centerId(req.getCenterId())
                .deviceStatus(req.getDeviceStatus() != null ? req.getDeviceStatus() : 0)
                .batteryLevel(req.getBatteryLevel() != null ? req.getBatteryLevel() : 100)
                .receiveDate(req.getReceiveDate())
                .dispatchDate(req.getDispatchDate())
                .deviceSpecs(req.getDeviceSpecs())
                .build();

        deviceMapper.insert(device);
        return deviceMapper.findByIdWithDetails(device.getDeviceId())
                .orElseThrow(() -> new IllegalStateException("Device not found after insert"));
    }

    public DeviceResponseDto updateDevice(Long id, DeviceRequestDto req) {
        Device device = Device.builder()
                .deviceId(id)
                .modelId(req.getModelId())
                .branchId(req.getBranchId())
                .deviceStatus(req.getDeviceStatus())
                .batteryLevel(req.getBatteryLevel())
                .receiveDate(req.getReceiveDate())
                .dispatchDate(req.getDispatchDate())
                .deviceSpecs(req.getDeviceSpecs())
                .build();
        deviceMapper.update(device);
        return deviceMapper.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Device not found: " + id));
    }

    public void deleteDevice(Long id) {
        deviceMapper.deleteById(id);
    }

    // ========== Rental (RNT) ==========

    @Transactional(readOnly = true)
    public List<RentalResponseDto> getRentals() {
        return rentalMapper.findAllWithDetails();
    }

    @Transactional(readOnly = true)
    public List<RentalResponseDto> getRentalHistory(Long userId) {
        return rentalMapper.findByUserIdWithDetails(userId);
    }

    public Rental saveRental(Rental rental) {
        if (rental.getRentalId() == null) {
            rentalMapper.insert(rental);
            if (rental.getDeviceId() != null) {
                deviceMapper.updateStatus(rental.getDeviceId(), 1);
            }
        } else {
            Long deviceId = rental.getDeviceId();
            if (deviceId == null) {
                deviceId = rentalMapper.findById(rental.getRentalId())
                        .map(RentalResponseDto::getDeviceId)
                        .orElse(null);
            }
            rentalMapper.update(rental);
            if (deviceId != null && rental.getStatusRent() != null) {
                int st = rental.getStatusRent();
                if (st == 3 || st == 9) {
                    deviceMapper.updateStatus(deviceId, 0);
                } else if (st == 2) {
                    deviceMapper.updateStatus(deviceId, 1);
                }
            }
        }
        return rental;
    }

    public void deleteRental(Long id) {
        rentalMapper.deleteById(id);
    }

    // ========== AS ==========

    @Transactional(readOnly = true)
    public List<DeviceAsDto> getASList(String startDate, String endDate,
                                       Long branchId, Integer statusAs,
                                       Integer typeAs, Long deviceId) {
        return deviceASMapper.findWithFilters(startDate, endDate, branchId, statusAs, typeAs, deviceId);
    }

    @Transactional(readOnly = true)
    public DeviceAsDto getASById(Long asId) {
        return deviceASMapper.findById(asId)
                .orElseThrow(() -> new IllegalArgumentException("AS not found: " + asId));
    }

    public DeviceAS saveAS(DeviceAS asData) {
        if (asData.getAsId() == null) {
            deviceASMapper.insert(asData);
            if (asData.getDeviceId() != null) {
                deviceMapper.updateStatus(asData.getDeviceId(), 3);
            }
        } else {
            Long deviceId = asData.getDeviceId();
            if (deviceId == null) {
                deviceId = deviceASMapper.findById(asData.getAsId())
                        .map(DeviceAsDto::getDeviceId)
                        .orElse(null);
            }
            deviceASMapper.update(asData);
            if (deviceId != null && asData.getStatusAs() != null) {
                int st = asData.getStatusAs();
                if (st == 1 || st == 2) {
                    deviceMapper.updateStatus(deviceId, 3);
                } else if (st == 3) {
                    deviceMapper.updateStatus(deviceId, 4);
                } else if (st == 9) {
                    deviceMapper.updateStatus(deviceId, 0);
                } else if (st == 4) {
                    deviceMapper.updateStatus(deviceId, 9);
                }
            }
        }
        return asData;
    }

    // ========== User (USR) ==========

    @Transactional(readOnly = true)
    public List<User> getUsers(String isCompany, String department, String team) {
        boolean hasCompany = hasText(isCompany);
        boolean hasDepartment = hasText(department);
        boolean hasTeam = hasText(team);

        if (!hasCompany && !hasDepartment && !hasTeam) {
            return userMapper.findAll();
        }

        return userMapper.findByFilters(
                hasCompany ? isCompany : null,
                hasDepartment ? department : null,
                hasTeam ? team : null
        );
    }

    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        User user = userMapper.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if ("Y".equalsIgnoreCase(user.getIsDeleted())) {
            throw new IllegalArgumentException("User not found: " + userId);
        }

        return user;
    }
    
    public User createUser(User request) {
        validateRequiredUserFields(request);
        validateDuplicateEmail(request.getEmail(), null);

        if (!hasText(request.getUserPassword())) {
            request.setUserPassword("1234");
        }

        request.setUserPassword(passwordEncoder.encode(request.getUserPassword()));
        request.setIsCompany(normalizeYn(request.getIsCompany(), "N"));
        request.setWorkStatus(hasText(request.getWorkStatus()) ? request.getWorkStatus() : "재직");
        request.setIsDeleted("N");

        userMapper.insert(request);
        return userMapper.findById(request.getUserId()).orElse(request);
    }

    public User updateUser(Long userId, User request) {
        User user = getUserById(userId);

        if (request.getUserName() != null) {
            if (!hasText(request.getUserName())) {
                throw new IllegalArgumentException("직원명을 입력해 주세요.");
            }
            user.setUserName(request.getUserName());
        }

        if (request.getUserPassword() != null && hasText(request.getUserPassword())) {
            user.setUserPassword(passwordEncoder.encode(request.getUserPassword()));
        }

        if (request.getEmail() != null) {
            if (!hasText(request.getEmail())) {
                throw new IllegalArgumentException("이메일을 입력해 주세요.");
            }
            validateDuplicateEmail(request.getEmail(), userId);
            user.setEmail(request.getEmail());
        }

        if (request.getPhone() != null) {
            if (!hasText(request.getPhone())) {
                throw new IllegalArgumentException("전화번호를 입력해 주세요.");
            }
            user.setPhone(request.getPhone());
        }

        if (request.getCenterId() != null) user.setCenterId(request.getCenterId());
        if (request.getIsCompany() != null) user.setIsCompany(normalizeYn(request.getIsCompany(), user.getIsCompany()));
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getTeam() != null) user.setTeam(request.getTeam());
        if (request.getRank() != null) user.setRank(request.getRank());
        if (request.getWorkStatus() != null) user.setWorkStatus(request.getWorkStatus());

        userMapper.update(user);
        return userMapper.findById(userId).orElse(user);
    }

    public void deleteUser(Long id) {
        getUserById(id);
        userMapper.softDelete(id);
    }

    private void validateRequiredUserFields(User user) {
        if (user == null) {
            throw new IllegalArgumentException("직원 정보를 입력해 주세요.");
        }
        if (!hasText(user.getUserName())) {
            throw new IllegalArgumentException("직원명을 입력해 주세요.");
        }
        if (!hasText(user.getEmail())) {
            throw new IllegalArgumentException("이메일을 입력해 주세요.");
        }
        if (!hasText(user.getPhone())) {
            throw new IllegalArgumentException("전화번호를 입력해 주세요.");
        }
    }

    private void validateDuplicateEmail(String email, Long currentUserId) {
        if (!hasText(email)) {
            return;
        }

        boolean duplicated = userMapper.findAll().stream()
                .filter(user -> !"Y".equalsIgnoreCase(user.getIsDeleted()))
                .filter(user -> email.equals(user.getEmail()))
                .anyMatch(user -> currentUserId == null || !currentUserId.equals(user.getUserId()));

        if (duplicated) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
    }
    
    private String normalizeYn(String value, String defaultValue) {
        if ("Y".equalsIgnoreCase(value)) return "Y";
        if ("N".equalsIgnoreCase(value)) return "N";
        return defaultValue;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
    
    
    // ========== Center (SYS) ==========

    @Transactional(readOnly = true)
    public Center getCenter(Long centerId) {
        return centerMapper.findById(centerId).orElse(null);
    }

    public Center createCenter(Center center) {
        centerMapper.insert(center);
        return centerMapper.findById(center.getCenterId()).orElse(center);
    }

    public Center updateCenter(Long centerId, Center centerData) {
        centerData = Center.builder()
                .centerId(centerId)
                .centerName(centerData.getCenterName())
                .centerShortName(centerData.getCenterShortName())
                .engName(centerData.getEngName())
                .bizRegNo(centerData.getBizRegNo())
                .directorName(centerData.getDirectorName())
                .address(centerData.getAddress())
                .mainPhone(centerData.getMainPhone())
                .mainFax(centerData.getMainFax())
                .bizType(centerData.getBizType())
                .bizCategory(centerData.getBizCategory())
                .taxMgrName(centerData.getTaxMgrName())
                .logoImgUrl(centerData.getLogoImgUrl())
                .sealImgUrl(centerData.getSealImgUrl())
                .build();
        centerMapper.update(centerData);
        return centerMapper.findById(centerId).orElse(centerData);
    }

    public String saveCenterImage(Long centerId, MultipartFile file) {
        try {
            String ext = "";
            String originalFilename = file.getOriginalFilename();
            if (originalFilename != null && originalFilename.contains(".")) {
                ext = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID() + ext;

            Path dir = Paths.get(uploadDir, "centers", String.valueOf(centerId));
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

            String imageUrl = "/uploads/centers/" + centerId + "/" + filename;

            Center patch = Center.builder().centerId(centerId).logoImgUrl(imageUrl).build();
            centerMapper.update(patch);

            return imageUrl;
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패: " + e.getMessage(), e);
        }
    }

    // ========== Log (LOG) ==========

    @Transactional(readOnly = true)
    public List<DeviceLogResponseDto> getLogs(Long userId, String startDate, String endDate) {
        if (userId != null) {
            return deviceLogMapper.findByUserIdAndDateRange(userId, startDate, endDate);
        }
        return deviceLogMapper.findAllWithDetails();
    }

    public DeviceLog saveLog(DeviceLog log) {
        deviceLogMapper.insert(log);
        return log;
    }

    // ========== Emergency (EMG) ==========

    public Emergency createEmergency(Emergency emergency) {
        emergencyMapper.insert(emergency);
        return emergencyMapper.findById(emergency.getEmergencyId()).orElse(emergency);
    }

    public Emergency updateEmergency(Long emergencyId, Emergency emergency) {
        emergencyMapper.findById(emergencyId)
                .orElseThrow(() -> new IllegalArgumentException("Emergency not found: " + emergencyId));
        emergency.setEmergencyId(emergencyId);
        emergencyMapper.update(emergency);
        return emergencyMapper.findById(emergencyId).orElse(emergency);
    }
}
