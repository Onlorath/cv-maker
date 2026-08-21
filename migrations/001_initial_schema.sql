-- +goose Up
-- +goose StatementBegin

-- cvs: bir kullanıcının oluşturduğu her CV dokümanı (TR taslak, EN çeviri vb. ayrı satır)
CREATE TABLE cvs (
    id          TEXT PRIMARY KEY,           -- uuid
    title       TEXT NOT NULL,              -- kullanıcıya görünen isim, örn "Yusuf - Backend TR"
    language    TEXT NOT NULL DEFAULT 'tr', -- 'tr' | 'en'
    template_id TEXT NOT NULL DEFAULT 'ats-classic',
    full_name   TEXT NOT NULL,
    job_title   TEXT NOT NULL DEFAULT '',
    email       TEXT NOT NULL DEFAULT '',
    phone       TEXT NOT NULL DEFAULT '',
    location    TEXT NOT NULL DEFAULT '',
    linkedin    TEXT NOT NULL DEFAULT '',
    github      TEXT NOT NULL DEFAULT '',
    website     TEXT NOT NULL DEFAULT '',
    summary     TEXT NOT NULL DEFAULT '',
    -- foto DB'de blob olarak değil, app data dizininde dosya olarak tutuluyor.
    -- sebep: Wails asset server dosya path'ini doğrudan <img src> olarak sunabiliyor,
    -- blob->base64 round-trip'i her render'da gereksiz CPU/memory maliyeti.
    photo_path  TEXT,                       -- app support dizinine göre relative path, nullable
    -- bir CV'nin "kaynağı" olan başka bir CV varsa (örn EN çevirisi TR'den türedi) burada tutulur.
    -- translate akışında yeni satır insert edilirken doldurulur, orijinal asla otomatik overwrite edilmez.
    source_cv_id TEXT REFERENCES cvs(id) ON DELETE SET NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- cv_sections: Experience / Education / Skills / Languages / Certifications / Projects / Custom
CREATE TABLE cv_sections (
    id          TEXT PRIMARY KEY,
    cv_id       TEXT NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL,             -- 'experience' | 'education' | 'skills' | 'languages' | 'certifications' | 'projects' | 'custom'
    title       TEXT NOT NULL,              -- görünen başlık, custom section için serbest metin
    -- Kanban projendeki fractional indexing ile aynı mantık: sürükle-bırak sıralamasında
    -- tüm satırları renumber etmeden tek satır update ile yeniden sıralama.
    order_key   TEXT NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cv_sections_cv_id ON cv_sections(cv_id);

-- cv_entries: bir section içindeki her satır (bir iş deneyimi, bir okul, bir dil vb.)
-- Heterojen alan seti (work exp'in date_start/end'i var, skills'in yok) yüzünden
-- ortak alanları kolonlarda tutuyoruz, section'a özgü ekstra alanları meta_json'da.
-- Bu pragmatik bir orta yol: tamamen JSON'a kaçmıyoruz (query edilebilirlik kaybolur),
-- tamamen normalize de etmiyoruz (6 farklı tablo + 6 farklı repository gereksiz karmaşıklık).
CREATE TABLE cv_entries (
    id          TEXT PRIMARY KEY,
    section_id  TEXT NOT NULL REFERENCES cv_sections(id) ON DELETE CASCADE,
    order_key   TEXT NOT NULL,
    title       TEXT NOT NULL DEFAULT '',   -- "Senior Backend Developer", "İstanbul Aydın Üniversitesi"
    subtitle    TEXT NOT NULL DEFAULT '',   -- "Kartelam", "Bilgisayar Programcılığı"
    location    TEXT NOT NULL DEFAULT '',
    date_start  TEXT,                       -- 'YYYY-MM' formatında serbest metin, tarih aritmetiği gerekmiyor
    date_end    TEXT,                       -- NULL + is_current=1 => "Present" / "Devam ediyor"
    is_current  INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT '',   -- markdown bullet listesi olarak tutulur, render'da parse edilir
    meta_json   TEXT NOT NULL DEFAULT '{}', -- section'a özgü ekstra alanlar (örn skills: {"level":"advanced"})
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cv_entries_section_id ON cv_entries(section_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS cv_entries;
DROP TABLE IF EXISTS cv_sections;
DROP TABLE IF EXISTS cvs;
-- +goose StatementEnd
