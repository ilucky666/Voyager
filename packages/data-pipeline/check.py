import json
with open(r'f:\LIBRARY\Studio\apps\voyager\public\geo\province-details.json', 'r', encoding='utf-8') as f:
    db = json.load(f)
with open(r'f:\LIBRARY\Studio\apps\voyager\public\geo\world-provinces.json', 'r', encoding='utf-8') as f:
    world_db = json.load(f)

missing = [f['properties'] for f in world_db['features'] if str(f['properties'].get('adcode', '')) not in db]
print(f'Truly Missing: {len(missing)}')
if len(missing) > 0:
    print(f'Samples: {[m.get("name") for m in missing[:10]]}')
