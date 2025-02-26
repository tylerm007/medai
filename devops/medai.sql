-- drop database medai;
-- create database medai;
-- \c media;
-- patient table


DROP TABLE IF EXISTS contraindication;
DROP TABLE IF EXISTS dosage;
DROP TABLE IF EXISTS patient_medication;
DROP TABLE IF EXISTS patient_lab;
DROP TABLE IF EXISTS reading_history;
DROP TABLE IF EXISTS reading;
DROP TABLE IF EXISTS recommendation;
DROP TABLE IF EXISTS drug;
DROP TABLE IF EXISTS drug_unit;
DROP TABLE IF EXISTS patient;

create table drug_unit(
	unit_name VARCHAR(10) PRIMARY KEY
);

insert into drug_unit(unit_name) values ('mg');
insert into drug_unit(unit_name) values ('mcg');
insert into drug_unit(unit_name) values ('ml');
insert into drug_unit(unit_name) values ('unit');
insert into drug_unit(unit_name) values ('g');
insert into drug_unit(unit_name) values ('kg');
insert into drug_unit(unit_name) values ('l');
insert into drug_unit(unit_name) values ('oz');	

create table patient (
	id SERIAL8 PRIMARY KEY,
	name VARCHAR(256) NOT NULL,
	birth_date DATE, -- constraint (18 * 365) < NOW() - birth_date
	age NUMERIC(10,1), -- birth_date / 365.5
	weight_kg BIGINT, 
	patient_sex VARCHAR(1) DEFAULT 'M', -- enum('M', 'F'),
	creatine_mg_dl NUMERIC(10,4),
	medical_record_number VARCHAR(256),
	created_date TIMESTAMP DEFAULT NOW()
);

create table patient_lab (
	id SERIAL8 PRIMARY KEY,
	patient_id BIGINT NOT NULL,
	lab_name VARCHAR(256) NOT NULL, -- Quest, LabCorp, etc
	lab_test_name VARCHAR(256) NOT NULL,
	lab_test_code VARCHAR(256),
	lab_test_description TEXT,
	lab_date DATE DEFAULT NOW(),
	lab_result JSON, -- { 'result': 'value', 'unit': 'mg/dl', 'reference_range': '0-100'}
	FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE
);
-- blood sugar reading
create table reading (
	id SERIAL8 PRIMARY KEY,
	patient_id BIGINT NOT NULL,
	time_of_reading VARCHAR(10) NOT NULL, -- enum('breakfast', 'lunch', 'dinner', 'bedtime'),
	reading_value NUMERIC(10,4),
	reading_date DATE DEFAULT NOW(),
	notes TEXT,
	FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE
);

create table reading_history (
	id SERIAL8 PRIMARY KEY,
	reading_id BIGINT NOT NULL,
	reading_date DATE NOT NULL, -- copy from reading
	breakfast NUMERIC(10,4),
	lunch NUMERIC(10,4),
	dinner NUMERIC(10,4),
	bedtime NUMERIC(10,4),
	notes_for_day TEXT,
	FOREIGN KEY (reading_id) REFERENCES reading(id) ON DELETE CASCADE
);
-- Drug 

create table drug (
	id SERIAL8 PRIMARY KEY,
	drug_name VARCHAR(256) NOT NULL,
	dosage NUMERIC(10,4),
	dosage_unit VARCHAR(10), -- default enum('mg', 'mcg', 'ml', 'unit'),
	drug_type VARCHAR(256),
	manufacturer VARCHAR(256), -- s/b lookup
	side_effects TEXT,
	FOREIGN KEY (dosage_unit) REFERENCES drug_unit(unit_name)
);

create table patient_medication (
	id SERIAL8 PRIMARY KEY,
	patient_id BIGINT NOT NULL,
	drug_id BIGINT NOT NULL,
	dosage NUMERIC(10,4),
	dosage_unit VARCHAR(10), -- default enum('mg', 'mcg', 'ml', 'unit'),
	FOREIGN KEY (drug_id) REFERENCES drug(id),
	FOREIGN KEY (dosage_unit) REFERENCES drug_unit(unit_name),
	FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE
);
-- drug recommendation
create table recommendation (
	id SERIAL8 PRIMARY KEY,
	patient_id BIGINT NOT NULL,
	time_of_reading VARCHAR(10) NOT NULL, -- enum('breakfast', 'lunch', 'dinner', 'bedtime'),
	drug_id BIGINT NOT NULL,
	dosage NUMERIC(10,4),
	dosage_unit VARCHAR(10), -- default enum('mg', 'mcg', 'ml', 'unit'),
	recommendation_date TIMESTAMP DEFAULT NOW(),
	FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE,
	FOREIGN KEY (dosage_unit) REFERENCES drug_unit(unit_name),
	FOREIGN KEY (drug_id) REFERENCES drug(id) 
);


-- A drug can have multiple dosages
create table dosage (
	id SERIAL8 PRIMARY KEY,
	drug_id BIGINT NOT NULL,
	drug_name VARCHAR(256), -- parent copy
	drug_type VARCHAR(256), -- parent copy
	min_dose NUMERIC(10,4),
	max_dose NUMERIC(10,4),
	dosage_unit VARCHAR(10), -- default enum('mg', 'mcg', 'ml', 'unit'),
	min_age NUMERIC(10,4) DEFAULT 18,
	max_age NUMERIC(10,4) DEFAULT 105,
	min_weight NUMERIC(10,4), -- in kg
	max_weight NUMERIC(10,4),
	min_creatine NUMERIC(10,4),
	max_creatine NUMERIC(10,4),
	FOREIGN KEY (dosage_unit) REFERENCES drug_unit(unit_name),
	FOREIGN KEY (drug_id) REFERENCES drug(id) ON DELETE CASCADE
);

create table contraindication (
	id SERIAL8 PRIMARY KEY,
	drug_id_1 BIGINT NOT NULL,
	drug_id_2 BIGINT NOT NULL,
	description TEXT,
	FOREIGN KEY (drug_id_1) REFERENCES drug(id),
	FOREIGN KEY (drug_id_2) REFERENCES drug(id) 
);