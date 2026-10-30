"""Build llm-forecast-upload/index.html: the llm-forecast page as one self-contained file.

Inlines d3, the runtime and both CSV data sets so the page renders when opened
directly or uploaded on its own. Run from the repository root:

    python3 scripts/build_single_file.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "llm-forecast"
OUT = ROOT / "llm-forecast-upload" / "index.html"


def read(path):
    return (SITE / path).read_text(encoding="utf-8")


def main():
    page = read("index.html")
    d3js = read("vendor/d3.v7.9.0.min.js").strip()
    license_text = read("vendor/LICENSE-d3.txt").strip()
    runtime = read("runtime.js")
    models = read("data/models.csv").strip()
    forecast = read("data/forecast.csv").strip()
    for text in (d3js, runtime, models, forecast):
        if "</script" in text.lower():
            raise SystemExit("inlined text contains </script")

    # The runtime reads the CSV blocks embedded in the page instead of fetching files.
    start = runtime.index("  Object.keys(SOURCES).forEach((id) => {\n    fetch(")
    end = runtime.index("  let width")
    embedded = (
        "  Object.keys(SOURCES).forEach((id) => {\n"
        "    const node = document.getElementById(SOURCES[id]);\n"
        "    try {\n"
        "      if (!node) throw new Error('missing data block');\n"
        "      state[id] = { status: 'ok', data: d3.csvParse(node.textContent.trim()) };\n"
        "    } catch (e) {\n"
        "      state[id] = { status: 'error', data: [], message: String(e) };\n"
        "    }\n"
        "  });\n\n"
    )
    runtime = runtime[:start] + embedded + runtime[end:]
    runtime = runtime.replace(
        "const SOURCES = { models: 'data/models.csv', forecast: 'data/forecast.csv' };",
        "const SOURCES = { models: 'data-models', forecast: 'data-forecast' };",
    )
    runtime = runtime.replace(
        "// loads the CSV files in data/, runs registered calculations, and calls the",
        "// reads the CSV blocks embedded in this file, runs registered calculations, and calls the",
    )
    if "fetch(" in runtime:
        raise SystemExit("runtime still fetches")

    inline = (
        '<script id="data-models" type="text/csv">\n' + models + "\n</script>\n"
        '<script id="data-forecast" type="text/csv">\n' + forecast + "\n</script>\n"
        "<script>\n/*\n" + license_text + "\n*/\n" + d3js + "\n</script>\n"
        "<script>\n" + runtime.strip() + "\n</script>"
    )
    tags = '<script src="vendor/d3.v7.9.0.min.js"></script>\n<script src="runtime.js"></script>'
    if page.count(tags) != 1:
        raise SystemExit("script tags not found in page")
    page = page.replace(tags, inline, 1)
    note = "データは data/models.csv と data/forecast.csv にあります。"
    if page.count(note) != 1:
        raise SystemExit("data note not found in page")
    page = page.replace(
        note,
        'データはこのHTMLファイルの先頭近く（id="data-models" と id="data-forecast" のブロック）にCSV形式で入っています。',
        1,
    )
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(page, encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({len(page.encode('utf-8')):,} bytes)")


if __name__ == "__main__":
    main()
