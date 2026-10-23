# backend/app/services/auth_recovery.py
"""
IndusTrace AI - Secure Account Recovery Utility
Safely provisions or resets Platform Owner / Company Administrator credentials
without exposing secrets in command lines, source code, or application logs.
"""
import sys
import os
import getpass
import bcrypt

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database.connection import SessionLocal
from app.models.entities import User, Company

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def recover_account(email: str = "owner@industrace.ai", new_password: str = None, role: str = "platform_owner") -> bool:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email.ilike(email.strip())).first()
        if not user:
            # Create user if not present
            company = db.query(Company).filter(Company.name == "IndusTrace Global Governance").first()
            if not company:
                company = Company(
                    name="IndusTrace Global Governance",
                    industry="Platform Operations & Audit",
                    location="System",
                    email=email,
                    manufacturing_process="Platform Oversight",
                    data_origin="PLATFORM_SYSTEM"
                )
                db.add(company)
                db.commit()
                db.refresh(company)

            user = User(
                company_id=company.id,
                email=email.strip().lower(),
                hashed_password="",
                full_name="Platform Administrator" if role == "platform_owner" else "System Administrator",
                role=role
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        if not new_password:
            # Read password securely without terminal echo
            if sys.stdin.isatty():
                pwd1 = getpass.getpass(f"Enter new password for {email}: ")
                pwd2 = getpass.getpass("Confirm new password: ")
                if pwd1 != pwd2:
                    print("Error: Passwords do not match.", file=sys.stderr)
                    return False
                if len(pwd1) < 8:
                    print("Error: Password must be at least 8 characters long.", file=sys.stderr)
                    return False
                new_password = pwd1
            else:
                # In non-interactive contexts, check RECOVERY_PASSWORD env variable
                new_password = os.getenv("RECOVERY_PASSWORD")
                if not new_password:
                    print("Error: In non-interactive shell, set RECOVERY_PASSWORD environment variable.", file=sys.stderr)
                    return False

        user.hashed_password = hash_password(new_password)
        db.commit()
        print(f"Success: Password for account '{email}' updated securely.")
        return True
    except Exception as e:
        db.rollback()
        print(f"Error during account recovery: {str(e)}", file=sys.stderr)
        return False
    finally:
        db.close()

def reset_platform_owner_password(email: str = "owner@industrace.ai", new_password: str = None, db = None) -> bool:
    """Convenience programmatic wrapper for platform owner recovery."""
    if db is not None:
        user = db.query(User).filter(User.email.ilike(email.strip())).first()
        if user and new_password:
            user.hashed_password = hash_password(new_password)
            db.commit()
            return True
        return False
    return recover_account(email=email, new_password=new_password, role="platform_owner")

if __name__ == "__main__":
    target_email = sys.argv[1] if len(sys.argv) > 1 else "owner@industrace.ai"
    success = recover_account(email=target_email)
    sys.exit(0 if success else 1)
