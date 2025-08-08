import { useEffect } from "react";

export default function FullScreenHandler() {
  useEffect(() => {
    const enterFullScreen = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen(); // Firefox
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(); // Chrome, Safari, Opera
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen(); // IE/Edge
      }
    };

    enterFullScreen();
  }, []);

  return null; 
}
