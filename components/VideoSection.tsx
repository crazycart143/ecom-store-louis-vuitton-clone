"use client";

import React, { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

export function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="relative w-full aspect-video md:aspect-21/9 bg-black overflow-hidden group">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="https://vod.freecaster.com/louisvuitton/a0c35b50-e3aa-4841-9c2b-d9f8c5d94267/xnCmodfSTGpkpUqGfXix1o7V_11.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Video Content Overlay */}
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-700" />

      {/* Controls */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="flex items-center gap-6">
          <button 
            onClick={togglePlay}
            className="text-white hover:scale-110 transition-transform p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
          >
            {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
          </button>
          
          <div className="hidden md:block">
             <p className="text-[10px] uppercase tracking-[0.3em] text-white/90 font-luxury">
               Pharrell Williams Men's Collection
             </p>
          </div>
        </div>

        <button 
          onClick={toggleMute}
          className="text-white hover:scale-110 transition-transform p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Top Banner Feel */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-black/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black/40 to-transparent pointer-events-none" />
    </section>
  );
}
