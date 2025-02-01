# coding: utf-8
from sqlalchemy import BigInteger, Column, Date, DateTime, ForeignKey, Numeric, String, text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

########################################################################################################################
# Classes describing database for SqlAlchemy ORM, initially created by schema introspection.
#
# Alter this file per your database maintenance policy
#    See https://apilogicserver.github.io/Docs/Project-Rebuild/#rebuilding
#
# Created:  February 01, 2025 11:56:17
# Database: postgresql://postgres:postgres@127.0.0.1:5432/rightmetrics
# Dialect:  postgresql
#
# mypy: ignore-errors
########################################################################################################################
 
from database.system.SAFRSBaseX import SAFRSBaseX, TestBase
from flask_login import UserMixin
import safrs, flask_sqlalchemy, os
from safrs import jsonapi_attr
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Mapped
from sqlalchemy.sql.sqltypes import NullType
from typing import List

db = SQLAlchemy() 
Base = declarative_base()  # type: flask_sqlalchemy.model.DefaultMeta
metadata = Base.metadata

#NullType = db.String  # datatype fixup
#TIMESTAMP= db.TIMESTAMP

from sqlalchemy.dialects.postgresql import *

if os.getenv('APILOGICPROJECT_NO_FLASK') is None or os.getenv('APILOGICPROJECT_NO_FLASK') == 'None':
    Base = SAFRSBaseX   # enables rules to be used outside of Flask, e.g., test data loading
else:
    Base = TestBase     # ensure proper types, so rules work for data loading
    print('*** Models.py Using TestBase ***')



class Drug(Base):  # type: ignore
    __tablename__ = 'drug'
    _s_collection_name = 'Drug'  # type: ignore

    id = Column(BigInteger, server_default=text("nextval('drug_id_seq'::regclass)"), primary_key=True)
    drug_name = Column(String(256), nullable=False)
    drug_type = Column(String(256))

    # parent relationships (access parent)

    # child relationships (access children)
    ContraindicationList : Mapped[List["Contraindication"]] = relationship(foreign_keys='[Contraindication.drug_id_1]', back_populates="drug")
    ContraindicationList1 : Mapped[List["Contraindication"]] = relationship(foreign_keys='[Contraindication.drug_id_2]', back_populates="drug1")
    DosageList : Mapped[List["Dosage"]] = relationship(back_populates="drug")
    RecommendationList : Mapped[List["Recommendation"]] = relationship(back_populates="drug")



class Patient(Base):  # type: ignore
    __tablename__ = 'patient'
    _s_collection_name = 'Patient'  # type: ignore

    id = Column(BigInteger, server_default=text("nextval('patient_id_seq'::regclass)"), primary_key=True)
    name = Column(String(256), nullable=False)
    birth_date = Column(Date)
    weight_kg = Column(BigInteger)
    creatine_mg_dl = Column(Numeric(10, 4))
    medical_record_number = Column(String(256))
    created_date = Column(DateTime, server_default=text("now()"))

    # parent relationships (access parent)

    # child relationships (access children)
    ReadingList : Mapped[List["Reading"]] = relationship(back_populates="patient")
    RecommendationList : Mapped[List["Recommendation"]] = relationship(back_populates="patient")



class Contraindication(Base):  # type: ignore
    __tablename__ = 'contraindication'
    _s_collection_name = 'Contraindication'  # type: ignore

    id = Column(BigInteger, server_default=text("nextval('contraindication_id_seq'::regclass)"), primary_key=True)
    drug_id_1 = Column(ForeignKey('drug.id'), nullable=False)
    drug_id_2 = Column(ForeignKey('drug.id'), nullable=False)
    description = Column(String(256))

    # parent relationships (access parent)
    drug : Mapped["Drug"] = relationship(foreign_keys='[Contraindication.drug_id_1]', back_populates=("ContraindicationList"))
    drug1 : Mapped["Drug"] = relationship(foreign_keys='[Contraindication.drug_id_2]', back_populates=("ContraindicationList1"))

    # child relationships (access children)



class Dosage(Base):  # type: ignore
    __tablename__ = 'dosage'
    _s_collection_name = 'Dosage'  # type: ignore

    id = Column(BigInteger, server_default=text("nextval('dosage_id_seq'::regclass)"), primary_key=True)
    drug_id = Column(ForeignKey('drug.id', ondelete='CASCADE'), nullable=False)
    drug_name = Column(String(256))
    drug_type = Column(String(256))
    min_dose = Column(Numeric(10, 4))
    max_dose = Column(Numeric(10, 4))
    min_age = Column(Numeric(10, 4))
    max_age = Column(Numeric(10, 4))
    min_weight = Column(Numeric(10, 4))
    max_weight = Column(Numeric(10, 4))
    min_creatine = Column(Numeric(10, 4))
    max_creatine = Column(Numeric(10, 4))

    # parent relationships (access parent)
    drug : Mapped["Drug"] = relationship(back_populates=("DosageList"))

    # child relationships (access children)



class Reading(Base):  # type: ignore
    __tablename__ = 'reading'
    _s_collection_name = 'Reading'  # type: ignore

    id = Column(BigInteger, server_default=text("nextval('reading_id_seq'::regclass)"), primary_key=True)
    patient_id = Column(ForeignKey('patient.id', ondelete='CASCADE'), nullable=False)
    morning = Column(Numeric(10, 4))
    afternoon = Column(Numeric(10, 4))
    dinner = Column(Numeric(10, 4))
    bedtime = Column(Numeric(10, 4))
    reading_date = Column(DateTime, server_default=text("now()"))

    # parent relationships (access parent)
    patient : Mapped["Patient"] = relationship(back_populates=("ReadingList"))

    # child relationships (access children)



class Recommendation(Base):  # type: ignore
    __tablename__ = 'recommendation'
    _s_collection_name = 'Recommendation'  # type: ignore

    id = Column(BigInteger, server_default=text("nextval('recommendation_id_seq'::regclass)"), primary_key=True)
    patient_id = Column(ForeignKey('patient.id', ondelete='CASCADE'), nullable=False)
    drug_id = Column(ForeignKey('drug.id'), nullable=False)
    dosage = Column(Numeric(10, 4))
    recommendation_date = Column(DateTime, server_default=text("now()"))

    # parent relationships (access parent)
    drug : Mapped["Drug"] = relationship(back_populates=("RecommendationList"))
    patient : Mapped["Patient"] = relationship(back_populates=("RecommendationList"))

    # child relationships (access children)
