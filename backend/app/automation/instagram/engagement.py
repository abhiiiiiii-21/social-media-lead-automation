from typing import Dict, Any, List, Optional


def calculate_engagement(followers: int, posts: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes exact engagement metrics, post distribution percentages,
    average likes, average comments, and estimated engagement rate.
    If likes/comments are unexposed (null), returns None (null in JSON).
    """
    if not posts:
        return {
            "averageLikes": None,
            "averageComments": None,
            "totalReels": 0,
            "totalImagePosts": 0,
            "totalCarouselPosts": 0,
            "reelPercentage": 0.0,
            "carouselPercentage": 0.0,
            "imagePercentage": 0.0,
            "estimatedEngagementRate": 0.0,
            "postingFrequency": "Unknown",
        }

    total_posts = len(posts)
    likes_list = [p.get("likes") for p in posts if p.get("likes") is not None]
    comments_list = [p.get("comments") for p in posts if p.get("comments") is not None]

    avg_likes = round(sum(likes_list) / len(likes_list), 1) if likes_list else None
    avg_comments = round(sum(comments_list) / len(comments_list), 1) if comments_list else None

    total_reels = sum(1 for p in posts if p.get("isReel") or "/reel/" in str(p.get("postUrl", "")))
    total_carousels = sum(1 for p in posts if p.get("isCarousel"))
    total_images = sum(1 for p in posts if p.get("isImage") and not (p.get("isReel") or p.get("isCarousel")))

    # Calculate percentages
    reel_pct = round((total_reels / total_posts) * 100, 1) if total_posts > 0 else 0.0
    carousel_pct = round((total_carousels / total_posts) * 100, 1) if total_posts > 0 else 0.0
    image_pct = round((total_images / total_posts) * 100, 1) if total_posts > 0 else 0.0

    # Calculate engagement rate
    eng_rate = 0.0
    if followers > 0 and ((avg_likes or 0) > 0 or (avg_comments or 0) > 0):
        eng_rate = round((((avg_likes or 0) + (avg_comments or 0)) / followers) * 100, 2)

    # Estimate posting frequency
    if total_posts >= 12:
        posting_frequency = "Consistent (3-5 posts / week)"
    elif total_posts >= 6:
        posting_frequency = "Moderate (1-2 posts / week)"
    else:
        posting_frequency = "Occasional / Selective"

    return {
        "averageLikes": avg_likes,
        "averageComments": avg_comments,
        "totalReels": total_reels,
        "totalImagePosts": total_images,
        "totalCarouselPosts": total_carousels,
        "reelPercentage": reel_pct,
        "carouselPercentage": carousel_pct,
        "imagePercentage": image_pct,
        "estimatedEngagementRate": eng_rate,
        "postingFrequency": posting_frequency,
    }
