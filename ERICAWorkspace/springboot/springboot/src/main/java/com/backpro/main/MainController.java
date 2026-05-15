package com.backpro.main;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backpro.main.model.dto.ApiResponse;
import com.backpro.main.model.dto.DeviceAsDto;
import com.backpro.main.model.dto.DeviceRequestDto;
import com.backpro.main.model.dto.DeviceResponseDto;
import com.backpro.main.model.service.MainService;
import com.backpro.main.model.vo.Branch;
import com.backpro.main.model.vo.Center;
import com.backpro.main.model.vo.Department;
import com.backpro.main.model.vo.DeviceAS;
import com.backpro.main.model.vo.DeviceLog;
import com.backpro.main.model.vo.DeviceModel;
import com.backpro.main.model.vo.Manager;
import com.backpro.main.model.vo.Rental;
import com.backpro.main.model.vo.Team;
import com.backpro.main.model.vo.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping
@RequiredArgsConstructor
public class MainController {

    private final MainService mainService;

    // --- Branch (BCH) ---
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
        return ApiResponse.ok(mainService.saveBranch(branch));
    }
    @DeleteMapping("/branches/{id}")
    public ApiResponse<String> deleteBranch(@PathVariable Long id) {
        mainService.deleteBranch(id);
        return ApiResponse.ok("Deleted");
    }

    // --- Manager (MGR) ---
    @GetMapping("/managers")
    public ApiResponse<List<Manager>> getManagers(@RequestParam Long branch_id) {
        return ApiResponse.ok(mainService.getManagersByBranch(branch_id));
    }
    @PostMapping("/managers")
    public ApiResponse<Manager> registerManager(@RequestBody Manager manager) {
        return ApiResponse.ok(mainService.saveManager(manager));
    }

    // --- DeviceModel ---
    @GetMapping("/device-models")
    public ApiResponse<List<DeviceModel>> getDeviceModels() {
        return ApiResponse.ok(mainService.getAllDeviceModels());
    }

    // --- Device (DEV) ---
    @GetMapping("/devices")
    public ApiResponse<List<DeviceResponseDto>> getDevices(@RequestParam(required = false) Long branch_id) {
        return ApiResponse.ok(mainService.getDevices(branch_id));
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

    // --- Rental (RNT) ---
    @GetMapping("/rentals")
    public ApiResponse<List<Rental>> getRentals() {
        return ApiResponse.ok(mainService.getRentals());
    }
    @GetMapping("/rentals/history/{user_id}")
    public ApiResponse<List<Rental>> getRentalHistory(@PathVariable Long user_id) {
        return ApiResponse.ok(mainService.getRentalHistory(user_id));
    }
    @PostMapping("/rentals")
    public ApiResponse<Rental> requestRental(@RequestBody Rental rental) {
        return ApiResponse.ok(mainService.saveRental(rental));
    }
    @PatchMapping("/rentals/{id}")
    public ApiResponse<Rental> updateRental(@PathVariable Long id, @RequestBody Rental rental) {
        return ApiResponse.ok(mainService.saveRental(rental));
    }

    // --- AS (AS) ---
    @GetMapping("/as")
    public ApiResponse<List<DeviceAsDto>> getASList(@RequestParam(required = false) Long device_id) {
        return ApiResponse.ok(mainService.getASList(device_id));
    }
    @PostMapping("/as")
    public ApiResponse<DeviceAS> registerAS(@RequestBody DeviceAS asData) {
        return ApiResponse.ok(mainService.saveAS(asData));
    }
    @PatchMapping("/as/{id}")
    public ApiResponse<DeviceAS> updateAS(@PathVariable Long id, @RequestBody DeviceAS asData) {
        return ApiResponse.ok(mainService.saveAS(asData));
    }

    // --- User (USR) ---
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
        return ApiResponse.ok(mainService.saveUser(user));
    }

    // --- Center (SYS) ---
    @GetMapping("/centers/{center_id}")
    public ApiResponse<Center> getCenter(@PathVariable Long center_id) {
        return ApiResponse.ok(mainService.getCenter(center_id));
    }
    @PatchMapping("/centers/{center_id}")
    public ApiResponse<Center> updateCenter(@PathVariable Long center_id, @RequestBody Center center) {
        return ApiResponse.ok(mainService.updateCenter(center_id, center));
    }

    // --- Log (LOG) ---
    @GetMapping("/logs")
    public ApiResponse<List<DeviceLog>> getLogs() {
        return ApiResponse.ok(mainService.getLogs());
    }

    // --- Organization (DEPT/TEAM) ---
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
