package com.coleccion.videojuegos.bootstrap;

import com.coleccion.videojuegos.entity.Enums.Distribucion;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Arrays;
import java.util.stream.Collectors;

@Component
@ConditionalOnProperty(name = "app.repair.distribucion-check", havingValue = "true")
public class DistribucionConstraintRepair implements CommandLineRunner {

    private final DataSource dataSource;

    public DistribucionConstraintRepair(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            String currentDefinition = getCurrentConstraintDefinition(connection);
            String expectedValues = Arrays.stream(Distribucion.values())
                    .map(Enum::name)
                    .map(value -> "'" + value + "'")
                    .collect(Collectors.joining(", "));
            String expectedDefinition = "CHECK (((distribucion IS NULL) OR ((distribucion)::text = ANY ((ARRAY[" + expectedValues + "])::text[]))))";

            if (currentDefinition != null && currentDefinition.contains("ARRAY[" + expectedValues + "]")) {
                System.out.println("[repair] La restriccion de distribucion ya estaba actualizada.");
                return;
            }

            try (Statement statement = connection.createStatement()) {
                statement.execute("ALTER TABLE soporte DROP CONSTRAINT IF EXISTS soporte_distribucion_check");
                statement.execute("ALTER TABLE soporte ADD CONSTRAINT soporte_distribucion_check " + expectedDefinition);
            }

            System.out.println("[repair] Restriccion soporte_distribucion_check recreada con los valores actuales del enum.");
        }
    }

    private String getCurrentConstraintDefinition(Connection connection) throws Exception {
        String sql = """
                SELECT pg_get_constraintdef(c.oid)
                FROM pg_constraint c
                JOIN pg_class t ON t.oid = c.conrelid
                WHERE t.relname = 'soporte'
                  AND c.conname = 'soporte_distribucion_check'
                """;

        try (PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {
            if (resultSet.next()) {
                return resultSet.getString(1);
            }
            return null;
        }
    }
}
