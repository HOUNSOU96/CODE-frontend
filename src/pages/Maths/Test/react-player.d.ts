declare module "react-player" {
  import * as React from "react";

  export interface ReactPlayerProps {
    url: string;
    playing?: boolean;
    controls?: boolean;
    width?: string | number;
    height?: string | number;
    onEnded?: () => void;
    config?: any; // Pour YouTube, Vimeo, fichiers locaux, etc.
  }

  // Déclare ReactPlayer comme composant **et** avec méthode statique canPlay
  interface ReactPlayerType extends React.ComponentType<ReactPlayerProps> {
    canPlay(url: string): boolean;
  }

  const ReactPlayer: ReactPlayerType;
  export default ReactPlayer;
}
