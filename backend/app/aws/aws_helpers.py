# backend/app/aws/aws_helpers.py


import boto3
import botocore
import os
import uuid
import requests
from datetime import datetime

BUCKET_NAME = os.environ.get("S3_BUCKET")
S3_LOCATION = f"https://{BUCKET_NAME}.s3.amazonaws.com/"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

s3 = boto3.client(
   "s3",
   aws_access_key_id=os.environ.get("S3_KEY"),
   aws_secret_access_key=os.environ.get("S3_SECRET"),
   region_name=os.environ.get("S3_REGION", "us-east-1") 
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
        # Download image from DALL-E
        response = requests.get(image_url)
        if response.status_code != 200:
            return {"errors": "Failed to download image from DALL-E"}

        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"dreamscape_{timestamp}.png"

        # Upload to S3
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=filename,
            Body=response.content,
            ContentType='image/png',
            ACL=acl
        )

        # Return permanent S3 URL
        return {"url": f"{S3_LOCATION}{filename}"}

    except Exception as e:
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