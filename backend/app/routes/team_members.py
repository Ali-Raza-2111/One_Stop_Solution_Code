"""Team members routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.admin_auth import require_admin
from app.schemas.team_member import TeamMemberCreate, TeamMemberUpdate, TeamMemberResponse
from app.schemas.reorder import ReorderRequest
from app.services import team_member_service
from app.models.team_member import TeamMember

router = APIRouter(prefix="/team", tags=["Team"])


# IMPORTANT: /reorder is registered BEFORE /{team_id} so that the literal
# path "/reorder" is not captured by the {team_id} path-parameter route.
@router.put("/reorder", dependencies=[Depends(require_admin)])
def reorder_team_members(body: ReorderRequest, db: Session = Depends(get_db)):
    """Batch-update sort_order for many team members at once."""
    for it in body.items:
        t = db.query(TeamMember).filter(TeamMember.id == it.id).first()
        if t:
            t.sort_order = it.sort_order
    db.commit()
    return {"ok": True, "count": len(body.items)}


@router.get("/", response_model=list[TeamMemberResponse])
def list_team_members(db: Session = Depends(get_db)):
    return team_member_service.list_team_members(db)


@router.post("/", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
def create_team_member(body: TeamMemberCreate, db: Session = Depends(get_db)):
    return team_member_service.create_team_member(db, body)


@router.put("/{team_id}", response_model=TeamMemberResponse,
            dependencies=[Depends(require_admin)])
def update_team_member(team_id: int, body: TeamMemberUpdate, db: Session = Depends(get_db)):
    res = team_member_service.update_team_member(db, team_id, body)
    if not res:
        raise HTTPException(status_code=404, detail="Team member not found")
    return res


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def delete_team_member(team_id: int, db: Session = Depends(get_db)):
    if not team_member_service.delete_team_member(db, team_id):
        raise HTTPException(status_code=404, detail="Team member not found")
