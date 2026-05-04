"use client";
import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createTeam } from "../actions";

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTeamModal({ open, onClose }: CreateTeamModalProps) {
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Team name is required.");
      return;
    }
    if (trimmedName.length > 50) {
      setError("Team name must be 50 characters or less.");
      return;
    }
    startTransition(async () => {
      try {
        const result = await createTeam({
          name: trimmedName,
          avatarUrl: avatarUrl.trim() || undefined,
        });
        setName("");
        setAvatarUrl("");
        onClose();
        router.push(`/dashboard/teams/${result.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create team.");
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Create New Team</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Team Name <span className="text-red-400">*</span>
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g. Design Team"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Avatar URL <span className="text-zinc-600 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="https://example.com/avatar.png"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-xl disabled:opacity-50 transition-colors"
          >
            {isPending ? "Creating..." : "Create Team"}
          </button>
        </form>
      </div>
    </div>
  );
}
