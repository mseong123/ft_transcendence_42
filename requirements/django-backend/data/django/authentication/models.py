from django.contrib.auth import validators
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _

class AlphaNumericUsernameValidator(validators.UnicodeUsernameValidator):
    # Allow lower alphanumeric and "-" only
    regex = r"^[a-z0-9-]+$"
    message = _(
        "Enter a valid username. This value may contain only lowercase alphanumeric characters."
    )
    flags = 0

# Replace the default USERNAME_VALIDATOR with your custom validator
User._meta.get_field('username').validators = [AlphaNumericUsernameValidator()]