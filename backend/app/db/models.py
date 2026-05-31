from sqlalchemy import Column, Text, Integer, DateTime, Float, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    pass


class PromptMemory(Base):
    """
    Stores the latest version of a prompt (one row per prompt).
    """
    __tablename__ = "prompt_memory"

    id = Column(Text, primary_key=True)
    title = Column(Text, nullable=False)
    current_version = Column(Integer, nullable=False)
    state = Column(JSONB, nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PromptRun(Base):
    """
    One refine request by the user.
    """
    __tablename__ = "prompt_runs"

    id = Column(Text, primary_key=True)
    mode = Column(Text, nullable=False)
    creator_model = Column(Text, nullable=True)
    critic_model = Column(Text, nullable=True)
    max_iterations = Column(Integer, nullable=False)
    original_prompt = Column(Text, nullable=True)
    final_prompt = Column(Text, nullable=True)
    final_score = Column(Integer, nullable=True)
    total_cost = Column(Float, nullable=True)
    total_tokens = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PromptIteration(Base):
    """
    One iteration inside a run.
    """
    __tablename__ = "prompt_iterations"

    id = Column(Text, primary_key=True)
    run_id = Column(Text, nullable=False)
    iteration = Column(Integer, nullable=False)
    prompt = Column(Text, nullable=False)
    critique = Column(JSONB, nullable=True)
    score = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class BenchmarkRun(Base):
    """
    One Bench Mode run: a system prompt tested across models x settings x test inputs.
    """
    __tablename__ = "benchmark_runs"

    id = Column(Text, primary_key=True)
    label = Column(Text, nullable=True)
    system_prompt = Column(Text, nullable=False)
    test_inputs = Column(JSONB, nullable=False)
    models = Column(JSONB, nullable=False)
    settings = Column(JSONB, nullable=True)
    critic_model = Column(Text, nullable=True)
    is_baseline = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class BenchmarkResult(Base):
    """
    One model x temperature cell within a benchmark run (averaged over test inputs).
    """
    __tablename__ = "benchmark_results"

    id = Column(Text, primary_key=True)
    run_id = Column(Text, nullable=False)
    model = Column(Text, nullable=False)
    temperature = Column(Float, nullable=True)
    score = Column(Integer, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    tokens = Column(Integer, nullable=True)
    cost = Column(Float, nullable=True)
    outputs = Column(JSONB, nullable=True)  # [{input, output, score}]
