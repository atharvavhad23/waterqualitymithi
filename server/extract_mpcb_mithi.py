from __future__ import annotations

import csv
import re
from pathlib import Path

import camelot

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "data" / "sources" / "MPCB_Mithi_River.pdf"
OUTPUT = ROOT / "data" / "real_mithi_water_quality.csv"
SOURCE_DOCUMENT = "MPCB_Mithi_River.pdf"
SOURCE_URL = "https://www.mpcb.gov.in/sites/default/files/Establishment%20of%20MPCB/Seniority%20list/2014/Mithi%20River.pdf"
STATION = "2168 - Mithi River near Road bridge, Village- Mahim, Taluka- Bandra, District- Mumbai"
MONTHS = {
    "January": "01", "February": "02", "March": "03", "April": "04",
    "May": "05", "June": "06", "July": "07", "August": "08",
    "September": "09", "October": "10", "November": "11", "December": "12",
}
PARAMETERS = [
    ("pH", "pH", "", 2),
    ("DO", "DO", "mg/L", 3),
    ("BOD", "BOD", "mg/L", 4),
    ("FC", "fecal_coliform", "MPN/100 mL", 5),
    ("TC", "total_coliform", "MPN/100 mL", 6),
]


def clean(value: str) -> str:
    return " ".join(str(value).replace("\n", " ").split()).strip()


def parse_value(raw: str):
    text = clean(raw)
    if not text or text.upper() in {"NA", "N/A", "-"}:
        return "", "missing"
    qualifier = ""
    if "BDL" in text.upper():
        qualifier = "BDL"
    number = re.search(r"[-+]?\d+(?:\.\d+)?", text)
    if not number:
        return "", qualifier or "non_numeric"
    return number.group(0), qualifier


def extract():
    tables = camelot.read_pdf(str(PDF), pages="1-3", flavor="lattice")
    rows = []
    for table in tables:
        current_month = None
        for raw_row in table.df.values.tolist():
            cells = [clean(cell) for cell in raw_row]
            if not cells or len(cells) < 7:
                continue
            if cells[0] in MONTHS:
                current_month = cells[0]
            year_match = re.fullmatch(r"20\d{2}", cells[1])
            if not current_month or not year_match:
                continue
            year = cells[1]
            period = f"{year}-{MONTHS[current_month]}"
            for source_name, parameter, unit, index in PARAMETERS:
                value, qualifier = parse_value(cells[index])
                if not value and qualifier == "missing":
                    continue
                rows.append({
                    "record_id": f"MPCB-MITHI-{period}-{parameter}",
                    "date": period,
                    "station": STATION,
                    "latitude": "",
                    "longitude": "",
                    "parameter": parameter,
                    "value": value,
                    "unit": unit,
                    "source_document": SOURCE_DOCUMENT,
                    "source_url": SOURCE_URL,
                    "source_page": str(table.page),
                    "source_table": "Latest Water Quality as per Assessment Targeted (Characteristics of River)",
                    "method": "Not reported in source",
                    "qa_flag": "verified_source_value",
                    "qualifier": qualifier,
                    "notes": f"MPCB source row: {current_month} {year}; water quality status: {cells[7] if len(cells) > 7 else ''}",
                })
    with OUTPUT.open("w", newline="", encoding="utf-8") as handle:
        fieldnames = list(rows[0].keys()) if rows else [
            "record_id", "date", "station", "latitude", "longitude", "parameter", "value", "unit",
            "source_document", "source_url", "source_page", "source_table", "method", "qa_flag", "qualifier", "notes"
        ]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Extracted {len(rows)} long-format measurement rows from {len(tables)} PDF tables.")
    print(f"Output: {OUTPUT}")


if __name__ == "__main__":
    extract()
