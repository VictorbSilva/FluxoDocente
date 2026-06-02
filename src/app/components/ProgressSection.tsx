import { Card, CardHeader, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Calendar, 
  TrendingUp,
  BookOpen,
  Users,
  Medal,
  Flame
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: string;
}

interface ProgressSectionProps {
  userPoints: number;
  totalVideos: number;
  completedVideos: number;
  certificatesEarned: number;
  currentStreak: number;
}

export function ProgressSection({ 
  userPoints, 
  totalVideos, 
  completedVideos, 
  certificatesEarned, 
  currentStreak 
}: ProgressSectionProps) {
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Primeiro Passo',
      description: 'Assistiu ao primeiro vídeo',
      icon: '🎯',
      unlockedAt: '2 semanas atrás',
      category: 'Início'
    },
    {
      id: '2',
      title: 'Persistente',
      description: '7 dias consecutivos estudando',
      icon: '🔥',
      unlockedAt: '1 semana atrás',
      category: 'Disciplina'
    },
    {
      id: '3',
      title: 'Estudioso',
      description: '10 vídeos completos',
      icon: '📚',
      unlockedAt: '3 dias atrás',
      category: 'Conhecimento'
    },
    {
      id: '4',
      title: 'Inspirador',
      description: 'Compartilhou seu progresso',
      icon: '✨',
      unlockedAt: '2 dias atrás',
      category: 'Comunidade'
    },
    {
      id: '5',
      title: 'Empreendedor',
      description: 'Concluiu curso de negócios',
      icon: '🚀',
      unlockedAt: 'Ontem',
      category: 'Especialização'
    }
  ];

  const currentLevel = Math.floor(userPoints / 100) + 1;
  const pointsToNextLevel = ((currentLevel * 100) - userPoints);
  const levelProgress = ((userPoints % 100));

  const weeklyGoals = [
    { label: 'Assistir 5 vídeos', current: 3, target: 5, completed: false },
    { label: 'Completar 1 teste', current: 1, target: 1, completed: true },
    { label: 'Estudar 3 dias seguidos', current: currentStreak, target: 3, completed: currentStreak >= 3 },
    { label: 'Compartilhar progresso', current: 0, target: 1, completed: false }
  ];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-[#e0faf6] to-[#f0fafa]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl md:text-3xl text-gray-900">
              Seu progresso
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cada passo conta na sua jornada de transformação. Veja o quanto você já evoluiu!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Progress Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Level and Points */}
            <Card className="p-6 bg-gradient-to-r from-[#2b364a] to-[#21a3a3] text-white border-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl">Nível {currentLevel}</h3>
                  <p className="text-[#6cf3d5]">Transformador em crescimento</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl">{userPoints}</div>
                  <div className="text-sm text-white/70">pontos totais</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Próximo nível</span>
                  <span>{pointsToNextLevel} pontos restantes</span>
                </div>
                <Progress value={levelProgress} className="h-3 bg-white/20" />
              </div>
            </Card>

            {/* Statistics Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4 text-center border-[#13c8b5]/30">
                <div className="flex justify-center mb-2">
                  <BookOpen className="h-8 w-8 text-[#13c8b5]" />
                </div>
                <div className="text-2xl text-gray-900">{completedVideos}</div>
                <div className="text-sm text-gray-600">de {totalVideos} vídeos</div>
                <Progress value={(completedVideos / totalVideos) * 100} className="mt-2 h-2" />
              </Card>

              <Card className="p-4 text-center border-[#21a3a3]/30">
                <div className="flex justify-center mb-2">
                  <Award className="h-8 w-8 text-[#21a3a3]" />
                </div>
                <div className="text-2xl text-gray-900">{certificatesEarned}</div>
                <div className="text-sm text-gray-600">certificados</div>
                <div className="mt-2 text-xs text-[#21a3a3]">🏆 Meta: 5 certificados</div>
              </Card>

              <Card className="p-4 text-center border-orange-200">
                <div className="flex justify-center mb-2">
                  <Flame className="h-8 w-8 text-orange-500" />
                </div>
                <div className="text-2xl text-gray-900">{currentStreak}</div>
                <div className="text-sm text-gray-600">dias seguidos</div>
                <div className="mt-2 text-xs text-orange-600">🔥 Recorde: 12 dias</div>
              </Card>
            </div>

            {/* Weekly Goals */}
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-[#13c8b5]" />
                Metas desta semana
              </h3>
              <div className="space-y-4">
                {weeklyGoals.map((goal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{goal.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {goal.current}/{goal.target}
                        </span>
                        {goal.completed && (
                          <Badge className="bg-[#e0faf6] text-[#13c8b5] text-xs">
                            ✓ Completa
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={(goal.current / goal.target) * 100} 
                      className={`h-2 ${goal.completed ? 'bg-[#e0faf6]' : ''}`}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Achievements Sidebar */}
          <div className="space-y-6">
            {/* Recent Achievement */}
            <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <div className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <h3 className="text-lg text-yellow-800 mb-2">Nova conquista!</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  Você desbloqueou "Empreendedor"
                </p>
                <Badge className="bg-yellow-100 text-yellow-800">
                  +50 pontos
                </Badge>
              </div>
            </Card>

            {/* Achievements List */}
            <Card className="p-4">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Medal className="h-5 w-5 text-[#7375a5]" />
                Conquistas
              </h3>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">{achievement.title}</div>
                      <div className="text-xs text-gray-500">{achievement.description}</div>
                    </div>
                    <div className="text-xs text-gray-400">{achievement.unlockedAt}</div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 text-[#7375a5] border-[#7375a5] hover:bg-[#eef0f8]">
                Ver todas as conquistas
              </Button>
            </Card>

            {/* Community Stats */}
            <Card className="p-4 bg-gradient-to-br from-[#e0faf6] to-[#f0fafa] border-[#21a3a3]/30">
              <h3 className="text-lg text-[#2b364a] mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Na comunidade
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#21a3a3]">Seu ranking:</span>
                  <span className="text-[#2b364a]">#247 de 2.500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#21a3a3]">Top 15% dos usuários</span>
                  <span className="text-[#2b364a]">⭐</span>
                </div>
                <div className="pt-2 border-t border-[#21a3a3]/30">
                  <div className="text-xs text-[#21a3a3] mb-2">Próximo objetivo:</div>
                  <div className="text-[#2b364a]">Entrar no Top 10% (apenas 23 pontos!)</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}