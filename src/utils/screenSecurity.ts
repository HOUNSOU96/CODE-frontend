import { Capacitor, registerPlugin } from "@capacitor/core";

interface ScreenSecurityPlugin {
  setSecure(options: {
    enabled: boolean;
  }): Promise<{
    enabled: boolean;
  }>;
}

const ScreenSecurity =
  registerPlugin<ScreenSecurityPlugin>("ScreenSecurity");

export async function setDocumentScreenSecurity(
  enabled: boolean
): Promise<void> {
  if (
    !Capacitor.isNativePlatform() ||
    Capacitor.getPlatform() !== "android"
  ) {
    return;
  }

  try {
    await ScreenSecurity.setSecure({ enabled });
  } catch (error) {
    console.error(
      "Impossible de modifier la protection de l'écran :",
      error
    );
  }
}
