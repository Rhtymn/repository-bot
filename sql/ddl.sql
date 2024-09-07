DROP DATABASE IF EXISTS db_repositoryapp;
CREATE DATABASE db_repositoryapp;

\c db_repositoryapp;

CREATE TABLE users (
	id BIGSERIAL PRIMARY KEY,
	phone_number VARCHAR NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT now(),
	updated_at TIMESTAMP NOT NULL DEFAULT now(),
	deleted_at TIMESTAMP
);


CREATE TABLE directories (
	id BIGSERIAL PRIMARY KEY,
	title VARCHAR NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT now(),
	updated_at TIMESTAMP NOT NULL DEFAULT now(),
	deleted_at TIMESTAMP,

	id_user BIGINT NOT NULL REFERENCES users(id)

);


CREATE TABLE links (
	id BIGSERIAL PRIMARY KEY,
	url VARCHAR NOT NULL,
	title VARCHAR NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT now(),
	updated_at TIMESTAMP NOT NULL DEFAULT now(),
	deleted_at TIMESTAMP,

	id_directory BIGINT NOT NULL REFERENCES directories(id)
);