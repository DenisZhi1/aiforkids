"""Reduce the embedded Barnaby GLB texture without changing mesh or animation data."""

from __future__ import annotations

import base64
import io
import json
import re
import struct
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
MODEL_SCRIPT = ROOT / "assets" / "models" / "runner-data.js"
URI_PATTERN = re.compile(
    r'window\.__BARNABY_RUNNER_URI="data:model/gltf-binary;base64,([A-Za-z0-9+/=]+)";'
)


def pad_four(data: bytes, fill: bytes) -> bytes:
    return data + fill * ((-len(data)) % 4)


source = MODEL_SCRIPT.read_text(encoding="utf-8")
match = URI_PATTERN.fullmatch(source.strip())
if not match:
    raise RuntimeError("Unexpected runner-data.js format")

glb = base64.b64decode(match.group(1))
if glb[:4] != b"glTF" or struct.unpack_from("<I", glb, 4)[0] != 2:
    raise RuntimeError("Runner asset is not a GLB 2.0 file")

json_length = struct.unpack_from("<I", glb, 12)[0]
json_start = 20
json_end = json_start + json_length
document = json.loads(glb[json_start:json_end].decode("utf-8").rstrip(" "))

bin_header = json_end
bin_length = struct.unpack_from("<I", glb, bin_header)[0]
bin_start = bin_header + 8
binary = glb[bin_start:bin_start + bin_length]

image_entry = next((entry for entry in document.get("images", []) if entry.get("mimeType") == "image/png"), None)
if image_entry is None:
    print("Runner texture is already optimized.")
    raise SystemExit(0)

view_index = image_entry["bufferView"]
image_view = document["bufferViews"][view_index]
image_offset = image_view.get("byteOffset", 0)
image_length = image_view["byteLength"]
image_end = image_offset + image_length

texture = Image.open(io.BytesIO(binary[image_offset:image_end]))
texture.load()
if texture.mode == "RGBA" and texture.getchannel("A").getextrema() != (255, 255):
    raise RuntimeError("Runner texture contains transparency and cannot be converted safely")

encoded_texture = io.BytesIO()
texture.convert("RGB").save(
    encoded_texture,
    format="JPEG",
    quality=88,
    optimize=True,
    subsampling="4:2:0",
)
jpeg = encoded_texture.getvalue()
jpeg_padded = pad_four(jpeg, b"\x00")
old_padded_length = (image_length + 3) & ~3
delta = len(jpeg_padded) - old_padded_length

new_binary = binary[:image_offset] + jpeg_padded + binary[image_offset + old_padded_length:]
image_view["byteLength"] = len(jpeg)
image_entry["mimeType"] = "image/jpeg"

for index, view in enumerate(document["bufferViews"]):
    if index != view_index and view.get("byteOffset", 0) >= image_offset + old_padded_length:
        view["byteOffset"] = view.get("byteOffset", 0) + delta

document["buffers"][0]["byteLength"] = len(new_binary)
json_bytes = pad_four(json.dumps(document, separators=(",", ":")).encode("utf-8"), b" ")
bin_bytes = pad_four(new_binary, b"\x00")

json_chunk = struct.pack("<I4s", len(json_bytes), b"JSON") + json_bytes
bin_chunk = struct.pack("<I4s", len(bin_bytes), b"BIN\x00") + bin_bytes
total_length = 12 + len(json_chunk) + len(bin_chunk)
optimized_glb = struct.pack("<4sII", b"glTF", 2, total_length) + json_chunk + bin_chunk
optimized_uri = base64.b64encode(optimized_glb).decode("ascii")
MODEL_SCRIPT.write_text(
    f'window.__BARNABY_RUNNER_URI="data:model/gltf-binary;base64,{optimized_uri}";\n',
    encoding="utf-8",
    newline="\n",
)

print(
    f"Runner model optimized: {len(glb) / 1024 / 1024:.2f} MB -> "
    f"{len(optimized_glb) / 1024 / 1024:.2f} MB"
)
