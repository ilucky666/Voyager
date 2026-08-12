import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

def inspect_chunk(idx):
    path = f'C:\\Users\\asus\\.gemini\\antigravity\\brain\\7dead33a-72d5-45b4-9654-8c1de40c68ee\\subagent_jobs\\chunk_{idx}.json'
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"=== Chunk {idx} ({len(data)} items) ===")
    for i, item in enumerate(data):
        adcode = item.get('adcode')
        name = item.get('name')
        name_en = item.get('name_en') or item.get('nameEn')
        country = item.get('country')
        print(f"{i+1:2d}. {adcode:10s} | {name} ({name_en}) | {country}")

if __name__ == '__main__':
    idx = int(sys.argv[1]) if len(sys.argv) > 1 else 35
    inspect_chunk(idx)
