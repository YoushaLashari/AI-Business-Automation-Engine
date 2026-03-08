from sqlalchemy import Column, Integer, String, Float, DateTime, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from config import DATABASE_URL

Base = declarative_base()

class Invoice(Base):
    __tablename__ = "invoices"

    id             = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, nullable=True)
    vendor         = Column(String, nullable=True)
    date           = Column(String, nullable=True)
    due_date       = Column(String, nullable=True)
    total_amount   = Column(Float, nullable=True)
    currency       = Column(String, nullable=True)
    status         = Column(String, default="processed")
    raw_text       = Column(String, nullable=True)
    created_at     = Column(DateTime, default=datetime.utcnow)

# Create engine and session
engine = SessionLocal = None

def init_db():
    global engine, SessionLocal
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()