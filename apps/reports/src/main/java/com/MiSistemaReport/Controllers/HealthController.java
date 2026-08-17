package com.MiSistemaReport.Controllers;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/health")
public class HealthController {

    @GetMapping("/version")
    public String version() {
        return "MiSistemaReport v0.1";
    }
}
