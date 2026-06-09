import subprocess
import os
import time
from services.workspace_service import workspace_service

class GitService:
    def _get_repo_path(self, workspace_id: str) -> str:
        ws = workspace_service.get_workspace(workspace_id)
        folders = ws.get("folders", [])
        if not folders:
            raise Exception("Workspace has no indexed folders to use as a Git repository root.")
        return folders[0] # Use the first folder as the repo root
        
    def _run_cmd(self, cmd: list, cwd: str) -> str:
        try:
            result = subprocess.run(cmd, cwd=cwd, check=True, capture_output=True, text=True)
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            print(f"[GIT ERROR] {' '.join(cmd)}\n{e.stderr}")
            raise Exception(f"Git command failed: {e.stderr}")

    def init_repo_if_needed(self, repo_path: str):
        if not os.path.exists(os.path.join(repo_path, ".git")):
            self._run_cmd(["git", "init"], cwd=repo_path)
            self._run_cmd(["git", "add", "."], cwd=repo_path)
            try:
                self._run_cmd(["git", "commit", "-m", "Initial commit"], cwd=repo_path)
            except:
                pass

    def get_status(self, workspace_id: str):
        try:
            repo_path = self._get_repo_path(workspace_id)
            self.init_repo_if_needed(repo_path)
            branch = self._run_cmd(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=repo_path)
            status_output = self._run_cmd(["git", "status", "--porcelain"], cwd=repo_path)
            
            pending_changes = []
            if status_output:
                for line in status_output.split("\n"):
                    if line.strip():
                        pending_changes.append(line.strip())
            
            return {
                "branch": branch,
                "pending_changes": pending_changes,
                "repo_path": repo_path
            }
        except Exception as e:
            return {"branch": "unknown", "pending_changes": [], "error": str(e)}

    def apply_edit_and_commit(self, workspace_id: str, file_path: str, original: str, replacement: str) -> str:
        repo_path = self._get_repo_path(workspace_id)
        
        # Resolve absolute path safely
        if os.path.isabs(file_path):
            abs_path = file_path
        else:
            abs_path = os.path.abspath(os.path.join(repo_path, file_path))
        
        if not abs_path.startswith(os.path.abspath(repo_path)):
            raise Exception(f"File {file_path} is outside the repository bounds.")
            
        print(f"[AI ACTION]\ntype=edit\nworkspace={workspace_id}\nfile={abs_path}\nstatus=approved\n")
            
        if not os.path.exists(abs_path):
            if original.strip() == "":
                os.makedirs(os.path.dirname(abs_path), exist_ok=True)
                with open(abs_path, 'w', encoding='utf-8') as f:
                    f.write(replacement)
            else:
                raise Exception(f"File {file_path} not found.")
        else:
            with open(abs_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            if original.strip():
                # Normalize line endings
                norm_content = content.replace('\r\n', '\n')
                norm_orig = original.replace('\r\n', '\n')
                
                if norm_orig in norm_content:
                    new_content = norm_content.replace(norm_orig, replacement.replace('\r\n', '\n'), 1)
                else:
                    raise Exception("Original text not found in file. AI may have hallucinated context.")
            else:
                new_content = replacement
                
            with open(abs_path, 'w', encoding='utf-8') as f:
                f.write(new_content)

        print(f"[AI ACTION]\ntype=git\nworkspace={workspace_id}\nfile={abs_path}\nstatus=pending\n")

        # Git operations
        timestamp = int(time.time())
        branch_name = f"feature/ai-edit-{timestamp}"
        
        try:
            self._run_cmd(["git", "checkout", "-b", branch_name], cwd=repo_path)
            self._run_cmd(["git", "add", abs_path], cwd=repo_path)
            
            filename = os.path.basename(abs_path)
            self._run_cmd(["git", "commit", "-m", f"feat(ai): Updated {filename}"], cwd=repo_path)
            
            print(f"[AI ACTION]\ntype=git\nworkspace={workspace_id}\nfile={abs_path}\nstatus=approved\n")
            return branch_name
        except Exception as e:
            print(f"[AI ACTION]\ntype=git\nworkspace={workspace_id}\nfile={abs_path}\nstatus=rejected\n")
            print(f"Failed to commit: {e}")
            raise e

git_service = GitService()
