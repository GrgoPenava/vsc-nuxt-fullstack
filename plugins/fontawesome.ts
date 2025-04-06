import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faThumbsUp,
  faThumbsDown,
  faCircleXmark,
  faCircleLeft,
  faCircleRight,
  faFile,
} from "@fortawesome/free-regular-svg-icons";

import {
  faDownload,
  faCopy,
  faFileAlt,
  faExternalLinkAlt,
  faArrowLeft,
  faExclamationCircle,
  faFileCode,
  faUser,
  faComment,
} from "@fortawesome/free-solid-svg-icons";

// Dodaj ikonice u biblioteku
library.add(
  // Regular ikone
  faThumbsUp,
  faThumbsDown,
  faCircleXmark,
  faCircleLeft,
  faCircleRight,
  faFile,

  // Solid ikone
  faDownload,
  faCopy,
  faFileAlt,
  faExternalLinkAlt,
  faArrowLeft,
  faExclamationCircle,
  faFileCode,
  faUser,
  faComment
);

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("FontAwesomeIcon", FontAwesomeIcon);
});
