import os
import json
import asyncio
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

# 初始化 API 客户端
# 请确保环境变量 GEMINI_API_KEY 已设置
try:
    client = genai.Client()
except Exception as e:
    print(f"初始化 API 失败，请设置环境变量 GEMINI_API_KEY: {e}")
    exit(1)

JOBS_DIR = r'C:\Users\asus\.gemini\antigravity\brain\7dead33a-72d5-45b4-9654-8c1de40c68ee\subagent_jobs'

class ProvinceDetails(BaseModel):
    summary: str = Field(description="一段约40-60字的中文旅行文案，使用充满感染力的散文或诗意风格，描述该地区的旅行特色、历史或自然风光。必须是纯文本。")
    attractions: list[str] = Field(description="3-5个该地区最著名的景点（中文名称，如果是国外景点可以附带英文原名）。不要只写宽泛的词，尽量具体。")
    experiences: list[str] = Field(description="2-3个该地区独特的旅行体验（如“在古城墙上漫步”、“品尝地道的XX美食”）。")

class BatchResponse(BaseModel):
    results: dict[str, ProvinceDetails] = Field(description="Key为adcode，Value为生成的旅行数据")

async def generate_chunk(chunk_idx: int) -> bool:
    chunk_file = os.path.join(JOBS_DIR, f'chunk_{chunk_idx}.json')
    result_file = os.path.join(JOBS_DIR, f'chunk_{chunk_idx}_result.json')
    
    if not os.path.exists(chunk_file):
        print(f"Chunk {chunk_idx} 不存在。")
        return False
        
    if os.path.exists(result_file):
        print(f"Chunk {chunk_idx} 已经生成完毕，跳过。")
        return True

    with open(chunk_file, 'r', encoding='utf-8') as f:
        provinces = json.load(f)
    
    if not provinces:
        print(f"Chunk {chunk_idx} 为空。")
        return True

    print(f"开始生成 Chunk {chunk_idx} ({len(provinces)} 个省份)...")
    
    prompt = f"""
    你是世界级旅行家。请为以下 {len(provinces)} 个省份/州/地区生成充满感染力的中文旅行指南数据。
    务必准确反映当地的历史、文化和风光。不要使用泛泛而谈的模板，必须针对每个地区量身定制！
    
    需要生成的省份列表：
    {json.dumps(provinces, ensure_ascii=False, indent=2)}
    """

    try:
        # 使用 gemini-2.5-flash 模型，速度快且质量高，支持 Structured Outputs
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=BatchResponse,
                temperature=0.7
            )
        )
        
        # 解析返回的 JSON
        data = json.loads(response.text)
        results = data.get("results", {})
        
        # 保存结果
        with open(result_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
            
        print(f"✅ Chunk {chunk_idx} 生成成功！")
        return True
    except Exception as e:
        print(f"❌ Chunk {chunk_idx} 生成失败: {e}")
        return False

async def main():
    # 我们有 chunk_35 到 chunk_169
    # 设置并发数为 5 以避免触发 Rate Limit
    CONCURRENCY_LIMIT = 5
    semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)
    
    async def bounded_generate(idx):
        async with semaphore:
            return await generate_chunk(idx)
            
    tasks = []
    for i in range(35, 170):
        tasks.append(bounded_generate(i))
        
    await asyncio.gather(*tasks)
    print("\n🎉 所有生成任务已完成！请使用 merge 脚本合并数据。")

if __name__ == "__main__":
    asyncio.run(main())
