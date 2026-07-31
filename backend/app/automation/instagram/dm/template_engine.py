from app.models.lead import Lead


def render_message_template(template_body: str, lead: Lead) -> str:
    """
    Replaces placeholders in the template with data from the Lead model.
    Missing variables become empty strings.
    """

    mapping = {
        "{name}": lead.full_name or "",
        "{username}": lead.username or "",
        "{followers}": str(lead.followers) if lead.followers else "",
        "{following}": str(lead.following) if lead.following else "",
        "{bio}": lead.bio or "",
        "{category}": lead.category or ""
    }

    rendered = template_body
    for key, value in mapping.items():
        rendered = rendered.replace(key, value)

    return rendered.strip()
