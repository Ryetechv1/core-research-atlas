#!/usr/bin/env python3
"""Mini file explorer that exports a folder tree for the CORE Atlas app.

Run with a GUI picker:

    python scripts/mini_file_explorer.py

Or scan a folder directly:

    python scripts/mini_file_explorer.py --path "C:\\Users\\alola\\Downloads\\Example"

The output file is `workspace_tree.json` inside the selected folder by default.
Import that JSON through the app's File Manager Import Files button to recreate
the nested folder/file structure in the virtual explorer.
"""

from __future__ import annotations

import argparse
import json
import os
import tkinter as tk
from datetime import datetime, timezone
from pathlib import Path
from tkinter import filedialog, ttk
from typing import Any


IGNORED_DIRS = {
    ".git",
    ".hg",
    ".svn",
    "__pycache__",
    ".mypy_cache",
    ".pytest_cache",
    ".ruff_cache",
    ".venv",
    "venv",
    "env",
    "node_modules",
}


def utc_iso(timestamp: float) -> str:
    return datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()


def scan_folder(folder: Path) -> dict[str, Any]:
    folder = folder.resolve()
    flat_files: list[str] = []

    def walk(path: Path) -> dict[str, Any]:
        stat = path.stat()
        node: dict[str, Any] = {
            "name": path.name or str(path),
            "path": str(path),
            "relativePath": "." if path == folder else str(path.relative_to(folder)),
            "type": "folder" if path.is_dir() else "file",
            "size": 0 if path.is_dir() else stat.st_size,
            "modifiedAt": utc_iso(stat.st_mtime),
        }
        if path.is_dir():
            children = []
            try:
                entries = sorted(path.iterdir(), key=lambda item: (item.is_file(), item.name.lower()))
            except OSError:
                entries = []
            for entry in entries:
                if entry.is_dir() and entry.name in IGNORED_DIRS:
                    continue
                if entry.name == "workspace_tree.json":
                    continue
                children.append(walk(entry))
            node["children"] = children
        else:
            flat_files.append(str(path))
        return node

    root = walk(folder)
    return {
        "schema": "core-atlas-workspace-tree-v1",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "rootPath": str(folder),
        "root": root,
        "files": flat_files,
    }


def write_workspace_tree(folder: Path, output_name: str = "workspace_tree.json") -> Path:
    payload = scan_folder(folder)
    output = folder / output_name
    output.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return output


class MiniFileExplorer:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Codex File Manager")
        self.root.geometry("560x640")
        self.current_dir = Path.cwd()

        self.tree = ttk.Treeview(root)
        self.tree.heading("#0", text="Workspace Tree", anchor="w")
        self.tree.pack(fill=tk.BOTH, expand=True)

        self.status = tk.StringVar(value="Select a folder to export workspace_tree.json")
        self.status_label = ttk.Label(root, textvariable=self.status)
        self.status_label.pack(fill=tk.X, padx=8, pady=(6, 2))

        self.btn_load = ttk.Button(root, text="Select Folder", command=self.load_folder)
        self.btn_load.pack(fill=tk.X, padx=8, pady=(0, 8))

    def load_folder(self) -> None:
        folder_selected = filedialog.askdirectory()
        if folder_selected:
            self.current_dir = Path(folder_selected)
            self.refresh_tree()

    def refresh_tree(self) -> None:
        for item_id in self.tree.get_children():
            self.tree.delete(item_id)

        payload = scan_folder(self.current_dir)
        root_node = self._insert_node("", payload["root"])
        self.tree.item(root_node, open=True)
        output = write_workspace_tree(self.current_dir)
        self.status.set(f"Saved {output}")

    def _insert_node(self, parent: str, node: dict[str, Any]) -> str:
        label = node.get("name") or node.get("path") or "Untitled"
        icon = "[D]" if node.get("type") == "folder" else "[F]"
        item_id = self.tree.insert(parent, "end", text=f"{icon} {label}", open=False)
        for child in node.get("children", []):
            self._insert_node(item_id, child)
        return item_id


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Export a selected folder as workspace_tree.json.")
    parser.add_argument("--path", type=Path, help="Folder to scan without opening the Tkinter picker.")
    parser.add_argument("--output-name", default="workspace_tree.json", help="Output JSON filename.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.path:
        output = write_workspace_tree(args.path, args.output_name)
        print(output)
        return

    root = tk.Tk()
    app = MiniFileExplorer(root)
    root.mainloop()


if __name__ == "__main__":
    main()
