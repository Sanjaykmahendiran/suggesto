"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface EditRoomNameDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRoomName: string
    onUpdateRoomName: (newName: string) => Promise<void>
    isUpdating: boolean
}

export default function EditRoomNameDialog({
    open,
    onOpenChange,
    currentRoomName,
    onUpdateRoomName,
    isUpdating
}: EditRoomNameDialogProps) {
    const [editedRoomName, setEditedRoomName] = useState("")

    // Reset the edited name when dialog opens
    useEffect(() => {
        if (open) {
            setEditedRoomName(currentRoomName)
        }
    }, [open, currentRoomName])

    const handleSave = async () => {
        const trimmedName = editedRoomName.trim()
        if (trimmedName && trimmedName !== currentRoomName) {
            await onUpdateRoomName(trimmedName)
        }
    }

    const handleCancel = () => {
        onOpenChange(false)
        setEditedRoomName("")
    }

    const isNameChanged = editedRoomName.trim() !== currentRoomName
    const isNameValid = editedRoomName.trim().length > 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#1f1f21] border-[#2b2b2b] text-white max-w-md mx-auto">
                <DialogHeader>
                    <DialogTitle>Edit Room Name</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Room Name</label>
                        <input
                            value={editedRoomName}
                            onChange={(e) => setEditedRoomName(e.target.value)}
                            placeholder="Enter room name"
                                className="w-full py-2 px-3 pl-10 pr-3 rounded bg-[#2b2b2b] border border-[#3E3E4E] text-white truncate focus:ring-2 focus:ring-[#15F5FD]/50 focus:border-[#15F5FD]/20 outline-none"
                            maxLength={50}
                            autoFocus
                            disabled={isUpdating}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && isNameValid && isNameChanged && !isUpdating) {
                                    handleSave();
                                }
                            }}
                        />

                        <p className="text-xs text-gray-400 mt-1">
                            {editedRoomName.length}/50 characters
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="border-[#3E3E4E] text-gray-400 hover:bg-[#2b2b2b]"
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleSave}
                            className="flex-1 bg-gradient-to-r from-[#15F5FD] to-[#036CDA]"
                            disabled={isUpdating || !isNameValid || !isNameChanged}
                        >
                            {isUpdating ? "Updating..." : "Update Name"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}