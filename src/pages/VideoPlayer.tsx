// 📁 VideoPlayer.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import axios from "axios";

interface Video {
  id: string;
  titre: string;
  niveau: string;
  fichier: string;
}

const VideoPlayer: React.FC = () => {
  const { matiere, videoId } = useParams<{ matiere: string; videoId?: string }>();
  const playerRef = useRef<ReactPlayer>(null);

  const [videos, setVideos] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startProgress, setStartProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!matiere) return;

    axios
      .get<Video[]>(`/api/videos/remediation?niveau=${matiere}`)
      .then((res) => {
        setVideos(res.data);
        let startIndex = 0;
        let startPos = 0;

        const saved = localStorage.getItem(`lastVideo_${matiere}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          const idx = res.data.findIndex((v) => v.id === parsed.videoId);
          if (idx >= 0) {
            startIndex = idx;
            startPos = parsed.position || 0;
          }
        }

        if (videoId) {
          const idx = res.data.findIndex((v) => v.id === videoId);
          if (idx >= 0) {
            startIndex = idx;
            startPos = 0;
          }
        }

        setCurrentIndex(startIndex);
        setStartProgress(startPos);
      })
      .catch((err) => console.error(err));
  }, [matiere, videoId]);

  if (!videos.length) return <div>Chargement des vidéos...</div>;

  const currentVideo = videos[currentIndex];
  const isExternalUrl = currentVideo?.fichier.startsWith("http");

  const handleProgress = (state: { playedSeconds: number }) => {
    localStorage.setItem(
      `lastVideo_${matiere}`,
      JSON.stringify({ videoId: currentVideo.id, position: state.playedSeconds })
    );
  };

  const handleEnded = () => {
    if (currentIndex + 1 < videos.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setStartProgress(0);
      localStorage.setItem(
        `lastVideo_${matiere}`,
        JSON.stringify({ videoId: videos[nextIndex].id, position: 0 })
      );
    } else {
      alert("Toutes les vidéos terminées !");
    }
  };

  const handleReady = () => {
    if (startProgress > 0) {
      playerRef.current?.seekTo(startProgress, "seconds");
    }
    setReady(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <h1 className="text-2xl font-bold mb-4">{currentVideo?.titre}</h1>
      <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-lg border border-gray-700">
        <ReactPlayer
          ref={playerRef}
          url={
            isExternalUrl
              ? currentVideo.fichier
              : `/RemediationVideos/${currentVideo.niveau}/${currentVideo.fichier}`
          }
          controls
          playing
          width="100%"
          height="100%"
          onProgress={handleProgress}
          onReady={handleReady}
          onEnded={handleEnded}
          progressInterval={5000}
          config={{
            youtube: {
              playerVars: {
                modestbranding: 1,
                rel: 0,
                disablekb: 1,
                controls: 1,
              },
            },
          }}
        />
      </div>
      {!ready && <p className="mt-4 text-gray-400">Préparation de la vidéo...</p>}
    </div>
  );
};

export default VideoPlayer;
