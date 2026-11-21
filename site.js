const units = {
  "76": { exclusive: "76.6326", contract: "150.4997", supply: "208" },
  "84A": { exclusive: "84.9878", contract: "166.5946", supply: "208" },
  "84B": { exclusive: "84.9843", contract: "166.9145", supply: "104" },
  "211": { exclusive: "211.6980", contract: "414.4300", supply: "3" }
};

const typeButtons = Array.from(document.querySelectorAll("[data-type]"));
const fields = Object.fromEntries(
  ["exclusive", "contract", "supply"].map(field => [field, document.getElementById(field)])
);

const unitVideos = Array.from(document.querySelectorAll(".unit-video"), panel => ({
  panel,
  player: panel.querySelector("video")
}));

const unitPlan = document.getElementById("unit-plan-211");
const planDialog = document.getElementById("plan-dialog-211");
unitPlan.querySelector(".plan-preview").addEventListener("click", () => planDialog.showModal());

for (const button of typeButtons) {
  button.addEventListener("click", () => {
    const type = button.dataset.type;
    gallery.hidden = type !== "76";
    unitPlan.hidden = type !== "211";
    for (const { panel, player } of unitVideos) {
      panel.hidden = panel.id !== `unit-video-${type.toLowerCase()}`;
      if (panel.hidden) player.pause();
    }
    for (const candidate of typeButtons) {
      candidate.setAttribute("aria-pressed", String(candidate === button));
    }
    for (const [field, element] of Object.entries(fields)) {
      element.textContent = units[type][field];
    }
    if (type === "76") gallery.scrollIntoView({ block: "start" });
    const selectedVideo = unitVideos.find(({ panel }) => !panel.hidden);
    if (selectedVideo) selectedVideo.panel.scrollIntoView({ block: "start" });
    if (!unitPlan.hidden) {
      unitPlan.scrollIntoView({ block: "start" });
      planDialog.showModal();
    }
  });
}

const gallery = document.getElementById("unit-gallery");
const galleryPhoto = document.getElementById("gallery-photo");
const galleryStatus = document.getElementById("gallery-status");
const previousPhoto = document.getElementById("gallery-prev");
const nextPhoto = document.getElementById("gallery-next");
const thumbnails = gallery.querySelector(".gallery-thumbs");
const photoDirectory = "photos/76/";
const photos = [
  ["living-room", "거실", "큰 창과 소파가 있는 거실"],
  ["dining-kitchen", "주방과 식사 공간", "식탁에서 바라본 주방과 창"],
  ["kitchen", "주방 전경", "싱크대와 상하부 수납장이 보이는 주방"],
  ["kitchen-counter", "주방 조리대", "조리대와 오븐이 보이는 주방"],
  ["laundry", "세탁 공간", "세탁기와 건조기가 위아래로 놓인 수납 공간"],
  ["main-bedroom", "침실", "침대와 발코니 쪽 창이 보이는 침실"],
  ["dressing-room", "드레스룸", "세면대 옆에서 바라본 드레스룸과 옷장"],
  ["child-bedroom", "아이 방", "침대와 작은 책상이 놓인 방"],
  ["study", "서재", "창가 책상과 선반이 있는 서재"],
  ["bathroom", "욕실", "욕조와 세면대, 수납장이 보이는 욕실"]
];
let photoIndex = 0;

const thumbnailButtons = photos.map(([file, title], index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", `${index + 1}. ${title}`);
  button.setAttribute("aria-pressed", String(index === photoIndex));

  const preview = document.createElement("img");
  preview.src = `${photoDirectory}${file}-thumb.webp`;
  preview.alt = "";
  preview.loading = "lazy";
  preview.decoding = "async";

  button.append(preview);
  button.addEventListener("click", () => showPhoto(index));
  thumbnails.append(button);
  return button;
});

function showPhoto(index) {
  photoIndex = (index + photos.length) % photos.length;
  const [file, title, description] = photos[photoIndex];
  galleryPhoto.src = `${photoDirectory}${file}.webp`;
  galleryPhoto.alt = description;
  galleryStatus.textContent = `${title} · ${photoIndex + 1} / ${photos.length}`;

  for (const [buttonIndex, button] of thumbnailButtons.entries()) {
    button.setAttribute("aria-pressed", String(buttonIndex === photoIndex));
  }
  const selected = thumbnailButtons[photoIndex];
  const left = selected.offsetLeft;
  const right = left + selected.offsetWidth;
  if (left < thumbnails.scrollLeft) {
    thumbnails.scrollLeft = left;
  } else if (right > thumbnails.scrollLeft + thumbnails.clientWidth) {
    thumbnails.scrollLeft = right - thumbnails.clientWidth;
  }
}

previousPhoto.addEventListener("click", () => showPhoto(photoIndex - 1));
nextPhoto.addEventListener("click", () => showPhoto(photoIndex + 1));
previousPhoto.hidden = false;
nextPhoto.hidden = false;
thumbnails.hidden = false;

const callbackForm = document.querySelector(".callback-form");
const endpoint = callbackForm.dataset.endpoint;
const callbackSubmit = callbackForm.querySelector('button[type="submit"]');
const callbackStatus = document.getElementById("callback-status");
const googleEndpoint = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;

if (googleEndpoint.test(endpoint)) {
  callbackForm.action = endpoint;
  callbackSubmit.disabled = false;
  callbackStatus.textContent = "";
}

callbackForm.addEventListener("submit", event => {
  if (callbackSubmit.disabled || !googleEndpoint.test(endpoint)) {
    event.preventDefault();
    return;
  }
  callbackSubmit.disabled = true;
  callbackStatus.textContent = "상담 신청을 전송하고 있습니다.";
});

window.addEventListener("pageshow", () => {
  if (googleEndpoint.test(endpoint)) {
    callbackSubmit.disabled = false;
    callbackStatus.textContent = "";
  }
});
