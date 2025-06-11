import { useState, useContext } from "react";
import { toast } from "react-hot-toast";

import { ThemeContext } from "../App";

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

const ProfileCustomizationModal = ({ initialData, onSave, onClose, userAvatar }) => {
  const [customization, setCustomization] = useState({
    backgroundUrl: {
      light: initialData?.backgroundUrl?.light || "",
      dark: initialData?.backgroundUrl?.dark || "",
    },
    avatarStyle: initialData?.avatarStyle || "gradient",
    visibility: {
      statistics: initialData?.visibility?.statistics ?? true,
      achievements: initialData?.visibility?.achievements ?? true,
      socialLinks: initialData?.visibility?.socialLinks ?? true,
    },
  });

  const { theme } = useContext(ThemeContext);

  return (
    <div className="fixed inset-0 light:bg-black/90 dark:bg-white/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-light-grey p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-purple">
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

          <div>
            <h3 className="text-xl mb-4">Profile Background</h3>
            <div className="space-y-6">
              {/* Light Theme Background */}
              <div>
                <p className="text-dark-grey mb-2">Light Theme Background</p>
                <div className="grid grid-cols-2 gap-4">
                  {PRESET_BACKGROUNDS.map((bg, index) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 aspect-video ${
                        customization.backgroundUrl.light === bg.url
                          ? "border-purple"
                          : "border-grey hover:border-purple/50"
                      }`}
                      onClick={() =>
                        setCustomization((prev) => ({
                          ...prev,
                          backgroundUrl: {
                            ...prev.backgroundUrl,
                            light: bg.url,
                          },
                        }))
                      }
                    >
                      <img
                        src={bg.url}
                        alt={bg.label}
                        className="w-full h-full object-cover"
                      />
                      {customization.backgroundUrl.light === bg.url && (
                        <div className="absolute inset-0 bg-purple/20 flex items-center justify-center">
                          <i className="flex fi fi-sr-check text-white dark:text-black text-2xl"></i>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dark Theme Background */}
              <div>
                <p className="text-dark-grey mb-2">Dark Theme Background</p>
                <div className="grid grid-cols-2 gap-4">
                  {PRESET_BACKGROUNDS.map((bg, index) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 aspect-video ${
                        customization.backgroundUrl.dark === bg.url
                          ? "border-purple"
                          : "border-grey hover:border-purple/50"
                      }`}
                      onClick={() =>
                        setCustomization((prev) => ({
                          ...prev,
                          backgroundUrl: {
                            ...prev.backgroundUrl,
                            dark: bg.url,
                          },
                        }))
                      }
                    >
                      <img
                        src={bg.url}
                        alt={bg.label}
                        className="w-full h-full object-cover"
                      />
                      {customization.backgroundUrl.dark === bg.url && (
                        <div className="absolute inset-0 bg-purple/20 flex items-center justify-center">
                          <i className="flex fi fi-sr-check text-white dark:text-black text-2xl"></i>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div>
            <h3 className="text-xl mb-4">Preview</h3>
            <div
              className={`bg-${
                theme === "light" ? "white" : "dark"
              } rounded-lg p-2`}
            >
              <div className="flex items-center gap-4">
                {/* Avatar Preview */}
                <div
                  className={`w-[70px] h-[70px] avatar-${customization.avatarStyle}`}
                >
                  <div className="rounded-full overflow-hidden border-4 border-grey">
                    <img
                      src={userAvatar}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Background Preview */}
                <div className="relative rounded-lg overflow-hidden h-20 w-[75%]">
                  {customization.backgroundUrl[theme] ? (
                    <img
                      src={customization.backgroundUrl[theme]}
                      alt="Background Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-grey/20 text-dark-grey">
                      No background selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Visibility Settings */}
          <div>
            <h3 className="text-xl mb-4">Profile Sections Visibility</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border rounded-lg hover:border-purple transition-custom cursor-pointer">
                <div>
                  <p className="font-medium">Statistics</p>
                  <p className="text-dark-grey text-sm">
                    Show your blog stats and achievements
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={customization.visibility.statistics}
                  onChange={(e) =>
                    setCustomization((prev) => ({
                      ...prev,
                      visibility: {
                        ...prev.visibility,
                        statistics: e.target.checked,
                      },
                    }))
                  }
                  className="w-5 h-5 accent-purple"
                />
              </label>

              <label className="flex items-center justify-between p-4 border rounded-lg hover:border-purple transition-custom cursor-pointer">
                <div>
                  <p className="font-medium">Achievements</p>
                  <p className="text-dark-grey text-sm">
                    Display your earned badges and rewards
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={customization.visibility.achievements}
                  onChange={(e) =>
                    setCustomization((prev) => ({
                      ...prev,
                      visibility: {
                        ...prev.visibility,
                        achievements: e.target.checked,
                      },
                    }))
                  }
                  className="w-5 h-5 accent-purple"
                />
              </label>

              <label className="flex items-center justify-between p-4 border rounded-lg hover:border-purple transition-custom cursor-pointer">
                <div>
                  <p className="font-medium">Social Links</p>
                  <p className="text-dark-grey text-sm">
                    Show your connected social media profiles
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={customization.visibility.socialLinks}
                  onChange={(e) =>
                    setCustomization((prev) => ({
                      ...prev,
                      visibility: {
                        ...prev.visibility,
                        socialLinks: e.target.checked,
                      },
                    }))
                  }
                  className="w-5 h-5 accent-purple"
                />
              </label>
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
