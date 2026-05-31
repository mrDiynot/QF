'use client';

import { useState } from 'react';
import { CallScenario, PRESET_SCENARIOS } from '@/types/call-scenarios';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Play, Clock, Target, BookOpen, Plus } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalTitle } from '@/components/modals';

interface CallScenariosLibraryProps {
  onSelectScenario?: (scenario: CallScenario) => void;
}

export function CallScenariosLibrary({ onSelectScenario }: CallScenariosLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CallScenario['category'] | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<CallScenario['difficulty'] | 'all'>('all');
  const [selectedScenario, setSelectedScenario] = useState<CallScenario | null>(null);

  const filteredScenarios = PRESET_SCENARIOS.filter(scenario => {
    if (!scenario.isActive) return false;
    const matchesSearch = searchQuery && !scenario.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !scenario.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter !== 'all' && scenario.category !== categoryFilter;
    const matchesDifficulty = difficultyFilter !== 'all' && scenario.difficulty !== difficultyFilter;
    return !matchesSearch && !matchesCategory && !matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: CallScenario['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
    }
  };

  const getCategoryIcon = (_category: CallScenario['category']) => {
    return <BookOpen className="size-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-navy">Call Scenarios Library</h2>
          <p className="text-sm text-text-secondary mt-1">
            Pre-built scenarios for AI voice training
          </p>
        </div>
        <Button className="gap-2 gradient-primary text-white">
          <Plus className="size-4" />
          Create Scenario
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-text-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scenarios..."
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={(value: typeof categoryFilter) => setCategoryFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="qualification">Qualification</SelectItem>
              <SelectItem value="appointment">Appointment</SelectItem>
              <SelectItem value="survey">Survey</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={(value: typeof difficultyFilter) => setDifficultyFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScenarios.map((scenario) => (
          <Card
            key={scenario.id}
            className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedScenario(scenario)}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(scenario.category)}
                  <Badge variant="outline" className="text-xs capitalize">
                    {scenario.category}
                  </Badge>
                </div>
                <Badge className={`text-xs capitalize ${getDifficultyColor(scenario.difficulty)}`}>
                  {scenario.difficulty}
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold text-text-navy mb-1">{scenario.name}</h3>
                <p className="text-sm text-text-secondary line-clamp-2">{scenario.description}</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {scenario.estimatedDuration} min
                </div>
                <div className="flex items-center gap-1">
                  <Target className="size-3" />
                  {scenario.objectives.length} objectives
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {scenario.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectScenario?.(scenario);
                }}
              >
                <Play className="size-4" />
                Use Scenario
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Scenario Detail Dialog */}
      {selectedScenario && (
        <Modal open={!!selectedScenario} onOpenChange={() => setSelectedScenario(null)}>
          <ModalContent size="xl" className="max-h-[80vh] overflow-y-auto">
            <ModalHeader>
              <ModalTitle>{selectedScenario.name}</ModalTitle>
            </ModalHeader>

            <ModalBody className="space-y-6">
              <div>
                <p className="text-sm text-text-secondary">{selectedScenario.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant="outline" className="capitalize">{selectedScenario.category}</Badge>
                <Badge className={getDifficultyColor(selectedScenario.difficulty)}>
                  {selectedScenario.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-text-secondary">
                  <Clock className="size-4" />
                  {selectedScenario.estimatedDuration} minutes
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-text-navy mb-2">Objectives</h4>
                <ul className="space-y-1">
                  {selectedScenario.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="text-brand-purple">•</span>
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-text-navy mb-3">Script</h4>
                <div className="space-y-3">
                  {selectedScenario.script.map((step) => (
                    <Card key={step.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={step.speaker === 'agent' ? 'default' : 'secondary'} className="text-xs">
                            {step.speaker === 'agent' ? 'Agent' : 'Customer'}
                          </Badge>
                          <span className="text-xs text-text-secondary">Step {step.order}</span>
                        </div>
                        <p className="text-sm text-text-navy">{step.text}</p>
                        {step.notes && (
                          <p className="text-xs text-text-secondary italic">Note: {step.notes}</p>
                        )}
                        {step.keyPoints && step.keyPoints.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {step.keyPoints.map((point, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {point}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 gradient-primary text-white gap-2"
                  onClick={() => {
                    onSelectScenario?.(selectedScenario);
                    setSelectedScenario(null);
                  }}
                >
                  <Play className="size-4" />
                  Use This Scenario
                </Button>
                <Button variant="outline" onClick={() => setSelectedScenario(null)}>
                  Close
                </Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
