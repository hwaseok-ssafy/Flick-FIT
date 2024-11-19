package com.example.flickfit.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@MapperScan(basePackages = "com.example.flickfit.model.dao")
@Configuration
public class MybatisConfig {

}
