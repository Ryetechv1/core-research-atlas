"""Small multipart/form-data reader for local API handlers."""

from __future__ import annotations

from email import policy
from email.parser import BytesParser
from typing import Any


class MultipartUploadError(ValueError):
    """Raised when a multipart upload is missing or malformed."""


def read_uploaded_file(headers: Any, stream: Any, field_name: str = "file") -> tuple[str, str, bytes]:
    content_type = headers.get("Content-Type", "")
    if "multipart/form-data" not in content_type.lower():
        raise MultipartUploadError("Expected multipart/form-data upload.")

    length = int(headers.get("Content-Length", "0"))
    if length <= 0:
        raise MultipartUploadError("Uploaded request body is empty.")

    raw = stream.read(length)
    header = f"Content-Type: {content_type}\r\nMIME-Version: 1.0\r\n\r\n".encode("utf-8")
    message = BytesParser(policy=policy.default).parsebytes(header + raw)

    if not message.is_multipart():
        raise MultipartUploadError("Upload body was not multipart.")

    for part in message.iter_parts():
        disposition_name = part.get_param("name", header="content-disposition")
        if disposition_name != field_name:
            continue
        filename = part.get_filename()
        if not filename:
            raise MultipartUploadError(f"Multipart field '{field_name}' is missing a filename.")
        payload = part.get_payload(decode=True)
        if payload is None:
            content = part.get_content()
            payload = content.encode("utf-8") if isinstance(content, str) else bytes(content)
        return filename, part.get_content_type(), payload

    raise MultipartUploadError(f"Expected multipart field named '{field_name}'.")
