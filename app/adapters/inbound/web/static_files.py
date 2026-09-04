from pathlib import Path

from fastapi.staticfiles import StaticFiles


class ExpoStaticFiles(StaticFiles):
    """Serve Expo's static export, including extensionless page URLs."""

    def lookup_path(self, path: str):
        full_path, stat_result = super().lookup_path(path)
        if stat_result is None and not Path(path).suffix:
            # Keep Starlette's traversal and symlink protections for both lookups.
            return super().lookup_path(f"{path}.html")
        return full_path, stat_result
