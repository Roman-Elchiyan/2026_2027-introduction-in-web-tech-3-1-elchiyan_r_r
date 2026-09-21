import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRESETS = ROOT / "docs/assets/data/startup_presets.json"
SCENE = ROOT / "docs/assets/data/startup_scene.json"
SIZES = {"small", "medium", "large"}
PHASES = {"early", "middle", "late"}


def check_candidate(item, label):
    errors = []
    required = {"id", "size", "x", "phase", "fontSize", "tailLength", "speed", "width", "safeOffsets"}
    missing = required - item.keys()
    if missing:
        errors.append(f"{label}: missing {sorted(missing)}")
        return errors
    if item["size"] not in SIZES:
        errors.append(f"{label}: invalid size {item['size']}")
    if item["phase"].get("zone") not in PHASES or not 0 < item["phase"].get("value", -1) < 1:
        errors.append(f"{label}: invalid phase")
    if not 0 < item["x"] < 1:
        errors.append(f"{label}: x outside viewport")
    for offset in item["safeOffsets"]:
        if not 0.03 < item["x"] + offset < 0.97:
            errors.append(f"{label}: unsafe offset {offset}")
    return errors


def large_clusters(items):
    ordered = sorted((item for item in items if item["size"] == "large"), key=lambda item: item["x"])
    return [ordered[i:i + 3] for i in range(len(ordered) - 2) if ordered[i + 2]["x"] - ordered[i]["x"] < 0.15]


def scene_conflicts(items):
    problems = []
    for index, item in enumerate(items):
        x = item.get("resolvedX", item["x"])
        for other in items[index + 1:]:
            other_x = other.get("resolvedX", other["x"])
            gap = abs(x - other_x) - item["width"] / 3840 - other["width"] / 3840
            required = 0.010 if item["size"] == other["size"] == "small" else 0.016
            if item["size"] == "large" or other["size"] == "large":
                required = 0.028
            phase_gap = abs(item["phase"]["value"] - other["phase"]["value"])
            if gap < required and phase_gap < 0.13:
                problems.append((item["id"], other["id"]))
    return problems


def main():
    errors = []
    data = json.loads(PRESETS.read_text(encoding="utf-8"))
    if data.get("version") != 3:
        errors.append("startup_presets.json: expected version 3")
    for preset_name, preset in data.get("presets", {}).items():
        for bank_index, bank in enumerate(preset.get("banks", [])):
            items = bank.get("candidates", [])
            for item_index, item in enumerate(items):
                errors.extend(check_candidate(item, f"{preset_name}/bank{bank_index}/item{item_index}"))
            clusters = large_clusters(items)
            print(f"{preset_name} bank {bank_index}: candidates={len(items)}, large_clusters={len(clusters)}")

    ready_scenes = data.get("readyScenes", [])
    if len(ready_scenes) != 100:
        errors.append(f"startup_presets.json: {len(ready_scenes)} ready scenes, expected 100")
    for scene_index, ready_scene in enumerate(ready_scenes):
        ready_streams = ready_scene.get("streams", [])
        ready_expected = ready_scene.get("scaling", {}).get("targetStreams")
        if len(ready_streams) != ready_expected:
            errors.append(f"readyScenes/{scene_index}: {len(ready_streams)} streams, expected {ready_expected}")
        ready_conflicts = scene_conflicts(ready_streams)
        if ready_conflicts:
            errors.append(f"readyScenes/{scene_index}: {len(ready_conflicts)} placement conflicts")

    scene = json.loads(SCENE.read_text(encoding="utf-8"))
    streams = scene.get("streams", [])
    expected = scene.get("scaling", {}).get("targetStreams")
    if scene.get("version") != 3:
        errors.append("startup_scene.json: expected version 3")
    if len(streams) != expected:
        errors.append(f"startup_scene.json: {len(streams)} streams, expected {expected}")
    for index, item in enumerate(streams):
        errors.extend(check_candidate(item, f"scene/item{index}"))
        if not 0.025 <= item.get("resolvedX", -1) <= 0.975:
            errors.append(f"scene/item{index}: invalid resolvedX")
    conflicts = scene_conflicts(streams)
    if conflicts:
        errors.append(f"startup_scene.json: {len(conflicts)} placement conflicts")

    sizes = Counter(item["size"] for item in streams)
    phases = Counter(item["phase"]["zone"] for item in streams)
    print(f"Scene: streams={len(streams)}, sizes={dict(sizes)}, phases={dict(phases)}, conflicts={len(conflicts)}")
    print(f"Ready scenes: {len(ready_scenes)}")
    print(f"Bad offsets: {sum('unsafe offset' in error for error in errors)}")
    if errors:
        print("\n".join(errors[:30]), file=sys.stderr)
        raise SystemExit(1)
    print("Validation: OK")


if __name__ == "__main__":
    main()
