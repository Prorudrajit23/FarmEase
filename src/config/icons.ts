// Import specific icons from @lucide-icons/react instead of lucide-react
import {
  CheckCircle,
  XCircle,
  // Git-related icons
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Github,
  Gitlab,
} from 'lucide-react';

// Export the icons we need
export const icons = {
  CheckCircle,
  XCircle,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Github,
  Gitlab,
} as const;

// Export individual icons for direct imports
export {
  CheckCircle,
  XCircle,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Github,
  Gitlab,
}; 