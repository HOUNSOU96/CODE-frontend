import React, { useEffect, useState } from "react";
import { CheckCircle, CloudOff, RefreshCw } from "lucide-react";
import {
  isOnline,
  registerNetworkListeners,
} from "@/offline/networkStatus";

const OfflineIndicator: React.FC = () => {
  const [online, setOnline] = useState<boolean>(isOnline());
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const cleanup = registerNetworkListeners(
      () => {
        setOnline(true);
        setShowBackOnline(true);

        window.setTimeout(() => {
  setShowBackOnline(false);
}, 4000);
      },
      () => {
        setOnline(false);
        setShowBackOnline(false);
      }
    );

    return cleanup;
  }, []);

  if (online && !showBackOnline) {
    return null;
  }

  if (!online) {
    return (
      <div
        className="
          fixed
          bottom-4
          left-1/2
          z-[10000]
          w-[calc(100%-2rem)]
          max-w-md
          -translate-x-1/2
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-orange-200
            bg-white
            px-4
            py-3
            shadow-2xl
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-orange-100
              text-orange-600
            "
          >
            <CloudOff size={21} />
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-gray-900">
              CODE est hors connexion
            </p>

            <p className="text-sm leading-5 text-gray-600">
              Certaines fonctionnalités disponibles localement
              restent accessibles.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        fixed
        bottom-4
        left-1/2
        z-[10000]
        w-[calc(100%-2rem)]
        max-w-md
        -translate-x-1/2
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
          rounded-2xl
          border
          border-green-200
          bg-white
          px-4
          py-3
          shadow-2xl
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-green-100
            text-green-600
          "
        >
          <CheckCircle size={21} />
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-gray-900">
            Connexion rétablie
          </p>

          <p className="text-sm leading-5 text-gray-600">
            CODE peut maintenant synchroniser vos données.
          </p>
        </div>

        <RefreshCw
          size={18}
          className="ml-auto shrink-0 text-green-600"
        />
      </div>
    </div>
  );
};

export default OfflineIndicator;