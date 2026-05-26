package com.backpro.main.model.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backpro.main.model.dao.CenterRepository;
import com.backpro.main.model.dto.CenterDto;
import com.backpro.main.model.vo.Center;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CenterService {
    private final CenterRepository centerRepository;

    public CenterDto getCenter(Long id) {
        return CenterDto.from(centerRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("센터를 찾을 수 없습니다: " + id)));
    }

    @Transactional
    public CenterDto updateCenter(Long id, CenterDto req) {
        Center c = centerRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("센터를 찾을 수 없습니다: " + id));
        c.setCenterName(req.getCenter_name());
        c.setCenterShortName(req.getCenter_short_name());
        c.setEngName(req.getEng_name());
        c.setBizRegNo(req.getBiz_reg_no());
        c.setDirectorName(req.getDirector_name());
        c.setAddress(req.getAddress());
        c.setMainPhone(req.getMain_phone());
        c.setMainFax(req.getMain_fax());
        c.setBizType(req.getBiz_type());
        c.setBizCategory(req.getBiz_category());
        c.setTaxMgrName(req.getTax_mgr_name());
        c.setLogoImgUrl(req.getLogo_img_url());
        c.setSealImgUrl(req.getSeal_img_url());
        return CenterDto.from(c);
    }
}
