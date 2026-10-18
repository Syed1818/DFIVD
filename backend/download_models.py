import os
import urllib.request

import torch
from huggingface_hub import hf_hub_download


BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BACKEND_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

ASSETS = {
    "efficientnet_b0_ffpp_c23.pth": "https://huggingface.co/Xicor9/efficientnet-b0-ffpp-c23/resolve/main/efficientnet_b0_ffpp_c23.pth",
    "deploy.prototxt": "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt",
    "res10_300x300_ssd_iter_140000.caffemodel": "https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel",
}


def download_file(url, destination):
    if os.path.exists(destination) and os.path.getsize(destination) > 1000:
        print(f"Already present: {os.path.basename(destination)}")
        return
    print(f"Downloading {os.path.basename(destination)}...")
    urllib.request.urlretrieve(url, destination)


for filename, url in ASSETS.items():
    download_file(url, os.path.join(MODELS_DIR, filename))

print("Downloading DAViD checkpoints...")
repo = "aitf-its-tim3-dfk/david-encoder"
encoder_source = hf_hub_download(repo, "k400_clip_complete_finetuned_30_epochs.pth")
classifier_source = hf_hub_download(repo, "best_detector_model.pt")

classifier_destination = os.path.join(MODELS_DIR, "best_detector_model.pt")
if not os.path.exists(classifier_destination):
    urllib.request.urlretrieve(classifier_source, classifier_destination)

clean_destination = os.path.join(MODELS_DIR, "david_encoder_clean.pth")
if not os.path.exists(clean_destination):
    print("Preparing cleaned DAViD encoder checkpoint...")
    checkpoint = torch.load(encoder_source, map_location="cpu", weights_only=False)
    state = checkpoint.get("model", checkpoint.get("state_dict", checkpoint))
    state = {key.replace("module.", ""): value for key, value in state.items()}
    state = {key: value for key, value in state.items() if not key.startswith("prompt_learner.")}
    torch.save(state, clean_destination)

print(f"Model assets are ready in {MODELS_DIR}")
