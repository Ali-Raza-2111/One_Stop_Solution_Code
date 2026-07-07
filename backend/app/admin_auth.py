"""Admin authentication dependency."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.services.security import decode_access_token
from app.models.admin_user import AdminUser

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_admin(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> AdminUser:
    """Strict admin auth: raises 401 if no creds / invalid token / inactive user."""
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    username = decode_access_token(creds.credentials)
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


def get_optional_admin(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> AdminUser | None:
    """Lenient admin auth: returns None if no creds / invalid token / inactive user.

    Use this for endpoints that need BOTH a public mode AND an admin mode
    on the same path (e.g. GET /ratings/?approved=true is public, but
    ?approved=false requires admin). The route handler decides whether
    to enforce admin based on the request.
    """
    if creds is None or creds.scheme.lower() != "bearer":
        return None
    username = decode_access_token(creds.credentials)
    if not username:
        return None
    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if not user or not user.is_active:
        return None
    return user


def require_admin(_=Depends(get_current_admin)):
    """Simple guard — raises 401 if not admin, otherwise returns None."""
    return None
