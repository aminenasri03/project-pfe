-- V1: initial schema for internal recruitment portal

CREATE TABLE roles (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_RECRUITER'), ('ROLE_CANDIDATE');

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    department      VARCHAR(100),
    job_title       VARCHAR(100),
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE job_offers (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    description     TEXT NOT NULL,
    department      VARCHAR(100),
    location        VARCHAR(150),
    contract_type   VARCHAR(50),
    required_skills TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    created_by      BIGINT NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closes_at       TIMESTAMP
);

CREATE INDEX idx_offers_status ON job_offers(status);
CREATE INDEX idx_offers_department ON job_offers(department);

CREATE TABLE applications (
    id              BIGSERIAL PRIMARY KEY,
    offer_id        BIGINT NOT NULL REFERENCES job_offers(id) ON DELETE CASCADE,
    candidate_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_letter    TEXT,
    cv_file_path    VARCHAR(500),
    cv_file_name    VARCHAR(255),
    matching_score  NUMERIC(5,2),
    status          VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    submitted_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (offer_id, candidate_id)
);

CREATE INDEX idx_applications_status ON applications(status);

CREATE TABLE interviews (
    id              BIGSERIAL PRIMARY KEY,
    application_id  BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    scheduled_at    TIMESTAMP NOT NULL,
    location        VARCHAR(200),
    mode            VARCHAR(30),
    notes           TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evaluations (
    id              BIGSERIAL PRIMARY KEY,
    application_id  BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    evaluator_id    BIGINT NOT NULL REFERENCES users(id),
    score           INTEGER CHECK (score BETWEEN 0 AND 100),
    comments        TEXT,
    decision        VARCHAR(30),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    message     TEXT NOT NULL,
    type        VARCHAR(30),
    read_flag   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read_flag);
