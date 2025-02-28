import { IconBrush, IconVolume } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import BoardSelect from "@/components/settings/board-select";
import PiecesSelect from "@/components/settings/pieces-select";
import SoundSelect from "@/components/settings/sound-select";
import VolumeSlider from "@/components/settings/volume-slider";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="p-4">
      <div>
        <div className="flex items-center gap-1.5 mb-4">
          <IconBrush size={22} />
          <h4 className="font-semibold text-xl text-primary">Appearance</h4>
        </div>
        <div className="flex justify-between items-center py-4 border-t border-b">
          <div>
            <h5 className="font-semibold text-primary">Piece Set</h5>
            <p className="text-sm text-primary">Pieces used on the boards</p>
          </div>
          <PiecesSelect />
        </div>
        <div className="flex justify-between items-center py-4 border-b">
          <div>
            <h5 className="font-semibold text-primary">Board Image</h5>
            <p className="text-sm text-primary">
              Image used as the background of the board
            </p>
          </div>
          <BoardSelect />
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center gap-1.5 mb-4">
          <IconVolume size={22} />
          <h4 className="font-semibold text-xl text-primary">Sound</h4>
        </div>
        <div className="flex justify-between items-center py-4 border-t border-b">
          <div>
            <h5 className="font-semibold text-primary">Sound Collection</h5>
            <p className="text-sm text-primary">Collection of sounds used</p>
          </div>
          <SoundSelect />
        </div>
        <div className="flex justify-between items-center py-4 border-b">
          <div>
            <h5 className="font-semibold text-primary">Volume</h5>
            <p className="text-sm text-primary">Overall volume</p>
          </div>
          <VolumeSlider />
        </div>
      </div>
    </div>
  );
}
