package com.reclamation.chat;

import com.reclamation.chat.config.AsyncSyncConfiguration;
import com.reclamation.chat.config.EmbeddedSQL;
import com.reclamation.chat.config.JacksonConfiguration;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Base composite annotation for integration tests.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(
    classes = {
        SmartComplaintApp.class,
        JacksonConfiguration.class,
        AsyncSyncConfiguration.class,
        com.reclamation.chat.config.JacksonHibernateConfiguration.class,
    },
    properties = "spring.profiles.active=testprod"
)
@EmbeddedSQL
public @interface IntegrationTest {}
