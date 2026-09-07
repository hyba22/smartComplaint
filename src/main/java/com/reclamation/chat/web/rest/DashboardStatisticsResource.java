package com.reclamation.chat.web.rest;

import com.reclamation.chat.service.DashboardStatisticsService;
import com.reclamation.chat.service.dto.DashboardStatisticsDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardStatisticsResource {

    private static final Logger LOG = LoggerFactory.getLogger(DashboardStatisticsResource.class);

    private final DashboardStatisticsService dashboardStatisticsService;

    public DashboardStatisticsResource(DashboardStatisticsService dashboardStatisticsService) {
        this.dashboardStatisticsService = dashboardStatisticsService;
    }

    /**
     * get all dashboard statistics
     * @return
     */
    @GetMapping("/statistics")
    public ResponseEntity<DashboardStatisticsDTO> getDashboardStatistics() {
        LOG.debug("REST request to get dashboard statistics");
        DashboardStatisticsDTO statistics = dashboardStatisticsService.calculateStatistics();
        return ResponseEntity.ok(statistics);
    }
}
