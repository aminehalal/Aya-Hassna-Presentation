"""PowerPoint export - step 3/3: Morph transitions between the steps of a scene.

PowerPoint's automation API has no constant for Morph in older type
libraries, so this writes the transition element exactly as PowerPoint saves
it (p159:morph inside mc:AlternateContent, with a fade fallback for older
versions) into every slide the manifest marks as "morph".

    python tools/pptx/set_morph.py export/with-videos.pptx export/manifest.json export/out.pptx
"""

import json
import re
import sys
import zipfile

src, manifest_path, dst = sys.argv[1:4]
manifest = json.load(open(manifest_path, encoding="utf-8"))
morph_slides = {m["slide"] for m in manifest if m["transition"] == "morph"}

MORPH = (
    '<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">'
    '<mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159">'
    '<p:transition spd="slow" xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" p14:dur="900">'
    '<p159:morph option="byObject"/></p:transition></mc:Choice>'
    '<mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback>'
    "</mc:AlternateContent>"
)
ALT_TRANSITION = re.compile(r"<mc:AlternateContent\b[^>]*>(?:(?!</mc:AlternateContent>).)*?<p:transition\b.*?</mc:AlternateContent>", re.S)
BARE_TRANSITION = re.compile(r"<p:transition\b[^>]*/>|<p:transition\b[^>]*>.*?</p:transition>", re.S)

# Map slide number -> part name using the presentation order
with zipfile.ZipFile(src) as z:
    pres_xml = z.read("ppt/presentation.xml").decode("utf-8")
    rels = z.read("ppt/_rels/presentation.xml.rels").decode("utf-8")
    rid_target = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"', rels))
    rid_target.update({k: v for v, k in re.findall(r'Target="([^"]+)"[^>]*Id="(rId\d+)"', rels)})
    order = re.findall(r'<p:sldId [^>]*r:id="(rId\d+)"', pres_xml)
    part_of = {i + 1: "ppt/" + rid_target[rid].lstrip("/").removeprefix("ppt/") for i, rid in enumerate(order)}

    changed = 0
    with zipfile.ZipFile(dst, "w") as out:
        for item in z.infolist():
            data = z.read(item.filename)
            number = next((n for n, part in part_of.items() if part == item.filename), None)
            if number in morph_slides:
                xml = data.decode("utf-8")
                xml = ALT_TRANSITION.sub("", xml)
                xml = BARE_TRANSITION.sub("", xml)
                anchor = xml.find("<p:timing")
                if anchor < 0:
                    anchor = xml.find("</p:sld>")
                xml = xml[:anchor] + MORPH + xml[anchor:]
                data = xml.encode("utf-8")
                changed += 1
            compress = zipfile.ZIP_STORED if item.filename.startswith("ppt/media/") else zipfile.ZIP_DEFLATED
            out.writestr(item, data, compress_type=compress)

print(f"morph transitions written on {changed} slides -> {dst}")
