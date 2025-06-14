
export interface ProofData {
  type: string;
  text?: string;
  githubRepo?: string;
  githubCommits?: string;
  courseProgress?: string;
  coursePlatform?: string;
  imageFile?: File | null;
  videoFile?: File | null;
  goalType?: string;
}

export interface VerificationResult {
  verified: boolean;
  confidence: number;
  feedback: string;
  suggestions?: string[];
}

export class AIVerificationService {
  static async verifyProof(
    taskTitle: string, 
    taskDifficulty: string,
    proofData: ProofData
  ): Promise<VerificationResult> {
    try {
      // Simulate AI verification process
      console.log('Verifying proof for task:', taskTitle);
      console.log('Proof data:', proofData);

      // For now, implementing a rule-based verification system
      // In a real implementation, this would call an AI service
      
      const verification = await this.performVerification(taskTitle, taskDifficulty, proofData);
      
      return verification;
    } catch (error) {
      console.error('Error in AI verification:', error);
      return {
        verified: false,
        confidence: 0,
        feedback: "Verification failed due to technical error. Please try again.",
        suggestions: ["Try submitting again", "Contact support if issue persists"]
      };
    }
  }

  private static async performVerification(
    taskTitle: string, 
    taskDifficulty: string,
    proofData: ProofData
  ): Promise<VerificationResult> {
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    let score = 0;
    let feedback = "";
    let suggestions: string[] = [];

    switch (proofData.type) {
      case "github":
        score = this.verifyGithubProof(proofData);
        if (score >= 70) {
          feedback = `Great! Your GitHub repository shows solid progress. The commits and code changes align well with the task "${taskTitle}".`;
        } else if (score >= 50) {
          feedback = `Good progress on GitHub, but could use more substantial commits for the task "${taskTitle}".`;
          suggestions = ["Add more detailed commit messages", "Include more substantial code changes"];
        } else {
          feedback = `The GitHub repository doesn't show enough evidence of completing "${taskTitle}".`;
          suggestions = ["Add more commits related to the task", "Include README or documentation"];
        }
        break;

      case "course":
        score = this.verifyCourseProof(proofData);
        if (score >= 70) {
          feedback = `Excellent! Your course progress clearly demonstrates completion of "${taskTitle}".`;
        } else {
          feedback = `Course progress is noted, but more details needed to verify completion of "${taskTitle}".`;
          suggestions = ["Provide certificate or completion screenshot", "Add more specific learning details"];
        }
        break;

      case "image":
        score = this.verifyImageProof(proofData);
        if (score >= 70) {
          feedback = `Image evidence clearly shows completion of "${taskTitle}". Well documented!`;
        } else {
          feedback = `Image uploaded but description could be more detailed for "${taskTitle}".`;
          suggestions = ["Add more detailed description", "Include multiple angles if applicable"];
        }
        break;

      case "video":
        score = this.verifyVideoProof(proofData);
        if (score >= 70) {
          feedback = `Excellent video demonstration of "${taskTitle}" completion!`;
        } else {
          feedback = `Video uploaded but may need better explanation of how it relates to "${taskTitle}".`;
          suggestions = ["Add clearer narration", "Show step-by-step process"];
        }
        break;

      case "text":
        score = this.verifyTextProof(proofData);
        if (score >= 70) {
          feedback = `Detailed description clearly explains completion of "${taskTitle}".`;
        } else {
          feedback = `Description is too brief to verify completion of "${taskTitle}".`;
          suggestions = ["Provide more specific details", "Include steps taken and results achieved"];
        }
        break;

      default:
        score = 30;
        feedback = "Unknown proof type. Please select a valid verification method.";
    }

    // Adjust score based on task difficulty
    if (taskDifficulty === 'hard' && score < 80) {
      score = Math.max(score - 10, 0);
      suggestions.push("Hard tasks require more comprehensive evidence");
    }

    return {
      verified: score >= 70,
      confidence: score,
      feedback,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  private static verifyGithubProof(proof: ProofData): number {
    let score = 0;
    
    if (proof.githubRepo && proof.githubRepo.includes('github.com')) {
      score += 30;
    }
    
    if (proof.githubCommits && proof.githubCommits.length > 50) {
      score += 40;
    } else if (proof.githubCommits && proof.githubCommits.length > 20) {
      score += 20;
    }
    
    // Check for keywords that indicate real work
    const workKeywords = ['implemented', 'added', 'fixed', 'created', 'built', 'developed'];
    const hasWorkKeywords = workKeywords.some(keyword => 
      proof.githubCommits?.toLowerCase().includes(keyword)
    );
    
    if (hasWorkKeywords) {
      score += 30;
    }
    
    return Math.min(score, 100);
  }

  private static verifyCourseProof(proof: ProofData): number {
    let score = 0;
    
    if (proof.coursePlatform) {
      score += 20;
    }
    
    if (proof.courseProgress && proof.courseProgress.length > 30) {
      score += 50;
    }
    
    // Check for completion indicators
    const completionKeywords = ['completed', 'finished', 'certificate', 'passed', 'graduated'];
    const hasCompletion = completionKeywords.some(keyword => 
      proof.courseProgress?.toLowerCase().includes(keyword)
    );
    
    if (hasCompletion) {
      score += 30;
    }
    
    return Math.min(score, 100);
  }

  private static verifyImageProof(proof: ProofData): number {
    let score = 0;
    
    if (proof.imageFile) {
      score += 40;
    }
    
    if (proof.text && proof.text.length > 30) {
      score += 40;
    }
    
    if (proof.text && proof.text.length > 100) {
      score += 20;
    }
    
    return Math.min(score, 100);
  }

  private static verifyVideoProof(proof: ProofData): number {
    let score = 0;
    
    if (proof.videoFile) {
      score += 50;
    }
    
    if (proof.text && proof.text.length > 20) {
      score += 30;
    }
    
    if (proof.text && proof.text.length > 80) {
      score += 20;
    }
    
    return Math.min(score, 100);
  }

  private static verifyTextProof(proof: ProofData): number {
    let score = 0;
    
    if (proof.text && proof.text.length > 100) {
      score += 50;
    } else if (proof.text && proof.text.length > 50) {
      score += 30;
    }
    
    // Check for detailed explanation
    const detailKeywords = ['because', 'first', 'then', 'finally', 'result', 'achieved'];
    const hasDetails = detailKeywords.some(keyword => 
      proof.text?.toLowerCase().includes(keyword)
    );
    
    if (hasDetails) {
      score += 30;
    }
    
    if (proof.text && proof.text.length > 200) {
      score += 20;
    }
    
    return Math.min(score, 100);
  }
}
