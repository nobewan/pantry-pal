import os
import torch
import torch.nn as nn
from torchvision import models

from torch.export import export
from executorch.backends.xnnpack.partition.xnnpack_partitioner import XnnpackPartitioner
from executorch.exir import to_edge_transform_and_lower

NUM_CLASSES = 12
CLASS_NAMES = [
    "fresh_apple","fresh_banana","fresh_bitter_gourd","fresh_capsicum","fresh_orange","fresh_tomato",
    "stale_apple","stale_banana","stale_bitter_gourd","stale_capsicum","stale_orange","stale_tomato"
]

def build_model(weights_path: str) -> torch.nn.Module:
    m = models.mobilenet_v2(weights=None)
    m.classifier[1] = nn.Linear(m.last_channel, NUM_CLASSES)
    sd = torch.load(weights_path, map_location="cpu")
    m.load_state_dict(sd)
    m.eval()
    return m

def main():
    weights_path = os.environ.get("PTH_PATH", "mobilenet_fruit.pth")
    out_path = os.environ.get("OUT_PTE", "fruit_quality_mnv2_xnnpack.pte")

    model = build_model(weights_path)

    # MobileNetV2 expects 224x224 crops (same as repo’s preprocessing)
    sample_inputs = (torch.randn(1, 3, 224, 224),)

    exported = export(model, sample_inputs)
    edge = to_edge_transform_and_lower(exported, partitioner=[XnnpackPartitioner()])
    et_prog = edge.to_executorch()

    with open(out_path, "wb") as f:
        et_prog.write_to_file(f)

    print("Wrote:", out_path)
    print("Classes:", CLASS_NAMES)

if __name__ == "__main__":
    main()
