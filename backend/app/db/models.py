from sqlalchemy import Column, Text, Integer, DateTime
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
