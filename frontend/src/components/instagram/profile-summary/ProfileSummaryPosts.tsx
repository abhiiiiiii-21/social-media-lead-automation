"use client";

import React, { useState } from "react";
import { Grid, Heart, MessageCircle, Pin, ExternalLink, Film, Layers, Video, Image as ImageIcon, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "../campaign-results/utils/formatters";

interface PostItem {
  id: string;
  imageUrl?: string | null;
  image_url?: string | null;
  originalUrl?: string | null;
  originalImageUrl?: string | null;
  original_image_url?: string | null;
  mediaUrl?: string | null;
  media_url?: string | null;
  thumbnailUrl?: string | null;
  thumbnail_url?: string | null;
  thumbnail?: string | null;
  caption?: string | null;
  altText?: string | null;
  alt_text?: string | null;
  date?: string | null;
  uploadDate?: string | null;
  upload_date?: string | null;
  mediaType?: string | null;
  media_type?: string | null;
  isPinned?: boolean;
  is_pinned?: boolean;
  likes?: number | null;
  comments?: number | null;
  postUrl?: string;
  post_url?: string;
  isReel?: boolean;
  is_reel?: boolean;
  isCarousel?: boolean;
  is_carousel?: boolean;
}

interface ProfileSummaryPostsProps {
  posts?: (PostItem | any)[];
  username: string;
}

function formatDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return null;
  }
}

function resolvePostImage(post: any): string | null {
  const mediaUrl = post.mediaUrl || post.media_url;
  if (mediaUrl) {
    if (mediaUrl.startsWith("http")) return mediaUrl;
    return `http://localhost:8000${mediaUrl.startsWith("/") ? "" : "/"}${mediaUrl}`;
  }
  return post.imageUrl || post.image_url || post.originalImageUrl || post.original_image_url || post.originalUrl || post.thumbnailUrl || post.thumbnail_url || post.thumbnail || null;
}

export function ProfileSummaryPosts({ posts, username }: ProfileSummaryPostsProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-muted/10 border border-border/40">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Grid className="h-3.5 w-3.5" />
          <span>Latest Posts</span>
        </div>
        <p className="text-xs text-muted-foreground italic">No recent posts scraped yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-background border border-border/50 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Grid className="h-3.5 w-3.5" />
          <span>Latest Posts</span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {posts.map((post, idx) => {
          const postId = post.id || `post_${idx}`;
          const postLink = post.postUrl || post.post_url || `https://instagram.com/${username}`;
          const postImg = resolvePostImage(post);
          const hasImageError = failedImages[postId];

          // STRICT REAL CAPTION ONLY (Never display altText as caption)
          const captionText = post.caption || null;
          const isPinned = Boolean(post.isPinned ?? post.is_pinned);
          const rawDate = post.date || post.uploadDate || post.upload_date;
          const formattedDate = formatDate(rawDate);
          
          const mediaType = post.mediaType || post.media_type || (post.isReel || post.is_reel ? "Reel" : (post.isCarousel || post.is_carousel ? "Carousel" : "Image"));
          const likesCount = post.likes !== undefined && post.likes !== null ? formatNumber(post.likes) : "–";
          const commentsCount = post.comments !== undefined && post.comments !== null ? formatNumber(post.comments) : "–";

          return (
            <div
              key={postId}
              className="flex flex-col rounded-xl overflow-hidden bg-card border border-border/60 hover:border-border transition-all duration-200 shadow-xs group"
            >
              {/* Media Container with Badges */}
              <div className="relative aspect-square w-full bg-muted overflow-hidden">
                {postImg && !hasImageError ? (
                  <img
                    src={postImg}
                    alt={captionText || "Instagram post"}
                    referrerPolicy="no-referrer"
                    onError={() => {
                      setFailedImages((prev) => ({ ...prev, [postId]: true }));
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/40 p-4 text-center">
                    <ImageIcon className="h-8 w-8 mb-2 opacity-40" />
                    <span className="text-xs">{captionText ? captionText.slice(0, 50) : "Media Post"}</span>
                  </div>
                )}

                {/* Top Badges (Pinned & Media Type) */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                  {isPinned ? (
                    <Badge variant="secondary" className="gap-1 h-5 px-2 bg-amber-500/90 text-white border-0 text-[10px] font-semibold tracking-wider uppercase shadow-sm">
                      <Pin className="h-3 w-3 fill-white" />
                      Pinned
                    </Badge>
                  ) : <div />}

                  <Badge variant="secondary" className="gap-1 h-5 px-2 bg-black/70 text-white backdrop-blur-sm border-0 text-[10px] font-medium tracking-wide shadow-sm">
                    {mediaType === "Reel" && <Film className="h-3 w-3 text-rose-400" />}
                    {mediaType === "Carousel" && <Layers className="h-3 w-3 text-sky-400" />}
                    {mediaType === "Video" && <Video className="h-3 w-3 text-emerald-400" />}
                    {mediaType === "Image" && <ImageIcon className="h-3 w-3 text-zinc-300" />}
                    {mediaType}
                  </Badge>
                </div>

                {/* Overlay Link */}
                <a
                  href={postLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  title="View on Instagram"
                >
                  <div className="p-2 rounded-full bg-white/20 backdrop-blur-md">
                    <ExternalLink className="h-5 w-5" />
                  </div>
                </a>
              </div>

              {/* Post Details Card Content */}
              <div className="flex flex-col p-3 gap-2 flex-1 justify-between bg-card">
                {/* Caption */}
                <p className="text-xs text-foreground/90 line-clamp-2 leading-relaxed" title={captionText || undefined}>
                  {captionText || <span className="italic text-muted-foreground">No caption text</span>}
                </p>

                {/* Footer: Date & Engagement Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground/70" />
                    <span>{formattedDate || "Recent"}</span>
                  </div>

                  <div className="flex items-center gap-2.5 font-medium">
                    <div className="flex items-center gap-1" title="Likes">
                      <Heart className="h-3 w-3 text-rose-500 fill-rose-500/20" />
                      <span>{likesCount}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Comments">
                      <MessageCircle className="h-3 w-3 text-sky-500" />
                      <span>{commentsCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
