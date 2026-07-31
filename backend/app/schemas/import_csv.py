from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime


class ImportUploadResponse(BaseModel):
    upload_id: str
    detected_columns: List[str]
    total_rows: int
    filename: str


class ImportPreviewResponse(BaseModel):
    upload_id: str
    columns: List[str]
    total_rows: int
    preview_data: List[Dict[str, Any]]


class ImportMappingRequest(BaseModel):
    # Mapping of CSV column name to Database Field name
    # e.g. {"Instagram Username": "username", "Website": "website"}
    mapping: Dict[str, str]


class ImportValidateResponse(BaseModel):
    valid_rows: int
    invalid_rows: int
    errors: List[Dict[str, Any]] = Field(description="List of specific errors with row index and messages")
    warnings: List[Dict[str, Any]] = Field(description="List of specific warnings with row index and messages")
    duplicates_in_csv: int
    duplicates_in_db: int


class ImportExecuteRequest(BaseModel):
    campaign_id: str
    mapping: Dict[str, str]
    skip_duplicates: bool = True
    overwrite_existing: bool = False


class ImportExecuteResponse(BaseModel):
    campaign_id: str
    rows_imported: int
    rows_skipped: int
    rows_failed: int
    duplicate_count: int
    validation_errors: int
    execution_time_ms: int


class ImportHistoryResponse(BaseModel):
    id: str
    campaign_id: str
    filename: str
    total_rows: int
    imported_rows: int
    skipped_rows: int
    failed_rows: int
    duration_ms: int
    status: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
