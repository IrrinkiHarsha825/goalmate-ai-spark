
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Brain, Edit } from "lucide-react";

interface TaskCreationControlsProps {
  tasksExist: boolean;
  onGenerateAI: () => void;
  onAddManual: (title: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  onClearAll: () => void;
  aiLoading: boolean;
  loading: boolean;
}

export const TaskCreationControls = ({ 
  tasksExist, 
  onGenerateAI, 
  onAddManual, 
  onClearAll,
  aiLoading,
  loading 
}: TaskCreationControlsProps) => {
  const [showManualInput, setShowManualInput] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleAddManual = () => {
    if (!newTaskTitle.trim()) return;
    onAddManual(newTaskTitle.trim(), newTaskDifficulty);
    setNewTaskTitle("");
    setNewTaskDifficulty('medium');
    setShowManualInput(false);
  };

  const handleCancel = () => {
    setShowManualInput(false);
    setNewTaskTitle("");
    setNewTaskDifficulty('medium');
  };

  if (!tasksExist) {
    return (
      <div className="space-y-4">
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">How would you like to create tasks?</h3>
          <p className="text-gray-600 mb-4">Choose between AI-generated tasks or create them manually</p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={onGenerateAI}
              disabled={aiLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Brain className="h-4 w-4 mr-2" />
              {aiLoading ? "Generating..." : "Generate AI Tasks"}
            </Button>
            
            <Button 
              onClick={() => setShowManualInput(true)}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Create Manually
            </Button>
          </div>
        </div>

        {showManualInput && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
            <Input
              placeholder="Enter task description..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddManual()}
            />
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Difficulty:</label>
              <Select value={newTaskDifficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setNewTaskDifficulty(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy ($10)</SelectItem>
                  <SelectItem value="medium">Medium ($25)</SelectItem>
                  <SelectItem value="hard">Hard ($50)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddManual} disabled={loading || !newTaskTitle.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={() => setShowManualInput(true)}
          variant="outline"
          className="border-purple-200 text-purple-600 hover:bg-purple-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Manual Task
        </Button>
        
        <Button 
          onClick={onGenerateAI}
          disabled={aiLoading}
          variant="outline"
          className="border-blue-200 text-blue-600 hover:bg-blue-50"
        >
          <Brain className="h-4 w-4 mr-2" />
          {aiLoading ? "Generating..." : "Add AI Tasks"}
        </Button>
        
        <Button 
          onClick={onClearAll}
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          Clear All
        </Button>
      </div>

      {showManualInput && (
        <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
          <Input
            placeholder="Enter task description..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddManual()}
          />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Difficulty:</label>
            <Select value={newTaskDifficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setNewTaskDifficulty(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy ($10)</SelectItem>
                <SelectItem value="medium">Medium ($25)</SelectItem>
                <SelectItem value="hard">Hard ($50)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddManual} disabled={loading || !newTaskTitle.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
