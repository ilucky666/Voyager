import os
import json
import glob

print("=== Merging AI Generated Chunks into Province Details ===")

JOBS_DIR = r'C:\Users\asus\.gemini\antigravity\brain\7dead33a-72d5-45b4-9654-8c1de40c68ee\subagent_jobs'
DB_PATH = r'f:\LIBRARY\Studio\apps\voyager\public\geo\province-details.json'

with open(DB_PATH, 'r', encoding='utf-8') as f:
    db = json.load(f)

merged_count = 0
for i in range(35, 170):
    result_file = os.path.join(JOBS_DIR, f'chunk_{i}_result.json')
    if os.path.exists(result_file):
        with open(result_file, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                for adcode, info in data.items():
                    if adcode in db:
                        db[adcode].update({
                            'summary': info.get('summary', ''),
                            'attractions': info.get('attractions', []),
                            'experiences': info.get('experiences', [])
                        })
                        merged_count += 1
            except Exception as e:
                print(f"解析 chunk_{i}_result.json 失败: {e}")

with open(DB_PATH, 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print(f"成功合并了 {merged_count} 条高质量 AI 生成数据到数据库中！")
