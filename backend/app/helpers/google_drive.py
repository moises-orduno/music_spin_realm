# import io
# import os
# from pathlib import Path

# from fastapi import UploadFile
# from google.auth.transport.requests import Request
# from google.oauth2.credentials import Credentials
# from google_auth_oauthlib.flow import InstalledAppFlow
# from googleapiclient.discovery import build
# from googleapiclient.http import MediaIoBaseUpload


# SCOPES = [
#     "https://www.googleapis.com/auth/drive.file"
# ]

# BASE_DIR = Path(__file__).resolve().parents[2]

# CREDENTIALS_FILE = BASE_DIR / "credentials.json"
# TOKEN_FILE = BASE_DIR / "token.json"


# def get_google_drive_service():

#     creds = None

#     # Existing OAuth credentials
#     if TOKEN_FILE.exists():
#         creds = Credentials.from_authorized_user_file(
#             str(TOKEN_FILE),
#             SCOPES
#         )

#     # Refresh expired token
#     if creds and creds.expired and creds.refresh_token:
#         creds.refresh(Request())

#     # First time: ask user to authorize
#     if not creds or not creds.valid:

#         flow = InstalledAppFlow.from_client_secrets_file(
#             str(CREDENTIALS_FILE),
#             SCOPES
#         )

#         creds = flow.run_local_server(port=0)

#         with open(TOKEN_FILE, "w") as token:
#             token.write(creds.to_json())

#     return build(
#         "drive",
#         "v3",
#         credentials=creds
#     )


# async def upload_avatar_to_google_drive(
#     file: UploadFile,
#     user_id: str
# ) -> str:

#     contents = await file.read()

#     service = get_google_drive_service()

#     media = MediaIoBaseUpload(
#         io.BytesIO(contents),
#         mimetype=file.content_type,
#         resumable=True
#     )

#     file_metadata = {
#         "name": f"avatar_{user_id}"
#     }

#     uploaded = service.files().create(
#         body=file_metadata,
#         media_body=media,
#         fields="id"
#     ).execute()

#     file_id = uploaded["id"]

#     # Make the file publicly readable
#     service.permissions().create(
#         fileId=file_id,
#         body={
#             "type": "anyone",
#             "role": "reader"
#         }
#     ).execute()

#     return f"https://drive.google.com/uc?id={file_id}"