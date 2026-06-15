from datetime import datetime

def _serialize(doc: dict) -> dict:
    if doc is None:
        return None
    doc.pop("_id", None)
    if isinstance(doc.get("created_at"), str):
        try:
            doc["created_at"] = datetime.fromisoformat(doc["created_at"])
        except Exception:
            pass
    return doc