from pathlib import Path

from django.apps import apps
from django.conf import settings
from django.core.files import File
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand
from django.db import models

from ecd_app.models import ELibrary


class Command(BaseCommand):
    help = "Migrate locally stored media files to Cloudinary."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Preview what would be migrated without saving changes.",
        )
        parser.add_argument(
            "--skip-elibrary-image-paths",
            action="store_true",
            help="Skip migrating ELibrary.image local path values.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        migrate_elibrary_paths = not options["skip_elibrary_image_paths"]

        if not getattr(settings, "USE_CLOUDINARY_MEDIA", False):
            self.stderr.write(
                self.style.ERROR(
                    "USE_CLOUDINARY_MEDIA is not enabled. Set USE_CLOUDINARY_MEDIA=1 first."
                )
            )
            return

        media_root = Path(settings.MEDIA_ROOT)
        stats = {
            "inspected": 0,
            "migrated": 0,
            "skipped_missing_local": 0,
            "skipped_empty": 0,
            "errors": 0,
            "elibrary_image_paths_migrated": 0,
            "elibrary_image_paths_skipped": 0,
        }

        for model in apps.get_app_config("ecd_app").get_models():
            file_fields = [
                f
                for f in model._meta.get_fields()
                if isinstance(f, (models.FileField, models.ImageField))
            ]
            if not file_fields:
                continue

            for obj in model.objects.all().iterator():
                for field in file_fields:
                    stats["inspected"] += 1
                    field_file = getattr(obj, field.name)
                    file_name = str(field_file.name or "").strip()

                    if not file_name:
                        stats["skipped_empty"] += 1
                        continue

                    local_relative_name = file_name.lstrip("/").removeprefix("media/")
                    local_path = media_root / local_relative_name

                    if not local_path.exists() or not local_path.is_file():
                        stats["skipped_missing_local"] += 1
                        continue

                    if dry_run:
                        self.stdout.write(
                            f"[DRY-RUN] {model.__name__}(id={obj.pk}).{field.name}: {local_relative_name}"
                        )
                        stats["migrated"] += 1
                        continue

                    try:
                        with local_path.open("rb") as fh:
                            file_basename = local_path.name
                            field_file.save(file_basename, File(fh), save=False)
                        obj.save(update_fields=[field.name])
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"Migrated {model.__name__}(id={obj.pk}).{field.name}"
                            )
                        )
                        stats["migrated"] += 1
                    except Exception as exc:
                        stats["errors"] += 1
                        self.stderr.write(
                            self.style.ERROR(
                                f"Failed {model.__name__}(id={obj.pk}).{field.name}: {exc}"
                            )
                        )

        if migrate_elibrary_paths:
            self._migrate_elibrary_image_paths(dry_run, media_root, stats)

        mode = "DRY-RUN" if dry_run else "LIVE"
        self.stdout.write("\n=== Cloudinary Media Migration Summary ===")
        self.stdout.write(f"Mode: {mode}")
        self.stdout.write(f"Inspected file fields: {stats['inspected']}")
        self.stdout.write(f"Migrated file fields: {stats['migrated']}")
        self.stdout.write(
            f"Skipped (empty field): {stats['skipped_empty']}"
        )
        self.stdout.write(
            f"Skipped (local file not found): {stats['skipped_missing_local']}"
        )
        self.stdout.write(
            "E-Library image path values migrated: "
            f"{stats['elibrary_image_paths_migrated']}"
        )
        self.stdout.write(
            "E-Library image path values skipped: "
            f"{stats['elibrary_image_paths_skipped']}"
        )
        self.stdout.write(f"Errors: {stats['errors']}")

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    "Dry-run only. Re-run without --dry-run to apply changes."
                )
            )

    def _migrate_elibrary_image_paths(self, dry_run, media_root, stats):
        frontend_public = Path(settings.BASE_DIR) / "ecd_frontend" / "public"

        for entry in ELibrary.objects.exclude(image__isnull=True).exclude(image=""):
            raw_value = (entry.image or "").strip()
            if not raw_value:
                stats["elibrary_image_paths_skipped"] += 1
                continue

            # Already cloud/external URL.
            if raw_value.startswith("http://") or raw_value.startswith("https://"):
                stats["elibrary_image_paths_skipped"] += 1
                continue

            candidate_relative = raw_value.lstrip("/")
            candidate_relative = candidate_relative.removeprefix("media/")

            candidates = [
                media_root / candidate_relative,
                frontend_public / raw_value.lstrip("/"),
                frontend_public / candidate_relative,
            ]

            local_path = None
            for candidate in candidates:
                if candidate.exists() and candidate.is_file():
                    local_path = candidate
                    break

            if local_path is None:
                stats["elibrary_image_paths_skipped"] += 1
                continue

            if dry_run:
                self.stdout.write(
                    f"[DRY-RUN] ELibrary(id={entry.pk}).image: {raw_value}"
                )
                stats["elibrary_image_paths_migrated"] += 1
                continue

            try:
                target_name = f"library_images/{local_path.name}"
                with local_path.open("rb") as fh:
                    stored_name = default_storage.save(target_name, File(fh))
                entry.image = default_storage.url(stored_name)
                entry.save(update_fields=["image"])
                stats["elibrary_image_paths_migrated"] += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Migrated ELibrary(id={entry.pk}).image"
                    )
                )
            except Exception as exc:
                stats["errors"] += 1
                self.stderr.write(
                    self.style.ERROR(
                        f"Failed ELibrary(id={entry.pk}).image: {exc}"
                    )
                )
