import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Twitter, 
  Linkedin, 
  Image, 
  Video, 
  Link, 
  Calendar,
  Send,
  Clock,
  Hash,
  TrendingUp,
  FileText,
  X
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HashtagSuggestion {
  hashtag: string;
  trending_score: number;
  usage_count: number;
}

export function SocialMediaComposer() {
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState({
    twitter: true,
    linkedin: true
  });
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [suggestions, setSuggestions] = useState<HashtagSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const TWITTER_LIMIT = 280;
  const LINKEDIN_LIMIT = 3000;

  useEffect(() => {
    fetchHashtagSuggestions();
  }, []);

  const fetchHashtagSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('hashtag_suggestions')
        .select('hashtag, trending_score, usage_count')
        .order('trending_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching hashtag suggestions:', error);
    }
  };

  const getCharacterCount = (platform: string) => {
    const totalLength = content.length + hashtags.join(' ').length + (hashtags.length > 0 ? hashtags.length : 0);
    return totalLength;
  };

  const getCharacterLimit = (platform: string) => {
    return platform === 'twitter' ? TWITTER_LIMIT : LINKEDIN_LIMIT;
  };

  const isOverLimit = (platform: string) => {
    return getCharacterCount(platform) > getCharacterLimit(platform);
  };

  const handleMediaUpload = (files: File[]) => {
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addHashtag = (hashtag: string) => {
    const cleanHashtag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;
    if (!hashtags.includes(cleanHashtag)) {
      setHashtags(prev => [...prev, cleanHashtag]);
    }
    setHashtagInput("");
  };

  const removeHashtag = (hashtag: string) => {
    setHashtags(prev => prev.filter(h => h !== hashtag));
  };

  const handleHashtagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (hashtagInput.trim()) {
        addHashtag(hashtagInput.trim());
      }
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your post",
        variant: "destructive",
      });
      return;
    }

    if (!platforms.twitter && !platforms.linkedin) {
      toast({
        title: "Error",
        description: "Please select at least one platform",
        variant: "destructive",
      });
      return;
    }

    // Check character limits for selected platforms
    if (platforms.twitter && isOverLimit('twitter')) {
      toast({
        title: "Error",
        description: "Twitter post exceeds character limit",
        variant: "destructive",
      });
      return;
    }

    if (platforms.linkedin && isOverLimit('linkedin')) {
      toast({
        title: "Error",
        description: "LinkedIn post exceeds character limit",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const postData = {
        content: content.trim(),
        hashtags,
        media_urls: [], // Will be populated after file upload
        scheduled_for: isScheduled ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString() : null,
        platforms: Object.entries(platforms).filter(([_, enabled]) => enabled).map(([platform, _]) => platform)
      };

      // TODO: Implement actual post creation logic
      console.log('Creating post:', postData);

      toast({
        title: "Success",
        description: isScheduled ? "Post scheduled successfully" : "Post published successfully",
      });

      // Reset form
      setContent("");
      setHashtags([]);
      setMediaFiles([]);
      setLinkUrl("");
      setIsScheduled(false);
      setScheduledDate("");
      setScheduledTime("");

    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Platforms</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="twitter"
                  checked={platforms.twitter}
                  onCheckedChange={(checked) => setPlatforms(prev => ({ ...prev, twitter: checked }))}
                />
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="linkedin"
                  checked={platforms.linkedin}
                  onCheckedChange={(checked) => setPlatforms(prev => ({ ...prev, linkedin: checked }))}
                />
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Label>
              </div>
            </div>
          </div>

          {/* Content Input */}
          <div className="space-y-3">
            <Label htmlFor="content">Post Content</Label>
            <Textarea
              id="content"
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            
            {/* Character Count */}
            <div className="flex justify-between text-sm">
              {platforms.twitter && (
                <div className={`flex items-center gap-1 ${isOverLimit('twitter') ? 'text-destructive' : 'text-muted-foreground'}`}>
                  <Twitter className="h-3 w-3" />
                  {getCharacterCount('twitter')}/{TWITTER_LIMIT}
                </div>
              )}
              {platforms.linkedin && (
                <div className={`flex items-center gap-1 ${isOverLimit('linkedin') ? 'text-destructive' : 'text-muted-foreground'}`}>
                  <Linkedin className="h-3 w-3" />
                  {getCharacterCount('linkedin')}/{LINKEDIN_LIMIT}
                </div>
              )}
            </div>
          </div>

          {/* Hashtags */}
          <div className="space-y-3">
            <Label htmlFor="hashtags">Hashtags</Label>
            <div className="space-y-2">
              <Input
                id="hashtags"
                placeholder="Enter hashtags..."
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={handleHashtagKeyPress}
              />
              
              {/* Selected Hashtags */}
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((hashtag) => (
                    <Badge key={hashtag} variant="secondary" className="gap-1">
                      #{hashtag}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-auto p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => removeHashtag(hashtag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Hashtag Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Trending Suggestions</Label>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.slice(0, 6).map((suggestion) => (
                      <Button
                        key={suggestion.hashtag}
                        size="sm"
                        variant="outline"
                        className="h-auto py-1 px-2 text-xs"
                        onClick={() => addHashtag(suggestion.hashtag)}
                      >
                        <Hash className="h-3 w-3 mr-1" />
                        {suggestion.hashtag}
                        <TrendingUp className="h-3 w-3 ml-1 text-muted-foreground" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-3">
            <Label>Media Attachments</Label>
            <FileUpload
              onFileUploaded={(file) => setMediaFiles(prev => [...prev, file])}
              allowedTypes={["image/*", "video/*"]}
              multiple
              maxFileSize={10 * 1024 * 1024} // 10MB
            />
            
            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative border rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      {file.type.startsWith('image/') ? (
                        <Image className="h-4 w-4" />
                      ) : (
                        <Video className="h-4 w-4" />
                      )}
                      <span className="text-xs truncate">{file.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-0 right-0 h-auto p-1"
                      onClick={() => removeMediaFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Link Attachment */}
          <div className="space-y-3">
            <Label htmlFor="link">Link Attachment (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="link"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <Button variant="outline" size="icon">
                <Link className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Scheduling */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="schedule"
                checked={isScheduled}
                onCheckedChange={setIsScheduled}
              />
              <Label htmlFor="schedule" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule for later
              </Label>
            </div>

            {isScheduled && (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !content.trim()}
              className="flex-1"
            >
              {loading ? (
                "Processing..."
              ) : isScheduled ? (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Post
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publish Now
                </>
              )}
            </Button>
            <Button variant="outline">
              Save Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}