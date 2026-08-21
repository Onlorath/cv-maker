package db

import (
	"embed"
	"fmt"
	"log/slog"

	"github.com/jmoiron/sqlx"
	"github.com/pressly/goose/v3"
	_ "modernc.org/sqlite" // SQLite driver
)

// InitDB initializes the SQLite database connection and runs pending migrations.
// migrationsFS is expected to be passed from the main package where migrations are embedded.
func InitDB(dsn string, migrationsFS embed.FS) (*sqlx.DB, error) {
	slog.Info("initializing database connection", "dsn", dsn)

	// Connect using sqlx with modernc.org/sqlite driver
	db, err := sqlx.Connect("sqlite", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to sqlite db: %w", err)
	}

	// Setup goose to use our db
	goose.SetBaseFS(migrationsFS)
	if err := goose.SetDialect("sqlite3"); err != nil {
		return nil, fmt.Errorf("failed to set goose dialect: %w", err)
	}

	// Run migrations from the embedded filesystem root
	slog.Info("running database migrations")
	if err := goose.Up(db.DB, "."); err != nil {
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	slog.Info("database initialized successfully")
	return db, nil
}
