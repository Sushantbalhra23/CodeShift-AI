from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from app.db.database import Base


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    source_language = Column(String(50), nullable=False)
    target_language = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    translations = relationship("TranslationRecord", back_populates="experiment", cascade="all, delete-orphan")


class TranslationRecord(Base):
    __tablename__ = "translations"

    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id", ondelete="SET NULL"), nullable=True)
    
    source_language = Column(String(50), nullable=False)
    target_language = Column(String(50), nullable=False)
    source_code = Column(Text, nullable=False)
    translated_code = Column(Text, nullable=False)
    
    strategy = Column(String(100), nullable=False)  # zero_shot, few_shot, cot, role_expert, iterative_repair
    prompt_version = Column(String(50), nullable=False)
    model_name = Column(String(100), nullable=False)
    provider = Column(String(50), nullable=False)
    
    prompt_tokens = Column(Integer, nullable=True, default=0)
    completion_tokens = Column(Integer, nullable=True, default=0)
    total_tokens = Column(Integer, nullable=True, default=0)
    latency_ms = Column(Float, nullable=True, default=0.0)
    
    ast_valid = Column(Boolean, nullable=True, default=False)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    experiment = relationship("Experiment", back_populates="translations")
    evaluations = relationship("EvaluationRecord", back_populates="translation", cascade="all, delete-orphan")
    repairs = relationship("RepairRecord", back_populates="translation", cascade="all, delete-orphan")


class EvaluationRecord(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    translation_id = Column(Integer, ForeignKey("translations.id", ondelete="CASCADE"), nullable=False)

    syntax_valid = Column(Boolean, nullable=False, default=False)
    cyclomatic_complexity = Column(Integer, nullable=True)
    lines_of_code = Column(Integer, nullable=True)
    ast_nodes_count = Column(Integer, nullable=True)
    
    tests_generated = Column(Integer, nullable=True, default=0)
    tests_passed = Column(Integer, nullable=True, default=0)
    test_pass_rate = Column(Float, nullable=True, default=0.0)
    test_output = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    translation = relationship("TranslationRecord", back_populates="evaluations")


class RepairRecord(Base):
    __tablename__ = "repair_iterations"

    id = Column(Integer, primary_key=True, index=True)
    translation_id = Column(Integer, ForeignKey("translations.id", ondelete="CASCADE"), nullable=False)
    
    iteration_number = Column(Integer, nullable=False)
    input_code = Column(Text, nullable=False)
    error_feedback = Column(Text, nullable=False)
    repaired_code = Column(Text, nullable=False)
    converged = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    translation = relationship("TranslationRecord", back_populates="repairs")
