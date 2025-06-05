import { useState } from "react";
import { toast } from "react-hot-toast";

import bg1 from "../imgs/bg/bg-1.jpg";
import bg2 from "../imgs/bg/bg-2.jpg";

const PRESET_BACKGROUNDS = [
  {
    url: bg1,
    label: "Abstract Pattern",
  },
  {
    url: bg2,
    label: "Geometric Pattern",
  },
];

const AVATAR_STYLES = [
  { id: "gradient", label: "Gradient Border", icon: "fi fi-rr-palette" },
  { id: "shine", label: "Shining Effect", icon: "fi fi-rr-sparkles" },
  { id: "pulse", label: "Pulse Effect", icon: "fi fi-rr-rings-wedding" },
  { id: "float", label: "Floating Effect", icon: "fi fi-rr-cloud" },
];

const ProfileCustomizationModal = ({ initialData, onSave, onClose }) => {
  const [customization, setCustomization] = useState(
    initialData || {
      backgroundUrl: "",
      avatarStyle: "gradient",
    }
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-light-grey rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Customize Your Profile</h2>

        <div className="space-y-8">
          {/* Avatar Style Selection */}
          <div>
            <h3 className="text-xl mb-4">Avatar Style</h3>
            <div className="grid grid-cols-2 gap-4">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() =>
                    setCustomization((prev) => ({
                      ...prev,
                      avatarStyle: style.id,
                    }))
                  }
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    customization.avatarStyle === style.id
                      ? "border-purple bg-purple/10"
                      : "border-grey hover:border-purple/50"
                  }`}
                >
                  <i className={`${style.icon} text-xl`}></i>
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Background Selection */}
          <div>
            <h3 className="text-xl mb-4">Profile Background</h3>
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

          {/* Preview Section */}
          <div>
            <h3 className="text-xl mb-4">Preview</h3>
            <div className="bg-light-grey rounded-lg p-6">
              <div className="flex items-center gap-4">
                {/* Avatar Preview */}
                <div className={`w-[70px] h-[70px] avatar-${customization.avatarStyle}`}>
                  <div className="rounded-full overflow-hidden border-4 border-grey">
                    <img
                      src="https://api.dicebear.com/6.x/avataaars/svg?seed=19"
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* Background Preview (if selected) */}
                {customization.backgroundUrl && (
                  <div className="flex-1">
                    <div className="relative rounded-lg overflow-hidden h-20">
                      <img
                        src={customization.backgroundUrl}
                        alt="Background Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
