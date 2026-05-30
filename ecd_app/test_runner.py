import os

from django.test.runner import DiscoverRunner


class StablePostgresTestRunner(DiscoverRunner):
    """Default to keepdb to avoid flaky drop errors on pooled Postgres hosts."""

    def __init__(self, *args, **kwargs):
        keepdb_default = os.environ.get('DJANGO_TEST_KEEPDB', '1').strip().lower() in {
            '1',
            'true',
            'yes',
            'on',
        }
        # Django passes keepdb=False by default from CLI parser; override it
        # unless explicitly disabled through environment configuration.
        if keepdb_default:
            kwargs['keepdb'] = True
        else:
            kwargs.setdefault('keepdb', False)
        super().__init__(*args, **kwargs)
