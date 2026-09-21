import argparse
import json
import random
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs/assets/data/startup_presets.json"
OUTPUT = ROOT / "docs/assets/data/startup_scene.json"


def horizontal_gap(item, other, x):
    return abs(x - other["resolvedX"]) - item["width"] / 3840 - other["width"] / 3840


def phase_gap(item, other):
    return abs(item["phase"]["value"] - other["phase"]["value"])


def position_is_safe(item, x, selected):
    for other in selected:
        gap_x = horizontal_gap(item, other, x)
        gap_phase = phase_gap(item, other)
        required_x = 0.010 if item["size"] == other["size"] == "small" else 0.016
        if item["size"] == "large" or other["size"] == "large":
            required_x = 0.028
        if gap_x < required_x and gap_phase < 0.13:
            return False
    return True


def score_position(item, x, selected):
    if not selected:
        return 1.0
    nearest_x = min(abs(x - other["resolvedX"]) for other in selected)
    nearest_phase = min(phase_gap(item, other) for other in selected)
    edge_penalty = max(0.0, 0.055 - min(x, 1.0 - x)) * 3
    return nearest_x * 1.8 + nearest_phase * 0.35 - edge_penalty


def choose_position(item, selected, rng):
    offsets = [0.0, *item.get("safeOffsets", [])]
    rng.shuffle(offsets)
    positions = []
    for offset in offsets:
        x = round(item["x"] + offset, 4)
        if 0.025 <= x <= 0.975 and position_is_safe(item, x, selected):
            positions.append((score_position(item, x, selected), x, offset))
    if not positions:
        return None
    positions.sort(reverse=True)
    _, x, offset = positions[0]
    return x, offset


def desired_counts(target, candidates):
    available = Counter(item["size"] for item in candidates)
    ideal = {"large": round(target * 0.125), "medium": round(target * 0.625)}
    ideal["small"] = target - ideal["large"] - ideal["medium"]
    return {size: min(count, available[size]) for size, count in ideal.items()}


def select_items(candidates, target, rng):
    selected = []
    counts = Counter()
    desired = desired_counts(target, candidates)
    ordered = candidates[:]
    rng.shuffle(ordered)
    ordered.sort(key=lambda item: (item["size"] != "large", -item["quality"]))
    for strict_quota in (True, False):
        for source in ordered:
            if len(selected) >= target:
                break
            if any(item["id"] == source["id"] for item in selected):
                continue
            if strict_quota and counts[source["size"]] >= desired[source["size"]]:
                continue
            item = dict(source)
            position = choose_position(item, selected, rng)
            if position is None:
                continue
            item["resolvedX"], item["appliedOffset"] = position
            selected.append(item)
            counts[item["size"]] += 1
    return selected


def make_scene(data, preset_name, bank_index, seed):
    preset = data["presets"][preset_name]
    bank = preset["banks"][bank_index]
    target = preset["activeTarget"]
    rng = random.Random(f"{seed}:{preset_name}:{bank_index}")
    selected = select_items(bank["candidates"], target, rng)
    if len(selected) != target:
        raise ValueError(
            f"Could select only {len(selected)} of {target} safe streams "
            f"for {preset_name}/bank{bank_index}"
        )
    return {
        "version": 3,
        "key": f"{preset_name}-{bank['seed']}",
        "preset": preset_name,
        "bankIndex": bank_index,
        "bankSeed": bank["seed"],
        "sceneSeed": seed,
        "referenceViewport": data["referenceViewport"],
        "scaling": {
            "minStreams": max(40, target - 15),
            "targetStreams": target,
            "maxStreams": target + 20,
        },
        "streams": selected,
        "analysis": {
            "count": len(selected),
            "sizes": dict(Counter(item["size"] for item in selected)),
            "phases": dict(Counter(item["phase"]["zone"] for item in selected)),
            "runtimePlacementChecks": 0,
        },
    }


def choose_scene(preset_name, bank_index=None, seed=None):
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    if preset_name not in data["presets"]:
        raise SystemExit(f"Unknown preset: {preset_name}")
    rotation_seed = seed if seed is not None else 20260921
    ready_scenes = []
    for name, preset in data["presets"].items():
        for index in range(len(preset["banks"])):
            for attempt in range(100):
                try:
                    scene = make_scene(data, name, index, rotation_seed + attempt)
                    break
                except ValueError:
                    if attempt == 99:
                        raise
            ready_scenes.append(scene)
    scene_dir = OUTPUT.parent / "startup_scenes"
    scene_dir.mkdir(exist_ok=True)
    entries = []
    for scene in ready_scenes:
        filename = scene["key"] + ".json"
        (scene_dir / filename).write_text(json.dumps(scene, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        entries.append({"key": scene["key"], "file": "startup_scenes/" + filename})
    (OUTPUT.parent / "startup_scene_index.json").write_text(
        json.dumps({"version": 1, "scenes": entries}, separators=(",", ":")), encoding="utf-8")
    data["readyScenes"] = ready_scenes
    SOURCE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    choices = [scene for scene in ready_scenes if scene["preset"] == preset_name]
    if bank_index is not None:
        result = next(scene for scene in choices if scene["bankIndex"] == bank_index)
    else:
        target = data["presets"][preset_name]["activeTarget"]
        result = min(
            choices,
            key=lambda scene: (
                abs(scene["analysis"]["sizes"].get("large", 0) - round(target * 0.125))
                + abs(scene["analysis"]["sizes"].get("medium", 0) - round(target * 0.625))
            ),
        )
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Created: {OUTPUT}")
    print(f"Preset: {preset_name}")
    print(json.dumps(result["analysis"], indent=2, ensure_ascii=False))


def main():
    parser = argparse.ArgumentParser(description="Select a prevalidated Matrix startup scene")
    parser.add_argument("preset", nargs="?", default="balanced")
    parser.add_argument("--bank", type=int, choices=range(20))
    parser.add_argument("--seed", type=int)
    args = parser.parse_args()
    choose_scene(args.preset, args.bank, args.seed)


if __name__ == "__main__":
    main()
