import boto3
import uuid

from fastapi import UploadFile, HTTPException

import boto3 as _boto3

AWS_REGION = "us-east-2"
S3_BUCKET = "spinrealm"

s3 = boto3.client(
    "s3",
    region_name=AWS_REGION
)


async def upload_avatar_to_s3(file: UploadFile, user_id: str) -> str:

    contents = await file.read()

    extension = "jpg"

    if file.content_type == "image/png":
        extension = "png"
    elif file.content_type == "image/webp":
        extension = "webp"

    key = f"avatars/{user_id}/{uuid.uuid4()}.{extension}"

    s3.put_object(
        Bucket=S3_BUCKET,
        Key=key,
        Body=contents,
        ContentType=file.content_type,
    )

    return f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{key}"

async def upload_collection_image_to_s3(
    file: UploadFile,
    user_id: str,
    collection_id: str,
) -> str:
 
    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Image is empty",
        )

    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image must be 5 MB or smaller",
        )

    extension = "jpg"

    if file.content_type == "image/png":
        extension = "png"
    elif file.content_type == "image/webp":
        extension = "webp"
    elif file.content_type != "image/jpeg":
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, and WebP images are allowed",
        )

    key = (
        f"collection-items/{user_id}/{collection_id}/"
        f"{uuid.uuid4()}.{extension}"
    )

    s3.put_object(
        Bucket=S3_BUCKET,
        Key=key,
        Body=contents,
        ContentType=file.content_type,
    )

    return f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{key}"