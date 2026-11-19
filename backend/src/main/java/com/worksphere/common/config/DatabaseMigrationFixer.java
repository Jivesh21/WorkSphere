package com.worksphere.common.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationFixer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseMigrationFixer.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabaseMigrationFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_type_check");
            log.info("Successfully dropped activities_type_check constraint.");
        } catch (Exception e) {
            log.warn("Could not drop activities_type_check: {}", e.getMessage());
        }
    }
}
