# Selectors for Instagram DM Automation

# Profile Selectors
MESSAGE_BUTTON = "div[role='button']:has-text('Message')"
PRIVATE_ACCOUNT_TEXT = "text=This account is private"
USER_NOT_FOUND_TEXT = "text=Sorry, this page isn't available."

# DM Window Selectors
MESSAGE_INPUT = "div[role='textbox'][aria-label='Message']"
SEND_BUTTON = "div[role='button']:has-text('Send')"
BUBBLE_MESSAGE_TEXT = "div[dir='auto']"  # Standard text block in bubbles

# Errors/Warnings in DM Window
CANNOT_MESSAGE_TEXT = "text=You can't message this account unless they follow you."
RESTRICTED_TEXT = "text=Not Everyone Can Message This Account"
