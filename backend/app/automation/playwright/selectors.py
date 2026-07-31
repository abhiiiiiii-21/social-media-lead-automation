# Login Selectors
LOGIN_USERNAME_INPUT = "input[name='username']"
LOGIN_PASSWORD_INPUT = "input[name='password']"
LOGIN_SUBMIT_BUTTON = "button[type='submit']"
LOGIN_ERROR_BANNER = "div[data-testid='login-error-message'], p#slfErrorAlert"
LOGIN_TWO_FACTOR_INPUT = "input[name='verificationCode']"

# Validation Selectors
# If we see any of these, we consider the session valid (logged in)
LOGGED_IN_INDICATORS = [
    "svg[aria-label='Home']",
    "svg[aria-label='Direct']",
    "svg[aria-label='New post']",
    "a[href='/explore/']",
]

# If we see these, we are not logged in
LOGGED_OUT_INDICATORS = ["input[name='username']", "text='Log In'", "text='Sign Up'"]

# Modals
SAVE_INFO_MODAL_BUTTON_NOT_NOW = "button:has-text('Not Now')"
TURN_ON_NOTIFICATIONS_BUTTON_NOT_NOW = "button:has-text('Not Now')"
