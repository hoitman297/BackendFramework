package com.backpro.main.model.service;

import java.util.List;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.backpro.main.model.dao.*;
import com.backpro.main.model.dto.DeviceAsDto;
import com.backpro.main.model.dto.DeviceRequestDto;
import com.backpro.main.model.dto.DeviceResponseDto;
import com.backpro.main.model.vo.*;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class MainService {

    private final DeviceRepository deviceRepository;
    private final RentalRepository rentalRepository;
    private final DeviceASRepository deviceASRepository;
    private final UserRepository userRepository;
    private final DeviceLogRepository deviceLogRepository;
    private final CenterRepository centerRepository;
    private final BranchRepository branchRepository;
    private final ManagerRepository managerRepository;
    private final DeviceModelRepository deviceModelRepository;
    private final DepartmentRepository departmentRepository;
    private final TeamRepository teamRepository;

    // --- Organization (DEPT/TEAM) ---
    @Transactional(readOnly = true)
    public List<Department> getAllDepartments() { return departmentRepository.findAll(); }
    public Department saveDepartment(Department dept) { return departmentRepository.save(dept); }

    @Transactional(readOnly = true)
    public List<Team> getTeamsByDept(Long deptId) { return teamRepository.findByDepartmentDeptId(deptId); }
    public Team saveTeam(Team team) { return teamRepository.save(team); }

    // --- Branch (BCH) ---
    @Transactional(readOnly = true)
    public List<Branch> getAllBranches(String status) {
        if (status == null || status.isEmpty()) return branchRepository.findByIsDeleted("N");
        return branchRepository.findByStatusCenterAndIsDeleted(status, "N");
    }
    public Branch saveBranch(Branch branch) { return branchRepository.save(branch); }
    public void deleteBranch(Long id) {
        branchRepository.findById(id).ifPresent(branchRepository::delete);
    }

    // --- Manager (MGR) ---
    @Transactional(readOnly = true)
    public List<Manager> getManagersByBranch(Long branchId) {
        return managerRepository.findByBranch_BranchIdAndDeletedAtIsNull(branchId);
    }
    public Manager saveManager(Manager manager) { return managerRepository.save(manager); }

    // --- DeviceModel ---
    @Transactional(readOnly = true)
    public List<DeviceModel> getAllDeviceModels() {
        return deviceModelRepository.findAll();
    }

    // --- Device (DEV) ---
    @Transactional(readOnly = true)
    public List<DeviceResponseDto> getDevices(Long branchId) {
        List<Device> devices = branchId != null
                ? deviceRepository.findByBranchIdWithDetails(branchId)
                : deviceRepository.findAllWithDetails();
        return devices.stream().map(this::toDeviceDto).toList();
    }

    public DeviceResponseDto createDevice(DeviceRequestDto req) {
        DeviceModel model = deviceModelRepository.findById(req.getModelId())
                .orElseThrow(() -> new IllegalArgumentException("DeviceModel not found: " + req.getModelId()));
        Branch branch = branchRepository.findById(req.getBranchId())
                .orElseThrow(() -> new IllegalArgumentException("Branch not found: " + req.getBranchId()));
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + req.getUserId()));
        Center center = req.getCenterId() != null
                ? centerRepository.findById(req.getCenterId()).orElse(null) : null;

        Device device = Device.builder()
                .model(model)
                .branch(branch)
                .user(user)
                .center(center)
                .deviceStatus(req.getDeviceStatus() != null ? req.getDeviceStatus() : 0)
                .batteryLevel(req.getBatteryLevel() != null ? req.getBatteryLevel() : 100)
                .receiveDate(req.getReceiveDate())
                .dispatchDate(req.getDispatchDate())
                .deviceSpecs(req.getDeviceSpecs())
                .build();
        return toDeviceDto(deviceRepository.save(device));
    }

    public DeviceResponseDto updateDevice(Long id, DeviceRequestDto req) {
        Device device = deviceRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Device not found: " + id));
        Branch newBranch = req.getBranchId() != null
                ? branchRepository.findById(req.getBranchId()).orElse(null) : null;
        DeviceModel newModel = req.getModelId() != null
                ? deviceModelRepository.findById(req.getModelId()).orElse(null) : null;
        device.update(req.getDeviceStatus(), req.getBatteryLevel(),
                req.getReceiveDate(), req.getDispatchDate(), req.getDeviceSpecs(),
                newBranch, newModel);
        return toDeviceDto(deviceRepository.save(device));
    }

    public void deleteDevice(Long id) { deviceRepository.deleteById(id); }

    private DeviceResponseDto toDeviceDto(Device d) {
        return DeviceResponseDto.builder()
                .deviceId(d.getDeviceId())
                .modelId(d.getModel().getModelId())
                .modelName(d.getModel().getModelName())
                .modelVersion(d.getModel().getVersion())
                .manualUrl(d.getModel().getManualUrl())
                .branchId(d.getBranch().getBranchId())
                .branchName(d.getBranch().getBranchName())
                .deviceStatus(d.getDeviceStatus())
                .batteryLevel(d.getBatteryLevel())
                .receiveDate(d.getReceiveDate())
                .dispatchDate(d.getDispatchDate())
                .lastRentalDate(d.getLastRentalDate())
                .lastAsDate(d.getLastAsDate())
                .deviceSpecs(d.getDeviceSpecs())
                .userId(d.getUser().getUserId())
                .createdAt(d.getCreatedAt())
                .build();
    }

    // --- Rental (RNT) ---
    @Transactional(readOnly = true)
    public List<Rental> getRentals() { return rentalRepository.findAll(); }
    @Transactional(readOnly = true)
    public List<Rental> getRentalHistory(Long userId) { return rentalRepository.findByUser_UserId(userId); }
    public Rental saveRental(Rental rental) { return rentalRepository.save(rental); }

    // --- AS (AS) ---
    @Transactional(readOnly = true)
    public List<DeviceAsDto> getASList(Long deviceId) {
        List<DeviceAS> list = deviceId != null
                ? deviceASRepository.findByDeviceIdWithDetails(deviceId)
                : deviceASRepository.findAllWithDetails();
        return list.stream().map(this::toAsDto).toList();
    }

    public DeviceAS saveAS(DeviceAS asData) { return deviceASRepository.save(asData); }

    private DeviceAsDto toAsDto(DeviceAS a) {
        return DeviceAsDto.builder()
                .asId(a.getAs_id())
                .deviceId(a.getDevice().getDeviceId())
                .branchId(a.getBranch().getBranchId())
                .branchName(a.getBranch().getBranchName())
                .statusAs(a.getStatus_as())
                .typeAs(a.getType_as())
                .receiptDate(a.getReceipt_date())
                .receiptDetails(a.getReceipt_details())
                .checkerName(a.getChecker_name())
                .managerName(a.getManager_name())
                .repairDetails(a.getRepair_details())
                .completionDate(a.getCompletion_date())
                .createdAt(a.getCreated_at())
                .build();
    }

    // --- User (USR) ---
    @Transactional(readOnly = true)
    public List<User> getUsers(String isCompany, String department, String team) {
        return userRepository.findAll().stream()
                .filter(u -> isCompany == null || u.getIsCompany().equals(isCompany))
                .filter(u -> department == null || department.equals(u.getDepartment()))
                .filter(u -> team == null || team.equals(u.getTeam()))
                .toList();
    }
    public User saveUser(User user) { return userRepository.save(user); }

    // --- Center (SYS) ---
    @Transactional(readOnly = true)
    public Center getCenter(Long centerId) { return centerRepository.findById(centerId).orElse(null); }
    public Center updateCenter(Long centerId, Center centerData) {
        return centerRepository.save(centerData);
    }

    // --- Log (LOG) ---
    @Transactional(readOnly = true)
    public List<DeviceLog> getLogs() { return deviceLogRepository.findAll(); }
}
