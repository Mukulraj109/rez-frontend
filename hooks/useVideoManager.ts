// Video manager hook for handling iOS auto-play limitations
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

interface VideoInstance {
  id: string;
  ref: any;
  isPlaying: boolean;
  isLoaded: boolean;
}

class VideoManager {
  private activeVideos: Map<string, VideoInstance> = new Map();
  private maxSimultaneousVideos = Platform.OS === 'ios' ? 2 : 4; // iOS limitation
  private currentlyPlaying: string[] = [];

  registerVideo(id: string, ref: any): void {
    this.activeVideos.set(id, {
      id,
      ref,
      isPlaying: false,
      isLoaded: false,
    });
  }

  unregisterVideo(id: string): void {
    this.stopVideo(id);
    this.activeVideos.delete(id);
  }

  async startVideo(id: string): Promise<boolean> {
    const video = this.activeVideos.get(id);
    if (!video || !video.ref) return false;

    // Stop other videos if we're at the limit
    if (this.currentlyPlaying.length >= this.maxSimultaneousVideos) {
      const oldestPlaying = this.currentlyPlaying[0];
      await this.stopVideo(oldestPlaying);
    }

    try {
      await video.ref.setStatusAsync({
        shouldPlay: true,
        isLooping: true,
        isMuted: true,
        volume: 0,
      });

      video.isPlaying = true;
      this.currentlyPlaying.push(id);
      console.log(`Video started: ${id}, Currently playing: ${this.currentlyPlaying.length}`);
      return true;
    } catch (error) {
      console.warn(`Failed to start video ${id}:`, error);
      return false;
    }
  }

  async stopVideo(id: string): Promise<void> {
    const video = this.activeVideos.get(id);
    if (!video || !video.ref) return;

    try {
      await video.ref.setStatusAsync({ shouldPlay: false });
      video.isPlaying = false;
      this.currentlyPlaying = this.currentlyPlaying.filter(playingId => playingId !== id);
      console.log(`Video stopped: ${id}, Currently playing: ${this.currentlyPlaying.length}`);
    } catch (error) {
      console.warn(`Failed to stop video ${id}:`, error);
    }
  }

  setVideoLoaded(id: string, loaded: boolean): void {
    const video = this.activeVideos.get(id);
    if (video) {
      video.isLoaded = loaded;
    }
  }

  getActiveVideoCount(): number {
    return this.currentlyPlaying.length;
  }

  getStatus() {
    return {
      totalVideos: this.activeVideos.size,
      currentlyPlaying: this.currentlyPlaying.length,
      maxSimultaneous: this.maxSimultaneousVideos,
      playingIds: [...this.currentlyPlaying],
    };
  }
}

// Global video manager instance
const videoManager = new VideoManager();

export function useVideoManager(videoId: string) {
  const videoRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Register video on mount
    videoManager.registerVideo(videoId, videoRef.current);

    return () => {
      // Unregister on unmount
      videoManager.unregisterVideo(videoId);
    };
  }, [videoId]);

  useEffect(() => {
    // Update ref when it changes
    if (videoRef.current) {
      videoManager.registerVideo(videoId, videoRef.current);
    }
  }, [videoRef.current, videoId]);

  const startPlayback = async (): Promise<boolean> => {
    const success = await videoManager.startVideo(videoId);
    setIsPlaying(success);
    return success;
  };

  const stopPlayback = async (): Promise<void> => {
    await videoManager.stopVideo(videoId);
    setIsPlaying(false);
  };

  const setLoaded = (loaded: boolean): void => {
    setIsLoaded(loaded);
    videoManager.setVideoLoaded(videoId, loaded);
  };

  const getManagerStatus = () => videoManager.getStatus();

  return {
    videoRef,
    isPlaying,
    isLoaded,
    startPlayback,
    stopPlayback,
    setLoaded,
    getManagerStatus,
  };
}

export default videoManager;