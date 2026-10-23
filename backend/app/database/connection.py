# backend/app/database/connection.py
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

# BASE_DIR points to backend/ directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

DEFAULT_DB_PATH = os.path.join(DATA_DIR, "industrace.db")
raw_url = os.getenv("DATABASE_URL")

if not raw_url:
    abs_db_file = DEFAULT_DB_PATH
    DATABASE_URL = f"sqlite:///{abs_db_file.replace(os.sep, '/')}"
elif raw_url.startswith("sqlite:///"):
    path_part = raw_url[len("sqlite:///"):]
    # Check if absolute path (Windows drive like C: or Unix /)
    if os.path.isabs(path_part) or (len(path_part) > 2 and path_part[1] == ':'):
        abs_db_file = os.path.abspath(path_part)
    elif path_part.startswith("backend/") or path_part.startswith("backend\\"):
        # Relative to project root
        abs_db_file = os.path.abspath(os.path.join(PROJECT_ROOT, path_part))
    else:
        # Relative to backend data directory or base dir
        abs_db_file = os.path.abspath(os.path.join(BASE_DIR, path_part))
    
    os.makedirs(os.path.dirname(abs_db_file), exist_ok=True)
    DATABASE_URL = f"sqlite:///{abs_db_file.replace(os.sep, '/')}"
else:
    DATABASE_URL = raw_url

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
