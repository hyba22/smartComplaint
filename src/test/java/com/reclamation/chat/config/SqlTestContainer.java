package com.reclamation.chat.config;

import org.testcontainers.containers.JdbcDatabaseContainer;

public interface SqlTestContainer {
    JdbcDatabaseContainer<?> getTestContainer();
}
