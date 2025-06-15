import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, Github, BookOpen, Camera, Video, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProofVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
  goalType?: string;
  onProofSubmitted: (proofData: any) => void;
}

export const ProofVerificationModal = ({ 
  open, 
  onOpenChange, 
  task, 
  goalType = "general",
  onProofSubmitted 
}: ProofVerificationModalProps) => {
  const [proofType, setProofType] = useState<string>("");
  const [proofText, setProofText] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubCommits, setGithubCommits] = useState("");
  const [courseProgress, setCourseProgress] = useState("");
  const [coursePlatform, setCoursePlatform] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const getProofOptions = () => {
    switch (goalType?.toLowerCase()) {
      case 'coding':
      case 'programming':
      case 'development':
        return [
          { value: "github", label: "GitHub Repository/Commits", icon: Github },
          { value: "image", label: "Screenshot", icon: Camera },
          { value: "video", label: "Demo Video", icon: Video }
        ];
      case 'learning':
      case 'course':
      case 'education':
        return [
          { value: "course", label: "Course Platform Progress", icon: BookOpen },
          { value: "image", label: "Certificate/Screenshot", icon: Camera },
          { value: "video", label: "Explanation Video", icon: Video }
        ];
      default:
        return [
          { value: "image", label: "Photo Evidence", icon: Camera },
          { value: "video", label: "Video Evidence", icon: Video },
          { value: "text", label: "Written Description", icon: Upload }
        ];
    }
  };

  const handleSubmit = async () => {
    if (!proofType) {
      toast({
        title: "Error",
        description: "Please select a proof type",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const proofData = {
        type: proofType,
        text: proofText,
        githubRepo,
        githubCommits,
        courseProgress,
        coursePlatform,
        imageFile,
        videoFile,
        goalType,
        submittedAt: new Date().toISOString()
      };

      await onProofSubmitted(proofData);
      
      // Reset form
      setProofType("");
      setProofText("");
      setGithubRepo("");
      setGithubCommits("");
      setCourseProgress("");
      setCoursePlatform("");
      setImageFile(null);
      setVideoFile(null);
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error submitting proof:', error);
      toast({
        title: "Error",
        description: "Failed to submit proof. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderProofForm = () => {
    const ProofIcon = getProofOptions().find(opt => opt.value === proofType)?.icon || Upload;
    
    switch (proofType) {
      case "github":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 mb-4">
              <Github className="h-5 w-5" />
              <span className="font-medium">GitHub Integration</span>
            </div>
            <div>
              <Label htmlFor="githubRepo">Repository URL</Label>
              <Input
                id="githubRepo"
                placeholder="https://github.com/username/repository"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="githubCommits">Recent Commits (describe your progress)</Label>
              <Textarea
                id="githubCommits"
                placeholder="Describe what you've implemented, commits made, features added..."
                value={githubCommits}
                onChange={(e) => setGithubCommits(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case "course":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">Course Platform Integration</span>
            </div>
            <div>
              <Label htmlFor="coursePlatform">Platform</Label>
              <Select value={coursePlatform} onValueChange={setCoursePlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coursera">Coursera</SelectItem>
                  <SelectItem value="udemy">Udemy</SelectItem>
                  <SelectItem value="edx">edX</SelectItem>
                  <SelectItem value="khan">Khan Academy</SelectItem>
                  <SelectItem value="pluralsight">Pluralsight</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="courseProgress">Progress Details</Label>
              <Textarea
                id="courseProgress"
                placeholder="Course name, modules completed, certificate earned, key learnings..."
                value={courseProgress}
                onChange={(e) => setCourseProgress(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case "image":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-600 mb-4">
              <Camera className="h-5 w-5" />
              <span className="font-medium">Photo Evidence</span>
            </div>
            <div>
              <Label htmlFor="imageUpload">Upload Image</Label>
              <Input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label htmlFor="imageDescription">Description</Label>
              <Textarea
                id="imageDescription"
                placeholder="Explain what the image shows and how it proves task completion..."
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case "video":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <Video className="h-5 w-5" />
              <span className="font-medium">Video Evidence</span>
            </div>
            <div>
              <Label htmlFor="videoUpload">Upload Video</Label>
              <Input
                id="videoUpload"
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label htmlFor="videoDescription">Description</Label>
              <Textarea
                id="videoDescription"
                placeholder="Explain what the video demonstrates and how it proves task completion..."
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case "text":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Upload className="h-5 w-5" />
              <span className="font-medium">Written Description</span>
            </div>
            <div>
              <Label htmlFor="textProof">Detailed Description</Label>
              <Textarea
                id="textProof"
                placeholder="Provide a detailed explanation of how you completed this task..."
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                rows={5}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Submit Proof for Admin Review
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Task: {task?.title}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-blue-800 text-sm">
              📋 Your proof will be reviewed by an admin. You'll be notified once it's approved and you can claim your reward.
            </p>
          </div>

          <div>
            <Label>Proof Type</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {getProofOptions().map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={proofType === option.value ? "default" : "outline"}
                    onClick={() => setProofType(option.value)}
                    className="justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {proofType && renderProofForm()}

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !proofType}
              className="flex-1"
            >
              {submitting ? "Submitting..." : "Submit for Admin Review"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
