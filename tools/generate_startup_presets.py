import argparse
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs/assets/data/startup_presets.json"
BASE_SEED = 20260921

PRESETS = {
    "dense": {"active": 86, "banks": 20, "sizes": {"small": 0.45, "medium": 0.40, "large": 0.15}},
    "balanced": {"active": 80, "banks": 20, "sizes": {"small": 0.35, "medium": 0.45, "large": 0.20}},
    "cinematic": {"active": 68, "banks": 20, "sizes": {"small": 0.25, "medium": 0.45, "large": 0.30}},
    "chaos": {"active": 90, "banks": 20, "sizes": {"small": 0.38, "medium": 0.37, "large": 0.25}},
    "minimal": {"active": 52, "banks": 20, "sizes": {"small": 0.50, "medium": 0.40, "large": 0.10}},
}

SIZE_DATA = {
    "small": {"font": (12, 16), "tail": (10, 18), "speed": (45, 80), "width": 18},
    "medium": {"font": (17, 22), "tail": (15, 24), "speed": (60, 100), "width": 32},
    "large": {"font": (23, 30), "tail": (20, 30), "speed": (75, 130), "width": 65},
}


def choose_size(rule, rng):
    value = rng.random()
    current = 0.0
    for name, chance in rule.items():
        current += chance
        if value <= current:
            return name
    return "medium"


def create_phase(rng):
    zone = rng.choice(["early", "middle", "late"])
    ranges = {"early": (0.05, 0.30), "middle": (0.35, 0.65), "late": (0.70, 0.95)}
    return {"zone": zone, "value": round(rng.uniform(*ranges[zone]), 4)}


def create_offsets(x):
    return [offset for offset in (-0.12, -0.08, -0.05, 0.05, 0.08, 0.12) if 0.03 < x + offset < 0.97]


def has_large_conflict(candidates, x):
    return sum(item["size"] == "large" and abs(item["x"] - x) < 0.14 for item in candidates) >= 2


def make_candidate(index, preset, rng, existing):
    size = choose_size(preset["sizes"], rng)
    x = round(rng.uniform(0.04, 0.96), 4)
    if size == "large" and has_large_conflict(existing, x):
        for _ in range(12):
            candidate_x = round(rng.uniform(0.04, 0.96), 4)
            if not has_large_conflict(existing, candidate_x):
                x = candidate_x
                break
        else:
            size = "medium"

    data = SIZE_DATA[size]
    return {
        "id": index, "size": size, "x": x, "phase": create_phase(rng),
        "fontSize": rng.randint(*data["font"]), "tailLength": rng.randint(*data["tail"]),
        "speed": rng.randint(*data["speed"]), "width": data["width"],
        "safeOffsets": create_offsets(x),
        "largeRisk": round(data["width"] / 100 * rng.uniform(0.8, 1.2), 3), "quality": 100,
    }


def create_bank(config, seed):
    rng = random.Random(seed)
    candidates = []
    for index in range(180):
        candidates.append(make_candidate(index, config, rng, candidates))

    # Финальный offline-проход: в любом окне шириной 0.15 оставляем
    # максимум два крупных потока.
    while True:
        large = sorted((item for item in candidates if item["size"] == "large"), key=lambda item: item["x"])
        cluster = next(
            (large[index:index + 3] for index in range(len(large) - 2) if large[index + 2]["x"] - large[index]["x"] < 0.15),
            None,
        )
        if cluster is None:
            break
        item = cluster[1]
        data = SIZE_DATA["medium"]
        item.update({
            "size": "medium", "fontSize": rng.randint(*data["font"]),
            "tailLength": rng.randint(*data["tail"]), "speed": rng.randint(*data["speed"]),
            "width": data["width"], "largeRisk": round(data["width"] / 100 * rng.uniform(0.8, 1.2), 3),
        })
    rng.shuffle(candidates)
    return {"seed": seed, "activeTarget": config["active"], "candidates": candidates}


def main():
    parser = argparse.ArgumentParser(description="Generate offline Matrix startup candidates")
    parser.add_argument("--seed", type=int, default=BASE_SEED)
    args = parser.parse_args()
    rng = random.Random(args.seed)
    result = {
        "version": 3, "generatorSeed": args.seed,
        "referenceViewport": {"width": 1920, "height": 1080},
        "usage": {"maxUses": 1, "regenerateInIdle": False}, "presets": {},
    }
    for name, config in PRESETS.items():
        result["presets"][name] = {
            "activeTarget": config["active"],
            "banks": [create_bank(config, rng.randint(100000, 999999)) for _ in range(config["banks"])],
        }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Created: {OUTPUT}")


if __name__ == "__main__":
    main()
