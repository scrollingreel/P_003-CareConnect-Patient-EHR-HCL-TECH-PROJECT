package com.apexcare.rag;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HospitalRagApplication {
    public static void main(String[] args) {
        SpringApplication.run(HospitalRagApplication.class, args);
    }
}
