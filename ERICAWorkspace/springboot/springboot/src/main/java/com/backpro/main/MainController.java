package com.backpro.main;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.backpro.main.model.dto.*;
import com.backpro.main.model.service.MainService;
import com.backpro.main.model.vo.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping
@RequiredArgsConstructor
public class MainController {

    private final MainService mainService;

    // ========== Branch (BCH) ==========

    @GetMapping("/branches")
    public ApiResponse<List<Branch>> getBranches(@RequestParam(required = false) String status_center) {
        String status = "활성".equals(status_center) ? "Y" : "비활성".equals(status_center) ? "N" : null;
        return ApiResponse.ok(mainService.getAllBranches(status));
    }

    @PostMapping("/branches")
    public ApiResponse<Branch> registerBranch(@RequestBody Branch branch) {
        return ApiResponse.ok(mainService.saveBranch(branch));
    }

    @PatchMapping("/branches/{id}")
    public ApiResponse<Branch> updateBranch(@PathVariable Long id, @RequestBody Branch branch) {
        branch.setBranchId(id);
        return ApiResponse.ok(mainService.saveBranch(branch));
    }

    @DeleteMapping("/branches/{id}")
    public ApiResponse<String> deleteBranch(@PathVariable Long id) {
        mainService.deleteBranch(id);
        return ApiResponse.ok("Deleted");
    }

    // ========== Manager (MGR) ==========

    @GetMapping("/managers")
    public ApiResponse<List<Manager>> getManagers(@RequestParam Long branch_id) {
        return ApiResponse.ok(mainService.getManagersByBranch(branch_id));
    }

    @PostMapping("/managers")
    public ApiResponse<Manager> registerManager(@RequestBody Manager manager) {
        return ApiResponse.ok(mainService.saveManager(manager));
    }

    // MGR-003
    @PatchMapping("/managers/{id}")
    public ApiResponse<Manager> updateManager(@PathVariable Long id, @RequestBody Manager manager) {
        return ApiResponse.ok(mainService.updateManager(id, manager));
    }

    // ========== DeviceModel (MDL) ==========

    // MDL-002: /models (기존 /device-models 유지 + 신규 /models 추가)
    @GetMapping("/models")
    public ApiResponse<List<DeviceModel>> getModels() {
        return ApiResponse.ok(mainService.getAllDeviceModels());
    }

    @GetMapping("/device-models")
    public ApiResponse<List<DeviceModel>> getDeviceModels() {
        return ApiResponse.ok(mainService.getAllDeviceModels());
    }

    // MDL-001
    @PostMapping("/models")
    public ApiResponse<DeviceModel> registerModel(@RequestBody DeviceModel model) {
        return ApiResponse.ok(mainService.createModel(model));
    }

    // MDL-003
    @PatchMapping("/models/{id}")
    public ApiResponse<DeviceModel> updateModel(@PathVariable Long id, @RequestBody DeviceModel model) {
        return ApiResponse.ok(mainService.updateModel(id, model));
    }

    // MDL-004
    @DeleteMapping("/models/{id}")
    public ApiResponse<String> deleteModel(@PathVariable Long id) {
        mainService.deleteModel(id);
        return ApiResponse.ok("Deleted");
    }

    // ========== Device (DEV) ==========

    @GetMapping("/devices")
    public ApiResponse<List<DeviceResponseDto>> getDevices(@RequestParam(required = false) Long branch_id) {
        return ApiResponse.ok(mainService.getDevices(branch_id));
    }

    // DEV-003
    @GetMapping("/devices/{id}")
    public ApiResponse<DeviceResponseDto> getDeviceById(@PathVariable Long id) {
        return ApiResponse.ok(mainService.getDeviceById(id));
    }

    // DEV-006
    @GetMapping("/devices/stats/count")
    public ApiResponse<DeviceStatsDto> getDeviceStats(
            @RequestParam(required = false) Long branch_id,
            @RequestParam(required = false) Long model_id) {
        return ApiResponse.ok(mainService.getDeviceStats(branch_id, model_id));
    }

    @PostMapping("/devices")
    public ApiResponse<DeviceResponseDto> registerDevice(@RequestBody DeviceRequestDto req) {
        return ApiResponse.ok(mainService.createDevice(req));
    }

    @PatchMapping("/devices/{id}")
    public ApiResponse<DeviceResponseDto> updateDevice(@PathVariable Long id, @RequestBody DeviceRequestDto req) {
        return ApiResponse.ok(mainService.updateDevice(id, req));
    }

    @DeleteMapping("/devices/{id}")
    public ApiResponse<String> deleteDevice(@PathVariable Long id) {
        mainService.deleteDevice(id);
        return ApiResponse.ok("Deleted");
    }

    // ========== Rental (RNT) ==========

    @GetMapping("/rentals")
    public ApiResponse<List<RentalResponseDto>> getRentals() {
        return ApiResponse.ok(mainService.getRentals());
    }

    @GetMapping("/rentals/history/{user_id}")
    public ApiResponse<List<RentalResponseDto>> getRentalHistory(@PathVariable Long user_id) {
        return ApiResponse.ok(mainService.getRentalHistory(user_id));
    }

    @PostMapping("/rentals")
    public ApiResponse<Rental> requestRental(@RequestBody Rental rental) {
        return ApiResponse.ok(mainService.saveRental(rental));
    }

    @PatchMapping("/rentals/{id}")
    public ApiResponse<Rental> updateRental(@PathVariable Long id, @RequestBody Rental rental) {
        rental.setRentalId(id);
        return ApiResponse.ok(mainService.saveRental(rental));
    }

    @DeleteMapping("/rentals/{id}")
    public ApiResponse<String> deleteRental(@PathVariable Long id) {
        mainService.deleteRental(id);
        return ApiResponse.ok("Deleted");
    }

    // ========== AS ==========

    // AS-002: 기간 검색 파라미터 완전 구현
    @GetMapping("/as")
    public ApiResponse<List<DeviceAsDto>> getASList(
            @RequestParam(required = false) String start_date,
            @RequestParam(required = false) String end_date,
            @RequestParam(required = false) Long branch_id,
            @RequestParam(required = false) Integer status_as,
            @RequestParam(required = false) Integer type_as,
            @RequestParam(required = false) Long device_id) {
        return ApiResponse.ok(mainService.getASList(start_date, end_date, branch_id, status_as, type_as, device_id));
    }

    // AS-003
    @GetMapping("/as/{id}")
    public ApiResponse<DeviceAsDto> getASById(@PathVariable Long id) {
        return ApiResponse.ok(mainService.getASById(id));
    }

    @PostMapping("/as")
    public ApiResponse<DeviceAS> registerAS(@RequestBody DeviceAS asData) {
        return ApiResponse.ok(mainService.saveAS(asData));
    }

    @PatchMapping("/as/{id}")
    public ApiResponse<DeviceAS> updateAS(@PathVariable Long id, @RequestBody DeviceAS asData) {
        asData.setAsId(id);
        return ApiResponse.ok(mainService.saveAS(asData));
    }

    // ========== User (USR) ==========

    @GetMapping("/users")
    public ApiResponse<List<User>> getUsers(
            @RequestParam(required = false) String is_company,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String team) {
        return ApiResponse.ok(mainService.getUsers(is_company, department, team));
    }

    @PostMapping("/users")
    public ApiResponse<User> registerUser(@RequestBody User user) {
        return ApiResponse.ok(mainService.saveUser(user));
    }

    @PatchMapping("/users/{id}")
    public ApiResponse<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setUserId(id);
        return ApiResponse.ok(mainService.saveUser(user));
    }

    // ========== Center (SYS) ==========

    // SYS-001
    @PostMapping("/centers")
    public ApiResponse<Center> registerCenter(@RequestBody Center center) {
        return ApiResponse.ok(mainService.createCenter(center));
    }

    @GetMapping("/centers/{center_id}")
    public ApiResponse<Center> getCenter(@PathVariable Long center_id) {
        return ApiResponse.ok(mainService.getCenter(center_id));
    }

    @PatchMapping("/centers/{center_id}")
    public ApiResponse<Center> updateCenter(@PathVariable Long center_id, @RequestBody Center center) {
        return ApiResponse.ok(mainService.updateCenter(center_id, center));
    }

    // SYS-004
    @PostMapping(value = "/centers/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, String>> uploadCenterImage(
            @RequestParam Long center_id,
            @RequestPart("image_file") MultipartFile imageFile) {
        String url = mainService.saveCenterImage(center_id, imageFile);
        return ApiResponse.ok(Map.of("image_url", url));
    }

    // ========== Log (LOG) ==========

    @GetMapping("/logs")
    public ApiResponse<List<DeviceLogResponseDto>> getLogs() {
        return ApiResponse.ok(mainService.getLogs());
    }

    // LOG-002
    @GetMapping("/logs/{user_id}")
    public ApiResponse<List<DeviceLogResponseDto>> getLogsByUser(
            @PathVariable Long user_id,
            @RequestParam(required = false) String start_date,
            @RequestParam(required = false) String end_date) {
        return ApiResponse.ok(mainService.getLogsByUser(user_id, start_date, end_date));
    }

    // LOG-001
    @PostMapping("/logs")
    public ApiResponse<DeviceLog> saveLog(@RequestBody DeviceLog log) {
        return ApiResponse.ok(mainService.saveLog(log));
    }

    // ========== Emergency (EMG) ==========

    // EMG-001
    @PostMapping("/emergencies")
    public ApiResponse<Emergency> registerEmergency(@RequestBody Emergency emergency) {
        return ApiResponse.ok(mainService.createEmergency(emergency));
    }

    // EMG-002
    @PatchMapping("/emergencies/{id}")
    public ApiResponse<Emergency> updateEmergency(@PathVariable Long id, @RequestBody Emergency emergency) {
        return ApiResponse.ok(mainService.updateEmergency(id, emergency));
    }

    // ========== Organization (DEPT/TEAM) ==========

    @GetMapping("/depts")
    public ApiResponse<List<Department>> getDepts() {
        return ApiResponse.ok(mainService.getAllDepartments());
    }

    @PostMapping("/depts")
    public ApiResponse<Department> registerDept(@RequestBody Department dept) {
        return ApiResponse.ok(mainService.saveDepartment(dept));
    }

    @GetMapping("/teams")
    public ApiResponse<List<Team>> getTeams(@RequestParam Long dept_id) {
        return ApiResponse.ok(mainService.getTeamsByDept(dept_id));
    }

    @PostMapping("/teams")
    public ApiResponse<Team> registerTeam(@RequestBody Team team) {
        return ApiResponse.ok(mainService.saveTeam(team));
    }
}
