-- +goose Up
-- +goose StatementBegin
ALTER TABLE cvs ADD COLUMN photo_size INTEGER NOT NULL DEFAULT 84;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE cvs DROP COLUMN photo_size;
-- +goose StatementEnd
