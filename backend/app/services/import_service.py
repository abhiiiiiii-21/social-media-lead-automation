import os
import tempfile
import uuid
from typing import Dict, List, Tuple
from datetime import datetime
import pandas as pd
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import re

from app.models.lead import Lead
from app.models.import_history import ImportHistory
from app.schemas.import_csv import (
    ImportUploadResponse,
    ImportPreviewResponse,
    ImportValidateResponse,
    ImportExecuteRequest,
    ImportExecuteResponse,
)


class ImportService:
    def __init__(self):
        self.temp_dir = os.path.join(tempfile.gettempdir(), "lead_automations_imports")
        os.makedirs(self.temp_dir, exist_ok=True)

    def _get_file_path(self, upload_id: str) -> str:
        return os.path.join(self.temp_dir, f"{upload_id}.csv")

    def auto_detect_columns(self, columns: List[str]) -> List[str]:
        # Mapping heuristics
        mapping_rules = {
            r"(?i)^(username|instagram|instagram_username|handle)$": "username",
            r"(?i)^(website|url|site|link)$": "website",
            r"(?i)^(company|business|business_name|agency|organization)$": "business_name",
            r"(?i)^(email|mail|e-mail)$": "email",
            r"(?i)^(phone|mobile|cell|contact_number)$": "phone",
            r"(?i)^(category|industry|niche)$": "category",
            r"(?i)^(followers|follower_count)$": "followers",
            r"(?i)^(following|following_count)$": "following",
            r"(?i)^(name|full_name|person_name)$": "full_name",
            r"(?i)^(city|town)$": "city",
            r"(?i)^(state|province)$": "state",
            r"(?i)^(country)$": "country",
            r"(?i)^(bio|description)$": "bio",
            r"(?i)^(profile_url|url|profile)$": "profile_url",
        }

        detected = []
        for col in columns:
            matched = False
            for pattern, db_field in mapping_rules.items():
                if re.match(pattern, str(col).strip()):
                    detected.append(db_field)
                    matched = True
                    break
            if not matched:
                detected.append(col)
        return detected

    async def upload_csv(
        self, file_content: bytes, filename: str
    ) -> ImportUploadResponse:
        upload_id = str(uuid.uuid4())
        file_path = self._get_file_path(upload_id)

        with open(file_path, "wb") as f:
            f.write(file_content)

        try:
            df = pd.read_csv(file_path, nrows=0)
            columns = df.columns.tolist()
            detected_columns = self.auto_detect_columns(columns)

            # Re-read to get total rows efficiently
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                total_rows = sum(1 for _ in f) - 1  # exclude header

            return ImportUploadResponse(
                upload_id=upload_id,
                detected_columns=detected_columns,
                total_rows=max(0, total_rows),
                filename=filename,
            )
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise ValueError(f"Failed to parse CSV: {str(e)}")

    async def preview_csv(self, upload_id: str) -> ImportPreviewResponse:
        file_path = self._get_file_path(upload_id)
        if not os.path.exists(file_path):
            raise ValueError("Upload not found or expired")

        try:
            df = pd.read_csv(file_path, nrows=20, dtype=str).fillna("")
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                total_rows = sum(1 for _ in f) - 1

            return ImportPreviewResponse(
                upload_id=upload_id,
                columns=df.columns.tolist(),
                total_rows=max(0, total_rows),
                preview_data=df.to_dict(orient="records"),
            )
        except Exception as e:
            raise ValueError(f"Failed to read CSV preview: {str(e)}")

    def _validate_row(self, row: pd.Series) -> Tuple[bool, List[str], List[str]]:
        errors = []
        warnings = []

        # Username is required
        username = str(row.get("username", "")).strip()
        if not username or username.lower() == "nan":
            errors.append("Username is required")

        # Email format check
        email = str(row.get("email", "")).strip()
        if email and email.lower() != "nan":
            if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                warnings.append(f"Invalid email format: {email}")

        # Website format check
        website = str(row.get("website", "")).strip()
        if website and website.lower() != "nan":
            if not re.match(
                r"^(https?://)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$",
                website,
            ):
                warnings.append(f"Invalid website format: {website}")

        return len(errors) == 0, errors, warnings

    async def validate_csv(
        self, upload_id: str, mapping: Dict[str, str], session: AsyncSession
    ) -> ImportValidateResponse:
        file_path = self._get_file_path(upload_id)
        if not os.path.exists(file_path):
            raise ValueError("Upload not found or expired")

        try:
            # Read full csv
            df = pd.read_csv(file_path, dtype=str).fillna("")

            # Apply mapping
            mapped_df = df.rename(columns=mapping)

            errors_list = []
            warnings_list = []
            valid_rows = 0
            invalid_rows = 0

            # Check for duplicates in CSV
            duplicates_in_csv = 0
            if "username" in mapped_df.columns:
                username_counts = mapped_df["username"].value_counts()
                duplicates_in_csv = len(mapped_df) - len(username_counts)

            # Basic validation
            usernames_in_csv = []
            for idx, row in mapped_df.iterrows():
                is_valid, errors, warnings = self._validate_row(row)

                if (
                    "username" in row
                    and str(row["username"]).strip()
                    and str(row["username"]).strip().lower() != "nan"
                ):
                    usernames_in_csv.append(str(row["username"]).strip())

                if not is_valid:
                    invalid_rows += 1
                    errors_list.append({"row": int(idx) + 2, "messages": errors})
                else:
                    valid_rows += 1

                if warnings:
                    warnings_list.append({"row": int(idx) + 2, "messages": warnings})

            # Check duplicates in DB (by username)
            duplicates_in_db = 0
            if usernames_in_csv:
                # Chunk to avoid huge IN clauses
                chunk_size = 1000
                for i in range(0, len(usernames_in_csv), chunk_size):
                    chunk = usernames_in_csv[i : i + chunk_size]
                    stmt = select(Lead.username).where(Lead.username.in_(chunk))
                    result = await session.execute(stmt)
                    existing_usernames = result.scalars().all()
                    duplicates_in_db += len(existing_usernames)

            return ImportValidateResponse(
                valid_rows=valid_rows,
                invalid_rows=invalid_rows,
                errors=errors_list[:100],  # limit response size
                warnings=warnings_list[:100],
                duplicates_in_csv=duplicates_in_csv,
                duplicates_in_db=duplicates_in_db,
            )

        except Exception as e:
            raise ValueError(f"Failed to validate CSV: {str(e)}")

    async def execute_import(
        self, upload_id: str, request: ImportExecuteRequest, session: AsyncSession
    ) -> ImportExecuteResponse:
        file_path = self._get_file_path(upload_id)
        if not os.path.exists(file_path):
            raise ValueError("Upload not found or expired")

        start_time = datetime.now()

        try:
            df = pd.read_csv(file_path, dtype=str).fillna("")
            mapped_df = df.rename(columns=request.mapping)

            rows_imported = 0
            rows_skipped = 0
            rows_failed = 0
            duplicate_count = 0
            validation_errors = 0

            # Fetch existing usernames for campaign if skip_duplicates is true
            existing_usernames = set()
            if request.skip_duplicates and "username" in mapped_df.columns:
                stmt = select(Lead.username).where(
                    Lead.campaign_id == request.campaign_id
                )
                result = await session.execute(stmt)
                existing_usernames = set(result.scalars().all())

            # Track seen in this CSV to handle duplicates within the file
            seen_usernames = set()

            leads_to_insert = []

            for idx, row in mapped_df.iterrows():
                is_valid, errors, _ = self._validate_row(row)
                if not is_valid:
                    rows_failed += 1
                    validation_errors += 1
                    continue

                username = str(row.get("username", "")).strip()

                # Duplicate checking
                if username in seen_usernames or (
                    request.skip_duplicates and username in existing_usernames
                ):
                    rows_skipped += 1
                    duplicate_count += 1
                    continue

                seen_usernames.add(username)

                # Prepare lead dictionary
                lead_data = {
                    "campaign_id": request.campaign_id,
                    "platform": "Instagram",  # Defaulting to Instagram for now as per schema
                    "username": username,
                    "source": "CSV Import",
                    "qualification_status": "Pending",
                }

                # Optional fields
                optional_fields = [
                    "full_name",
                    "business_name",
                    "bio",
                    "website",
                    "email",
                    "phone",
                    "city",
                    "state",
                    "country",
                    "category",
                    "profile_url",
                ]
                for field in optional_fields:
                    if field in mapped_df.columns:
                        val = str(row.get(field, "")).strip()
                        if val and val.lower() != "nan":
                            lead_data[field] = val

                # Integer fields
                for field in ["followers", "following"]:
                    if field in mapped_df.columns:
                        val = str(row.get(field, "")).strip()
                        if val.isdigit():
                            lead_data[field] = int(val)

                leads_to_insert.append(Lead(**lead_data))

                # Bulk insert in chunks
                if len(leads_to_insert) >= 1000:
                    session.add_all(leads_to_insert)
                    await session.flush()
                    rows_imported += len(leads_to_insert)
                    leads_to_insert = []

            if leads_to_insert:
                session.add_all(leads_to_insert)
                await session.flush()
                rows_imported += len(leads_to_insert)

            # Create import history record
            duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)

            history = ImportHistory(
                campaign_id=request.campaign_id,
                filename=os.path.basename(file_path),
                total_rows=len(df),
                imported_rows=rows_imported,
                skipped_rows=rows_skipped,
                failed_rows=rows_failed,
                duration_ms=duration_ms,
                status="Completed",
            )
            session.add(history)
            await session.commit()

            # Clean up file
            try:
                os.remove(file_path)
            except Exception:
                pass

            return ImportExecuteResponse(
                campaign_id=request.campaign_id,
                rows_imported=rows_imported,
                rows_skipped=rows_skipped,
                rows_failed=rows_failed,
                duplicate_count=duplicate_count,
                validation_errors=validation_errors,
                execution_time_ms=duration_ms,
            )

        except Exception as e:
            await session.rollback()
            raise ValueError(f"Failed to execute import: {str(e)}")


import_service = ImportService()
