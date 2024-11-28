# backend/app/aws/aws_helpers.py

import boto3
import botocore
import os
import uuid
import requests
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

BUCKET_NAME = os.environ.get("S3_BUCKET")
S3_LOCATION = f"https://{BUCKET_NAME}.s3.amazonaws.com/"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

s3 = boto3.client(
   "s3",
   aws_access_key_id=os.environ.get("S3_KEY"),
   aws_secret_access_key=os.environ.get("S3_SECRET")
)

def get_unique_filename(filename):
    ext = filename.rsplit(".", 1)[1].lower()
    unique_filename = uuid.uuid4().hex
    return f"{unique_filename}.{ext}"

def upload_dalle_image_to_s3(image_url, acl="public-read"):
    """
    Downloads image from DALL-E URL and uploads to S3
    Returns the permanent S3 URL
    """
    try:
        logger.info(f"Starting DALL-E image download from: {image_url}")
        # Download image from DALL-E
        response = requests.get(image_url)
        if response.status_code != 200:
            logger.error(f"Failed to download DALL-E image: {response.status_code}")
            return {"errors": f"Failed to download image from DALL-E: {response.status_code}"}

        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"dreamscape_{timestamp}.png"
        logger.info(f"Generated filename: {filename}")

        try:
            # Upload to S3
            logger.info(f"Attempting S3 upload to bucket: {BUCKET_NAME}")
            s3.put_object(
                Bucket=BUCKET_NAME,
                Key=filename,
                Body=response.content,
                ContentType='image/png',
                ACL=acl
            )
            s3_url = f"{S3_LOCATION}{filename}"
            logger.info(f"Successfully uploaded to S3: {s3_url}")
            return {"url": s3_url}

        except Exception as s3_error:
            logger.error(f"S3 upload error: {str(s3_error)}")
            return {"errors": f"S3 upload failed: {str(s3_error)}"}

    except Exception as e:
        logger.error(f"General error in upload_dalle_image_to_s3: {str(e)}")
        return {"errors": str(e)}

def remove_file_from_s3(image_url):
    """
    Removes file from S3 bucket
    Returns True if successful, error dict if not
    """
    key = image_url.rsplit("/", 1)[1]
    try:
        s3.delete_object(
            Bucket=BUCKET_NAME,
            Key=key
        )
    except Exception as e:
        return {"errors": str(e)}
    return True