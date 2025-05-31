import { useState } from "react";
import { toast } from "react-hot-toast";

import bg1 from "../imgs/bg/bg-1.jpg";
import bg2 from "../imgs/bg/bg-2.jpg";

const PRESET_BACKGROUNDS = [
  {
    url: bg1,
    label: "Abstract Pattern"
  },
  {
    url: bg2,
    label: "Geometric Pattern"
  }
];

const ProfileCustomizationModal = ({ initialData, onSave, onClose }) => {
  const [customization, setCustomization] = useState(
    initialData || {
      backgroundUrl: "",
    }
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-light-grey rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Customize Your Profile</h2>

        <div className="space-y-6">
          {/* Предустановленные фоны */}
          <div>
            <h3 className="text-xl mb-3">Select Background</h3>
            <div className="grid grid-cols-2 gap-4">
              {PRESET_BACKGROUNDS.map((bg, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 aspect-video ${
                    customization.backgroundUrl === bg.url
                      ? "border-purple"
                      : "border-grey hover:border-purple/50"
                  }`}
                  onClick={() =>
                    setCustomization((prev) => ({
                      ...prev,
                      backgroundUrl: bg.url,
                    }))
                  }
                >
                  <img
                    src={bg.url}
                    alt={bg.label}
                    className="w-full h-full object-cover"
                  />
                  {customization.backgroundUrl === bg.url && (
                    <div className="absolute inset-0 bg-purple/20 flex items-center justify-center">
                      <i className="fi fi-sr-check text-white text-2xl"></i>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        {customization.backgroundUrl && (
          <div className="mt-6">
            <h3 className="text-xl mb-3">Preview</h3>
            <div className="relative rounded-lg overflow-hidden aspect-video">
              <img
                src={customization.backgroundUrl}
                alt="Background Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => onSave(customization)}
            className="btn-dark flex-1"
          >
            Save Changes
          </button>
          <button onClick={onClose} className="btn-light flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCustomizationModal;