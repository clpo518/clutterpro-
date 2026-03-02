import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, ZoomIn, ZoomOut, AlertTriangle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import WaveSurfer from "wavesurfer.js";

interface ClinicalWaveformProps {
  audioUrl: string;
  wpmData?: { timestamp: number; wpm: number }[];
}

const ClinicalWaveform = ({ audioUrl }: ClinicalWaveformProps) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [zoom, setZoom] = useState(50);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current) return;
    
    // Clean up any existing instance first
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }

    setIsReady(false);
    setLoadError(false);
    let isMounted = true;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#A7F3D0", // emerald-200 - soft green
      progressColor: "#10B981", // emerald-500 - brand green
      cursorColor: "#065F46", // emerald-800 - dark green cursor
      cursorWidth: 2,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      height: 140,
      normalize: true,
      backend: "WebAudio",
    });

    wavesurfer.on("ready", () => {
      if (!isMounted) return;
      setIsReady(true);
      setDuration(wavesurfer.getDuration());
      wavesurfer.setVolume(volume / 100);
    });

    wavesurfer.on("audioprocess", () => {
      if (!isMounted) return;
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on("seeking", () => {
      if (!isMounted) return;
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on("play", () => isMounted && setIsPlaying(true));
    wavesurfer.on("pause", () => isMounted && setIsPlaying(false));
    wavesurfer.on("finish", () => isMounted && setIsPlaying(false));
    wavesurfer.on("error", (err) => {
      console.error("WaveSurfer error:", err);
      if (isMounted) setLoadError(true);
    });

    // Timeout: if not ready after 15s, show error
    const timeout = setTimeout(() => {
      if (isMounted && !wavesurferRef.current?.getDuration()) {
        console.warn("WaveSurfer: 15s timeout reached, audio not loaded");
        setLoadError(true);
      }
    }, 15000);

    wavesurfer.load(audioUrl);
    wavesurferRef.current = wavesurfer;

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy();
        } catch (e) {
          // Ignore destroy errors during unmount
        }
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl]);

  // Update volume when ready
  useEffect(() => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.setVolume(volume / 100);
    }
  }, [volume, isReady]);

  // Update zoom only when ready and audio is loaded
  useEffect(() => {
    if (wavesurferRef.current && isReady && duration > 0) {
      try {
        wavesurferRef.current.zoom(zoom);
      } catch (e) {
        // Ignore zoom errors if audio not fully loaded
      }
    }
  }, [zoom, isReady, duration]);

  const togglePlay = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  }, []);

  const restart = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.seekTo(0);
      setCurrentTime(0);
    }
  }, []);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    if (wavesurferRef.current && duration > 0) {
      const seekPosition = value[0] / 100;
      wavesurferRef.current.seekTo(seekPosition);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  return (
    <Card className="overflow-hidden border border-slate-100 bg-white rounded-2xl shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              Analyse Audio
            </CardTitle>
            <CardDescription className="text-slate-500">
              Visualisez les pauses et l'intensité vocale
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 25}
              className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-slate-400 font-mono w-12 text-center">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Waveform Container */}
        <div className="relative bg-slate-50 p-4 rounded-lg mx-4 mt-4">
        {loadError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 rounded-lg gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <p className="text-sm text-slate-600 font-medium text-center">
                L'audio n'a pas pu être chargé.
                <br />
                <span className="text-slate-400 font-normal">Vérifiez votre connexion et réessayez.</span>
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLoadError(false);
                  setIsReady(false);
                  if (wavesurferRef.current) {
                    wavesurferRef.current.load(audioUrl);
                  }
                }}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Réessayer
              </Button>
            </div>
          ) : !isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10 rounded-lg">
              <div className="flex items-center gap-3 text-slate-500">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Chargement de l'audio...</span>
              </div>
            </div>
          )}
          <div 
            ref={waveformRef} 
            className="w-full overflow-x-auto"
            style={{ minHeight: '140px' }}
          />
          
          {/* Time markers overlay */}
          <div className="flex justify-between text-xs text-slate-400 font-mono mt-2">
            <span>0:00</span>
            <span>{formatTime(duration / 4)}</span>
            <span>{formatTime(duration / 2)}</span>
            <span>{formatTime((duration * 3) / 4)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4">
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono w-12">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="flex-1"
              disabled={!isReady}
            />
            <span className="text-xs text-slate-500 font-mono w-12 text-right">
              {formatTime(duration)}
            </span>
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlay}
                disabled={!isReady}
                className="border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 disabled:opacity-50"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={restart}
                disabled={!isReady}
                className="border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 w-32">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <Slider
                value={[volume]}
                onValueChange={(val) => setVolume(val[0])}
                max={100}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-4 pb-4 flex items-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm bg-emerald-500" />
            <span>Déjà lu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm bg-emerald-200" />
            <span>À lire</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="italic">Pics = intensité vocale</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClinicalWaveform;
