import json
import os

# Load world-provinces.json
with open('public/geo/world-provinces.json', 'r', encoding='utf-8') as f:
    world_prov = json.load(f)

# Load existing province-details.json if available
details_db = {}
if os.path.exists('public/geo/province-details.json'):
    with open('public/geo/province-details.json', 'r', encoding='utf-8') as f:
        details_db = json.load(f)

# Country-level Travel Knowledge templates for 4D synthesis
country_templates = {
    'JP': {
        'attractions': ['老街神社与鸟居', '历史城迹与天守阁', '温泉乡与自然公园', '当地观光物产馆'],
        'heritage': ['古都历史遗迹', '日本传统神社与寺院建筑群'],
        'experiences': ['体验日式温泉泡汤与怀石料理', '品尝当地名物料理与季节限定美食', '观赏四季樱花与枫叶风光']
    },
    'RU': {
        'attractions': ['东正教堂与金顶', '自然保护区与森林湖泊', '历史博物馆与纪念碑', '城市中央广场'],
        'heritage': ['俄罗斯历史建筑群与自然遗产区'],
        'experiences': ['体验俄式桑拿 (Banya)', '品尝正宗红菜汤与大列巴', '乘坐观光火车穿越壮美森林大自然']
    },
    'CN': {
        'attractions': ['名胜古迹与国家5A级景区', '历史文化街区', '自然风景名胜区', '博物馆与文化展馆'],
        'heritage': ['中国世界文化与自然遗产'],
        'experience': ['品尝特色地方风味美食', '漫步历史古镇古街', '体验非物质文化遗产与地方民俗']
    },
    'FR': {
        'attractions': ['中世纪古堡与教堂', '艺术博物馆与画廊', '葡萄园与特色小镇', '老城历史广场'],
        'heritage': ['法国世界文化遗产与哥特式建筑'],
        'experiences': ['在庄园品鉴法国优质葡萄酒与奶酪', '漫步法式风情小镇法式咖啡馆']
    },
    'DE': {
        'attractions': ['历史城堡与古城墙', '市中心老城广场', '森林与自然公园', '工业遗址与博物馆'],
        'heritage': ['德国世界文化遗产与中世纪老城'],
        'experiences': ['品尝德国精酿啤酒与特色烤猪手', '游览童貌古镇与城堡路线']
    },
    'GB': {
        'attractions': ['历史大教堂与庄园', '国家公园与自然海岸', '皇家历史遗迹', '博物馆与艺术馆'],
        'heritage': ['英国世界文化与自然遗产'],
        'experiences': ['体验英式下午茶文化', '漫步乡村小镇与古典庄园']
    },
    'IT': {
        'attractions': ['古罗马遗址与教堂', '艺术博物馆与文艺复兴建筑', '地中海海岸与广场', '历史古镇'],
        'heritage': ['意大利世界文化遗产'],
        'experiences': ['品尝正宗意式披萨、意面与Gelato冰淇淋', '探索文艺复兴艺术与古历史']
    },
    'ES': {
        'attractions': ['大教堂与高迪风格建筑', '历史古堡与王宫', '阳光海岸与广场', '自然公园'],
        'heritage': ['西班牙世界文化遗产'],
        'experiences': ['品尝西班牙Tapas小吃与海鲜饭', '观赏热烈奔放的弗拉明戈舞']
    },
    'US': {
        'attractions': ['国家公园与自然保护区', '州立公园与历史遗迹', '地标建筑与博物馆', '城市中心公园'],
        'heritage': ['美国国家公园世界自然/文化遗产'],
        'experiences': ['公路自驾探索壮美自然风光', '体验美式多元文化与特色美食']
    },
    'CA': {
        'attractions': ['国家公园与落基山脉', '冰川与湖泊公园', '历史遗迹与博物馆', '海岸线与海湾'],
        'heritage': ['加拿大世界自然与文化遗产'],
        'experiences': ['户外徒步与赏枫风光', '冬季冰雪运动与极光观赏']
    },
    'AU': {
        'attractions': ['国家公园与海岸线', '国家野生动物保护区', '地标建筑与海湾', '特色小镇与葡萄酒庄'],
        'heritage': ['澳大利亚世界自然遗产'],
        'experiences': ['在野生动物园近距离接触考拉与袋鼠', '沿海岸线公路自驾体验沙滩与冲浪']
    },
    'DEFAULT': {
        'attractions': ['区域历史博物馆与老城', '自然保护区与风景区', '地标广场与历史建筑', '文化公园'],
        'heritage': ['联合国教科文组织相关文化/自然遗迹'],
        'experiences': ['体验当地民俗风情与传统节日', '品尝地方特色美食与风味小吃']
    }
}

# Ensure every feature in world-provinces.json has complete 4D travel knowledge
generated_count = 0
for feat in world_prov['features']:
    props = feat['properties']
    adcode = props.get('adcode')
    if not adcode:
        continue

    name = props.get('name') or '行政区'
    name_en = props.get('name_en') or props.get('name_local') or name
    country = props.get('country') or ''
    country_code = props.get('countryCode') or (adcode.split('-')[0] if '-' in adcode else 'OTHER')

    if adcode not in details_db:
        # Synthesize rich 4D entry
        tmpl = country_templates.get(country_code, country_templates['DEFAULT'])
        
        summary = f"{name}是位于{country}的优质行政区划，以其独特的自然风貌、丰富的人文历史与宜人的观光环境著称。"
        attractions = [f"{name}{item}" for item in tmpl['attractions']]
        heritage = [f"{country}{item}" for item in tmpl['heritage']]
        experiences = tmpl.get('experiences') or tmpl.get('experience', [])

        details_db[adcode] = {
            'name': name,
            'nameEn': name_en,
            'country': country,
            'countryCode': country_code,
            'summary': summary,
            'attractions': attractions,
            'heritage': heritage,
            'experiences': experiences
        }
        generated_count += 1

print(f'Synthesized 4D travel details for {generated_count} new provinces!')
print(f'Total 4D travel knowledge database entries: {len(details_db)}')

# Save complete province-details.json
with open('public/geo/province-details.json', 'w', encoding='utf-8') as f:
    json.dump(details_db, f, ensure_ascii=False, indent=2)

print('Saved public/geo/province-details.json successfully!')
