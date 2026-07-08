from __future__ import annotations

from http import HTTPStatus
from http.server import BaseHTTPRequestHandler

from api._common import load_workspace_imports, write_json, write_options

load_workspace_imports()

from scripts.file_import_extract import FileImportError, extract_uploaded_file  # noqa: E402
from scripts.multipart_upload import MultipartUploadError, read_uploaded_file  # noqa: E402


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self) -> None:
        write_options(self)

    def do_POST(self) -> None:
        try:
            filename, content_type, data = read_uploaded_file(self.headers, self.rfile)
            response = extract_uploaded_file(
                filename=filename,
                content_type=content_type,
                data=data,
            )
        except (FileImportError, MultipartUploadError) as error:
            write_json(self, {"ok": False, "error": str(error)}, HTTPStatus.BAD_REQUEST)
            return
        except Exception as error:
            write_json(self, {"ok": False, "error": f"File import failed: {error}"}, HTTPStatus.BAD_GATEWAY)
            return
        write_json(self, {"ok": True, "file": response})
