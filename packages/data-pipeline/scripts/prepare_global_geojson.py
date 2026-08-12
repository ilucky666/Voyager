import urllib.request
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

GEO_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'geo')
os.makedirs(GEO_DIR, exist_ok=True)

# 1. Download and process World Countries (admin-0)
print("Fetching world countries GeoJSON...")
url_countries = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson'
req = urllib.request.Request(url_countries, headers={'User-Agent': 'Mozilla/5.0'})

with urllib.request.urlopen(req) as resp:
    countries_data = json.loads(resp.read().decode('utf-8'))

out_countries = {
    "type": "FeatureCollection",
    "features": []
}

for feat in countries_data['features']:
    props = feat['properties']
    iso_a2 = props.get('iso_a2') or props.get('ISO_A2') or props.get('ADM0_A3') or props.get('SOV_A3')
    if not iso_a2 or iso_a2 == '-99':
        iso_a2 = props.get('ADM0_A3')
    
    name_zh = props.get('name_zh') or props.get('NAME_ZH') or props.get('name_en') or props.get('name')
    name_en = props.get('name_en') or props.get('name')
    
    # Calculate centroid / label coordinates
    geom = feat['geometry']
    lng = float(props.get('LABEL_X') or props.get('longitude') or 0.0)
    lat = float(props.get('LABEL_Y') or props.get('latitude') or 0.0)
    
    out_feat = {
        "type": "Feature",
        "properties": {
            "adcode": str(iso_a2),
            "name": name_zh,
            "name_en": name_en,
            "level": "country",
            "center": [lng, lat]
        },
        "geometry": geom
    }
    out_countries['features'].append(out_feat)

countries_file = os.path.join(GEO_DIR, 'world-countries.json')
with open(countries_file, 'w', encoding='utf-8') as f:
    json.dump(out_countries, f, ensure_ascii=False)

print(f"Saved {len(out_countries['features'])} countries to {countries_file}")

# 2. Download and process World States/Provinces (admin-1)
print("Fetching world states/provinces GeoJSON...")
url_states = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces_lakes.geojson'
req_states = urllib.request.Request(url_states, headers={'User-Agent': 'Mozilla/5.0'})

with urllib.request.urlopen(req_states) as resp:
    states_data = json.loads(resp.read().decode('utf-8'))

out_provinces = {
    "type": "FeatureCollection",
    "features": []
}

# First, load existing China provinces if available to keep detailed China boundaries & 6-digit adcodes
china_prov_file = os.path.join(GEO_DIR, 'provinces.json')
china_adcodes = set()

if os.path.exists(china_prov_file):
    with open(china_prov_file, 'r', encoding='utf-8') as f:
        china_geo = json.load(f)
        for f_cn in china_geo.get('features', []):
            f_cn['properties']['country'] = '中国'
            f_cn['properties']['countryCode'] = 'CN'
            f_cn['properties']['level'] = 'province'
            china_adcodes.add(str(f_cn['properties'].get('adcode')))
            out_provinces['features'].append(f_cn)
    print(f"Loaded {len(china_geo.get('features', []))} China provinces from local provinces.json")

# Add overseas states/provinces (excluding CN/China to avoid overlap)
overseas_count = 0
for feat in states_data['features']:
    props = feat['properties']
    iso_a2 = str(props.get('iso_a2') or props.get('adm0_a3') or '').upper()
    
    # Skip China from Natural Earth since we have high-res local China provinces
    if iso_a2 in ['CN', 'CHN']:
        continue
        
    code_3166 = props.get('iso_3166_2') or props.get('code_hasc') or props.get('adm1_code') or f"{iso_a2}-{props.get('name')}"
    name_zh = props.get('name_zh') or props.get('name_en') or props.get('name')
    name_en = props.get('name_en') or props.get('name')
    country_name = props.get('admin') or iso_a2
    
    lng = float(props.get('longitude') or 0.0)
    lat = float(props.get('latitude') or 0.0)
    
    out_feat = {
        "type": "Feature",
        "properties": {
            "adcode": str(code_3166),
            "name": name_zh,
            "name_en": name_en,
            "country": country_name,
            "countryCode": iso_a2,
            "level": "province",
            "center": [lng, lat]
        },
        "geometry": feat['geometry']
    }
    out_provinces['features'].append(out_feat)
    overseas_count += 1

world_prov_file = os.path.join(GEO_DIR, 'world-provinces.json')
with open(world_prov_file, 'w', encoding='utf-8') as f:
    json.dump(out_provinces, f, ensure_ascii=False)

print(f"Saved total {len(out_provinces['features'])} provinces ({overseas_count} overseas) to {world_prov_file}")
