import { Card, CardHeader, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Maximize, 
  BookOpen,
  Award,
  Clock,
  Users
} from "lucide-react";
import { useState } from "react";

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  instructor: string;
  category: string;
  tags: string[];
  thumbnail: string;
  progress?: number;
  completed?: boolean;
}

interface VideoPlayerProps {
  video: Video;
  onVideoComplete: () => void;
  onNextVideo: () => void;
  onPrevVideo: () => void;
}

export function VideoPlayer({ video, onVideoComplete, onNextVideo, onPrevVideo }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgress = (progress: number) => {
    setCurrentTime(progress);
    if (progress >= 95 && !video.completed) {
      onVideoComplete();
    }
  };

  const mockNotes = [
    "📝 Lembre-se: pequenos passos levam a grandes mudanças",
    "💡 Dica: pratique diariamente o que aprendeu hoje",
    "🎯 Meta: aplicar pelo menos uma lição desta semana",
    "🤝 Compartilhe seu progresso com alguém de confiança"
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Video Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Player */}
          <Card className="overflow-hidden shadow-lg">
            <div className="relative bg-black aspect-video">
              {/* Mock Video Player */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <Button
                  onClick={handlePlayPause}
                  size="lg"
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full p-6 backdrop-blur-sm"
                >
                  {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                </Button>
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <div className="space-y-2">
                  <Progress value={currentTime} className="h-1" />
                  <div className="flex items-center justify-between text-white text-sm">
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={onPrevVideo}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={handlePlayPause}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        onClick={onNextVideo}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>2:30 / {video.duration}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Video Info */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-xl text-gray-900">{video.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {video.instructor}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {video.duration}
                    </div>
                  </div>
                </div>
                {video.completed && (
                  <Badge className="bg-[#e0faf6] text-[#13c8b5]">
                    <Award className="h-3 w-3 mr-1" />
                    Concluído
                  </Badge>
                )}
              </div>

              <p className="text-gray-700 leading-relaxed">{video.description}</p>

              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setShowNotes(!showNotes)}
                  variant="outline"
                  className="flex-1"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {showNotes ? 'Ocultar' : 'Ver'} Anotações
                </Button>
                <Button
                  onClick={() => handleProgress(100)}
                  className="flex-1 bg-[#21a3a3] hover:bg-[#13c8b5]"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Marcar como Concluído
                </Button>
              </div>
            </div>
          </Card>

          {/* Notes Section */}
          {showNotes && (
            <Card className="p-6 bg-[#e0faf6] border-[#21a3a3]/20">
              <h3 className="text-lg text-blue-900 mb-4">📋 Pontos Importantes</h3>
              <ul className="space-y-3">
                {mockNotes.map((note, index) => (
                  <li key={index} className="text-blue-800 leading-relaxed">
                    {note}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className="p-4 bg-gradient-to-br from-[#e0faf6] to-[#f0fafa] border-[#13c8b5]/30">
            <h3 className="text-lg text-green-800 mb-3">🏆 Seu Progresso</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Curso atual</span>
                  <span>65%</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl text-green-600">12</div>
                  <div className="text-xs text-gray-600">Vídeos assistidos</div>
                </div>
                <div>
                  <div className="text-2xl text-blue-600">3</div>
                  <div className="text-xs text-gray-600">Certificados</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Next Videos */}
          <Card className="p-4">
            <h3 className="text-lg text-gray-900 mb-4">📺 Próximos vídeos</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <Play className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-900 line-clamp-2">
                      Como projetar seus próximos prompts no Gamma
                    </div>
                    <div className="text-xs text-gray-500 mt-1">8:30</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}