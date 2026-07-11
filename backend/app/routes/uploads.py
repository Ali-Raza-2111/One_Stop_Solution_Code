"""File upload routes.

Two endpoints, both admin-only:
  POST /uploads/portfolio   — images for portfolio items (jpg/png/webp/gif)
  POST /uploads/resource    — downloadable resource files (pdf/docx/xlsx/zip/...)

Returns {url, filename, size, content_type}. The caller is responsible
for storing `url` into the relevant model column (e.g. PortfolioItem.media_url).

Files are served back via a StaticFiles mount on `/uploads` (see app/main.py).
"""
from fastapi import APIRouter, Depends, UploadFile, File, status
from app.admin_auth import require_admin
from app.schemas.upload import UploadResponse
from app.services import upload_service

router = APIRouter(prefix="/uploads", tags=["Uploads"])


@router.post(
    "/portfolio",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def upload_portfolio_image(file: UploadFile = File(...)):
    """Upload a portfolio image (jpg/png/webp/gif). Returns public URL."""
    return await upload_service.save_upload(file, "portfolio")


@router.post(
    "/resource",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def upload_resource_file(file: UploadFile = File(...)):
    """Upload a downloadable resource file (pdf/docx/xlsx/zip/...). Returns public URL."""
    return await upload_service.save_upload(file, "resource")
