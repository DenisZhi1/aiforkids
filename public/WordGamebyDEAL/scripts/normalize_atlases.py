from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"

SPECS = {
    "animals": 1.0,
    "home": 1.0,
    "food": 1.0,
    "places": 1.0,
    "actions": 1.0,
    "jobs": 1.0,
    "colours": 1.2,
    "weather": 1.2,
    "sports": 1.2,
    "transport": 1.2,
    "feelings": 1.2,
    "birthday": 1.2,
    "nature": 1.2,
}


def boundary_positions(image: Image.Image, horizontal: bool, expected: int) -> list[int]:
    pixels = image.load()
    primary = image.height if horizontal else image.width
    secondary = image.width if horizontal else image.height
    scores: list[float] = []

    for primary_index in range(primary):
        white = 0
        for secondary_index in range(secondary):
            x, y = (secondary_index, primary_index) if horizontal else (primary_index, secondary_index)
            red, green, blue = pixels[x, y]
            if min(red, green, blue) > 235 and max(red, green, blue) - min(red, green, blue) < 18:
                white += 1
        scores.append(white / secondary)

    boundaries = [0]
    cell_size = primary / expected
    radius = round(cell_size * 0.22)
    for index in range(1, expected):
        expected_position = round(index * cell_size)
        start = max(boundaries[-1] + 10, expected_position - radius)
        end = min(primary - 10, expected_position + radius)
        boundary = max(range(start, end + 1), key=lambda position: scores[position])
        boundaries.append(boundary)
    boundaries.append(primary - 1)
    return boundaries


def cell_ranges(boundaries: list[int], expected: int, limit: int) -> list[tuple[int, int]]:
    if len(boundaries) != expected + 1:
        raise ValueError(f"Expected {expected + 1} grid boundaries, found {len(boundaries)}: {boundaries}")

    ranges = []
    for index in range(expected):
        start = boundaries[index] + 3
        end = boundaries[index + 1] - 2
        if end - start < 20:
            raise ValueError(f"Invalid cell range: {(start, end)}")
        ranges.append((start, end))
    return ranges


def normalize(name: str, ratio: float) -> None:
    source_path = ASSETS / f"{name}-atlas.webp"
    output_path = ASSETS / f"{name}-atlas-clean.webp"
    source = Image.open(source_path).convert("RGB")

    column_boundaries = boundary_positions(source, horizontal=False, expected=5)
    row_boundaries = boundary_positions(source, horizontal=True, expected=4)
    columns = cell_ranges(column_boundaries, 5, source.width)
    rows = cell_ranges(row_boundaries, 4, source.height)

    cell_size = (280, 280) if ratio == 1 else (300, 250)
    output = Image.new("RGB", (cell_size[0] * 5, cell_size[1] * 4), (255, 246, 220))

    for row, (top, bottom) in enumerate(rows):
        for column, (left, right) in enumerate(columns):
            cell = source.crop((left, top, right, bottom))
            fitted = ImageOps.fit(cell, cell_size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
            output.paste(fitted, (column * cell_size[0], row * cell_size[1]))

    output.save(output_path, "WEBP", quality=90, method=6)
    print(f"{source_path.name} -> {output_path.name}; columns={columns}; rows={rows}")


for atlas_name, cell_ratio in SPECS.items():
    normalize(atlas_name, cell_ratio)
