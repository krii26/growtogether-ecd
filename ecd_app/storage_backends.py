from cloudinary_storage.storage import RawMediaCloudinaryStorage


class ChatDocumentCloudinaryStorage(RawMediaCloudinaryStorage):
    """Store chat attachments as Cloudinary raw files (PDF, DOCX, TXT, etc.)."""

