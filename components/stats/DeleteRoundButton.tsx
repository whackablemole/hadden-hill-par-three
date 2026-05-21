"use client";

import { useState } from "react";

interface DeleteRoundButtonProps {
  roundId: string;
  onDeleted?: () => void;
}

export function DeleteRoundButton({ roundId, onDeleted }: DeleteRoundButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function removeRound() {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/rounds/${roundId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete round");
      }
      onDeleted?.();
    } catch (error) {
      console.error(error);
      alert("Unable to delete round.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      className="rounded border border-red-300 px-3 py-1 text-sm text-red-700"
      type="button"
      onClick={removeRound}
      disabled={isDeleting}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
