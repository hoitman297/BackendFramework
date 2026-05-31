package com.backpro.main.model.dto;

import com.backpro.main.model.vo.Center;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CenterDto {
    private Long center_id;
    private String center_name;
    private String center_short_name;
    private String eng_name;
    private String biz_reg_no;
    private String director_name;
    private String address;
    private String main_phone;
    private String main_fax;
    private String biz_type;
    private String biz_category;
    private String tax_mgr_name;
    private String logo_img_url;
    private String seal_img_url;

    public static CenterDto from(Center c) {
        return CenterDto.builder()
            .center_id(c.getCenterId())
            .center_name(c.getCenterName())
            .center_short_name(c.getCenterShortName())
            .eng_name(c.getEngName())
            .biz_reg_no(c.getBizRegNo())
            .director_name(c.getDirectorName())
            .address(c.getAddress())
            .main_phone(c.getMainPhone())
            .main_fax(c.getMainFax())
            .biz_type(c.getBizType())
            .biz_category(c.getBizCategory())
            .tax_mgr_name(c.getTaxMgrName())
            .logo_img_url(c.getLogoImgUrl())
            .seal_img_url(c.getSealImgUrl())
            .build();
    }
}
