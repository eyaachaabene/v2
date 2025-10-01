"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Clock, 
  UserPlus,
  Users,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { CommunityPost, Comment } from '@/hooks/use-community'

interface CommunityPostCardProps {
  post: CommunityPost
  onLike: (postId: string) => void
  onComment: (postId: string, content: string) => void
  onShare: (postId: string, platform?: string) => void
  onConnect?: (userId: string) => void
  onFollow?: (userId: string) => void
  expandedComments: Set<string>
  toggleComments: (postId: string) => void
  newComments: Record<string, string>
  setNewComments: React.Dispatch<React.SetStateAction<Record<string, string>>>
  loadingComments: Set<string>
  onLoadAllComments: (postId: string) => void
  allCommentsLoaded: Set<string>
  isAuthenticated: boolean
}

export function CommunityPostCard({
  post,
  onLike,
  onComment,
  onShare,
  onConnect,
  onFollow,
  expandedComments,
  toggleComments,
  newComments,
  setNewComments,
  loadingComments,
  onLoadAllComments,
  allCommentsLoaded,
  isAuthenticated
}: CommunityPostCardProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleQuickAction = async (action: 'connect' | 'follow', userId: string) => {
    if (!userId || !isAuthenticated) return
    
    setActionLoading(action)
    try {
      if (action === 'connect' && onConnect) {
        await onConnect(userId)
      } else if (action === 'follow' && onFollow) {
        await onFollow(userId)
      }
    } finally {
      setActionLoading(null)
    }
  }

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'farmer': return 'bg-green-100 text-green-800'
      case 'buyer': return 'bg-blue-100 text-blue-800'
      case 'supplier': return 'bg-purple-100 text-purple-800'
      case 'ngo': return 'bg-orange-100 text-orange-800'
      case 'partner': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Post Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link href={post.authorId ? `/profile/${post.authorId}` : '#'}>
                <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all">
                  <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                  <AvatarFallback>
                    {post.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link 
                    href={post.authorId ? `/profile/${post.authorId}` : '#'}
                    className="font-semibold hover:text-primary transition-colors cursor-pointer"
                  >
                    {post.author}
                  </Link>
                  {post.authorRole && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getRoleBadgeColor(post.authorRole)}`}
                    >
                      {post.authorRole}
                    </Badge>
                  )}
                  {post.isConnected && (
                    <Badge variant="outline" className="text-xs text-green-600">
                      <Users className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{post.location}</span>
                  <span>•</span>
                  <Clock className="h-3 w-3" />
                  <span>{post.time}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">{post.category}</Badge>
              
              {/* Quick Actions for non-connected users */}
              {isAuthenticated && post.authorId && !post.isConnected && (
                <div className="flex gap-1">
                  {!post.isFollowing && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickAction('follow', post.authorId!)}
                      disabled={actionLoading === 'follow'}
                      className="h-7 text-xs"
                    >
                      {actionLoading === 'follow' ? '...' : 'Follow'}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickAction('connect', post.authorId!)}
                    disabled={actionLoading === 'connect'}
                    className="h-7 text-xs"
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    {actionLoading === 'connect' ? '...' : 'Connect'}
                  </Button>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {post.authorId && (
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${post.authorId}`} className="flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onShare(post.id, 'copy')}>
                    Share Link
                  </DropdownMenuItem>
                  <DropdownMenuItem>Report Post</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Post Content */}
          <p className="text-foreground leading-relaxed">{post.content}</p>

          {/* Post Image */}
          {post.images && post.images.length > 0 && (
            <div className="rounded-lg overflow-hidden">
              <Image
                src={post.images[0] || "/placeholder.svg"}
                alt="Post image"
                width={600}
                height={300}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Post Actions */}
          <div className="pt-3 border-t space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center gap-2 ${post.userLiked ? 'text-red-500' : ''}`}
                  onClick={() => onLike(post.id)}
                  disabled={!isAuthenticated}
                >
                  <Heart className={`h-4 w-4 ${post.userLiked ? 'fill-current' : ''}`} />
                  <span>{post.likes}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => toggleComments(post.id)}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => onShare(post.id)}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>
            </div>

            {/* Comments Section */}
            {expandedComments.has(post.id) && (
              <div className="space-y-3 pt-3 border-t">
                {/* Add Comment */}
                {isAuthenticated && (
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComments[post.id] || ""}
                      onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                      className="min-h-[80px] resize-none"
                    />
                    <Button 
                      onClick={() => onComment(post.id, newComments[post.id] || "")}
                      disabled={!newComments[post.id]?.trim()}
                      className="self-end"
                    >
                      Post
                    </Button>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-3">
                  {post.postComments?.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Link href={`/profile/${comment.user.id}`}>
                        <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-1 transition-all">
                          <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                          <AvatarFallback className="text-xs">
                            {comment.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Link 
                            href={`/profile/${comment.user.id}`}
                            className="font-medium text-sm hover:text-primary transition-colors"
                          >
                            {comment.user.name}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* Load More Comments */}
                  {post.comments > (post.postComments?.length || 0) && !allCommentsLoaded.has(post.id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onLoadAllComments(post.id)}
                      disabled={loadingComments.has(post.id)}
                      className="w-full"
                    >
                      {loadingComments.has(post.id) ? "Loading..." : `Load ${post.comments - (post.postComments?.length || 0)} more comments`}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}