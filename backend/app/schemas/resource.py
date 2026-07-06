from pydantic import BaseModel


class ResourceItemCreate(BaseModel):
    category: str = ""
    title: str
    description: str = ""
    file_type: str = ""
    file_size: str = ""


class ResourceItemUpdate(BaseModel):
    category: str | None = None
    title: str | None = None
    description: str | None = None
    file_type: str | None = None
    file_size: str | None = None


class ResourceItemResponse(BaseModel):
    id: int
    category: str
    title: str
    description: str
    file_type: str
    file_size: str
    download_count: int

    model_config = {"from_attributes": True}
