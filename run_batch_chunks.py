import json
import os
import sys
import traceback

sys.stdout.reconfigure(encoding='utf-8')

from generator_engine import generate_province_entry

JOBS_DIR = r'C:\Users\asus\.gemini\antigravity\brain\7dead33a-72d5-45b4-9654-8c1de40c68ee\subagent_jobs'
DETAILS_PATH = r'f:\LIBRARY\Studio\apps\voyager\public\geo\province-details.json'

def process_chunk(chunk_idx):
    chunk_file = os.path.join(JOBS_DIR, f'chunk_{chunk_idx}.json')
    result_file = os.path.join(JOBS_DIR, f'chunk_{chunk_idx}_result.json')

    if not os.path.exists(chunk_file):
        print(f"[SKIP] Chunk {chunk_idx} does not exist.")
        return False, "File not found"

    # Read input chunk
    with open(chunk_file, 'r', encoding='utf-8') as f:
        provinces = json.load(f)

    result_data = {}
    for item in provinces:
        adcode = item['adcode']
        entry = generate_province_entry(item)
        result_data[adcode] = entry

    # Save chunk result JSON
    with open(result_file, 'w', encoding='utf-8') as f:
        json.dump(result_data, f, ensure_ascii=False, indent=2)

    # Immediately merge into province-details.json
    with open(DETAILS_PATH, 'r', encoding='utf-8') as f:
        details = json.load(f)

    for adcode, data in result_data.items():
        if adcode in details:
            details[adcode]['summary'] = data['summary']
            details[adcode]['attractions'] = data['attractions']
            details[adcode]['experiences'] = data['experiences']
        else:
            details[adcode] = {
                "name": adcode,
                "nameEn": adcode,
                "country": "",
                "countryCode": adcode.split('-')[0],
                "summary": data['summary'],
                "attractions": data['attractions'],
                "heritage": [],
                "experiences": data['experiences']
            }

    with open(DETAILS_PATH, 'w', encoding='utf-8') as f:
        json.dump(details, f, ensure_ascii=False, indent=2)

    return True, len(result_data)

def main():
    start_chunk = 36
    end_chunk = 101
    processed_count = 0
    succeeded_chunks = []
    failed_chunks = []

    print(f"=== Starting sequential processing of chunks {start_chunk} to {end_chunk} ===")

    for i in range(start_chunk, end_chunk + 1):
        success = False
        error_msg = ""
        # Retry once if error
        for attempt in range(2):
            try:
                ok, info = process_chunk(i)
                if ok:
                    success = True
                    item_count = info
                    break
            except Exception as e:
                error_msg = str(e)
                print(f"[ATTEMPT {attempt+1} FAILED] Chunk {i}: {error_msg}")

        if success:
            processed_count += 1
            succeeded_chunks.append(i)
            print(f"[SUCCESS] Chunk {i:3d} processed & merged ({item_count} provinces)")
        else:
            failed_chunks.append((i, error_msg))
            print(f"[FAILED] Chunk {i:3d} after 2 attempts. Error: {error_msg}")

    print("\n================ FINAL REPORT ================")
    print(f"Total Chunks Processed: {processed_count} / {end_chunk - start_chunk + 1}")
    print(f"Succeeded Chunks ({len(succeeded_chunks)}): {succeeded_chunks}")
    print(f"Failed Chunks ({len(failed_chunks)}): {failed_chunks}")
    print("==============================================")

if __name__ == '__main__':
    main()
